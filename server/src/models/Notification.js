import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  message: { type: String, default: '' },
  type:    { type: String, enum: ['order', 'contact', 'review', 'system'], default: 'system' },
  link:    { type: String, default: '' },   // relative path, e.g. /admin/orders
  isRead:  { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
