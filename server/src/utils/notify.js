import Notification from '../models/Notification.js';

export const createNotification = async ({ title, message = '', type = 'system', link = '' }) => {
  try {
    await Notification.create({ title, message, type, link });
  } catch (e) {
    console.error('[notify] Failed to create notification:', e.message);
  }
};
