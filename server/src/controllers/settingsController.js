import Settings from '../models/Settings.js';

// Settings change rarely but are read on most page loads. Cache values in memory
// with a short TTL and invalidate on write to avoid a DB round-trip per request.
const TTL_MS = 60 * 1000;
const cache = new Map(); // key -> { value, expires }

export const getSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
      res.set('Cache-Control', 'public, max-age=60');
      return res.json({ status: 'success', data: { value: cached.value } });
    }

    const doc = await Settings.findOne({ key }).lean();
    const value = doc?.value ?? '';
    cache.set(key, { value, expires: Date.now() + TTL_MS });
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ status: 'success', data: { value } });
  } catch (err) {
    next(err);
  }
};

export const upsertSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const doc = await Settings.findOneAndUpdate(
      { key },
      { value: req.body.value ?? '' },
      { upsert: true, new: true }
    );
    cache.set(key, { value: doc.value, expires: Date.now() + TTL_MS });
    res.json({ status: 'success', data: { value: doc.value } });
  } catch (err) {
    next(err);
  }
};
