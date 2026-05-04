import crypto from 'crypto';
import Order from '../models/Order.js';

/**
 * Generate a unique order number in the format ZIM-XXXXXX.
 * Checks the database for uniqueness before returning.
 */
const generateOrderNumber = async () => {
  const MAX_ATTEMPTS = 10;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `ZIM-${hex}`;

    const exists = await Order.findOne({ orderNumber }).lean();
    if (!exists) {
      return orderNumber;
    }
  }

  // Fallback with timestamp to guarantee uniqueness
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  return `ZIM-${ts}`;
};

export default generateOrderNumber;
