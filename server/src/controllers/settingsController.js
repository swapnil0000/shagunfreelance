import Settings from '../models/Settings.js';

export const getSetting = async (req, res, next) => {
  try {
    const doc = await Settings.findOne({ key: req.params.key });
    res.json({ status: 'success', data: { value: doc?.value ?? '' } });
  } catch (err) {
    next(err);
  }
};

export const upsertSetting = async (req, res, next) => {
  try {
    const doc = await Settings.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value ?? '' },
      { upsert: true, new: true }
    );
    res.json({ status: 'success', data: { value: doc.value } });
  } catch (err) {
    next(err);
  }
};
