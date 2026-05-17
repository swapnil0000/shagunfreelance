import ContactMessage from '../models/ContactMessage.js';
import AppError from '../utils/AppError.js';
import { sendContactEmails } from '../utils/email.js';

/**
 * POST /api/contact
 */
export const createMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const contactMessage = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
      isRead: false,
    });

    // Send notification to admin + auto-reply to customer (non-blocking)
    sendContactEmails({ name, email, phone, subject, message });

    res.status(201).json({
      status: 'success',
      message: 'Your message has been sent successfully',
      data: { contactMessage },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/contact (admin)
 */
export const getAllMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ status: 'success', data: { messages } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/contact/:id/read (admin)
 */
export const markAsRead = async (req, res, next) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    res.status(200).json({ status: 'success', data: { message } });
  } catch (error) {
    next(error);
  }
};
