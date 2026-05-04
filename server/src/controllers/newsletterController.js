import Newsletter from '../models/Newsletter.js';
import AppError from '../utils/AppError.js';

/**
 * POST /api/newsletter/subscribe
 */
export const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.isSubscribed) {
        return res.status(200).json({
          status: 'success',
          message: 'You are already subscribed to our newsletter',
        });
      }
      // Re-subscribe
      existing.isSubscribed = true;
      await existing.save();
      return res.status(200).json({
        status: 'success',
        message: 'Successfully re-subscribed to our newsletter',
      });
    }

    await Newsletter.create({ email });

    res.status(201).json({
      status: 'success',
      message: 'Successfully subscribed to our newsletter',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/newsletter (admin)
 */
export const getAllSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ status: 'success', data: { subscribers } });
  } catch (error) {
    next(error);
  }
};
