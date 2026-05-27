import Notification from '../models/Notification.js';
import EmailTemplate from '../models/EmailTemplate.js';
import { sendEmail } from '../utils/email.js';

// ─── Default templates seeded on first fetch ─────────────────────────────────

const DEFAULT_TEMPLATES = [
  {
    name: 'order-confirmation',
    label: 'Order Confirmation',
    subject: 'Order Confirmed — {{orderNumber}}',
    body: `<h2>Order Confirmed — {{orderNumber}}</h2>
<p>Hi {{customerName}}, your order has been confirmed.</p>
<p><strong>Total:</strong> ₹{{total}}</p>
<p>Thank you for shopping with Zimor India!</p>
<p style="margin-top:16px;font-size:12px;color:#666;">Zimor India | support@zimorindia.com</p>`,
    variables: ['orderNumber', 'customerName', 'total', 'itemsHtml'],
  },
  {
    name: 'order-status-update',
    label: 'Order Status Update',
    subject: 'Order {{orderNumber}} — Status Updated',
    body: `<h2>Order Update — {{orderNumber}}</h2>
<p>Hi {{customerName}},</p>
<p>Your order status has been updated to: <strong>{{status}}</strong>.</p>
<p>— Zimor India</p>`,
    variables: ['orderNumber', 'customerName', 'status'],
  },
  {
    name: 'welcome',
    label: 'Welcome Email',
    subject: 'Welcome to Zimor India, {{customerName}}!',
    body: `<h2>Welcome to Zimor India!</h2>
<p>Hi {{customerName}},</p>
<p>Thank you for creating an account. Explore our exclusive handbag collection.</p>
<p>Happy Shopping! — Zimor India</p>`,
    variables: ['customerName'],
  },
  {
    name: 'password-reset',
    label: 'Password Reset',
    subject: 'Zimor India — Password Reset',
    body: `<h2>Password Reset Request</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{resetUrl}}">{{resetUrl}}</a></p>
<p>This link expires in 1 hour.</p>
<p>— Zimor India</p>`,
    variables: ['resetUrl'],
  },
  {
    name: 'refund-processed',
    label: 'Refund Processed',
    subject: 'Refund Processed — Order {{orderNumber}}',
    body: `<h2>Refund Confirmation</h2>
<p>Hi {{customerName}},</p>
<p>Your refund of <strong>₹{{amount}}</strong> for order {{orderNumber}} has been processed.</p>
<p>It will reflect in your account within 5–7 business days.</p>
<p>— Zimor India</p>`,
    variables: ['orderNumber', 'customerName', 'amount'],
  },
];

async function seedDefaults() {
  for (const tpl of DEFAULT_TEMPLATES) {
    await EmailTemplate.findOneAndUpdate(
      { name: tpl.name },
      { $setOnInsert: tpl },
      { upsert: true, new: false },
    );
  }
}

// ─── Email Template CRUD ──────────────────────────────────────────────────────

export const listEmailTemplates = async (req, res, next) => {
  try {
    await seedDefaults();
    const templates = await EmailTemplate.find().sort({ name: 1 }).select('-body');
    res.json({ status: 'success', data: { templates } });
  } catch (e) { next(e); }
};

export const getEmailTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ status: 'error', message: 'Template not found' });
    res.json({ status: 'success', data: { template } });
  } catch (e) { next(e); }
};

export const updateEmailTemplate = async (req, res, next) => {
  try {
    const { subject, body } = req.body;
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ status: 'error', message: 'Template not found' });
    if (subject !== undefined) template.subject = subject;
    if (body    !== undefined) template.body    = body;
    await template.save();
    res.json({ status: 'success', data: { template } });
  } catch (e) { next(e); }
};

export const resetEmailTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ status: 'error', message: 'Template not found' });
    const def = DEFAULT_TEMPLATES.find((t) => t.name === template.name);
    if (def) {
      template.subject = def.subject;
      template.body    = def.body;
      await template.save();
    }
    res.json({ status: 'success', data: { template } });
  } catch (e) { next(e); }
};

export const sendTestEmail = async (req, res, next) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ status: 'error', message: 'Recipient email required' });
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ status: 'error', message: 'Template not found' });

    // Replace placeholders with sample values
    const sample = {
      orderNumber: 'ZIM-2024-0001',
      customerName: 'Test Customer',
      total: '2500.00',
      amount: '2500.00',
      status: 'Shipped',
      resetUrl: 'https://zimorindia.com/reset-password/sample-token',
      itemsHtml: '<p>Sample Product × 1 — ₹2500</p>',
    };
    let subject = template.subject;
    let body    = template.body;
    Object.entries(sample).forEach(([k, v]) => {
      subject = subject.replaceAll(`{{${k}}}`, v);
      body    = body.replaceAll(`{{${k}}}`, v);
    });

    await sendEmail({ to, subject, html: body });
    res.json({ status: 'success', message: `Test email sent to ${to}` });
  } catch (e) { next(e); }
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const listNotifications = async (req, res, next) => {
  try {
    const { unread } = req.query;
    const query = unread === 'true' ? { isRead: false } : {};
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const unreadCount   = await Notification.countDocuments({ isRead: false });
    res.json({ status: 'success', data: { notifications, unreadCount } });
  } catch (e) { next(e); }
};

export const markNotificationsRead = async (req, res, next) => {
  try {
    const { ids } = req.body; // array of ids, or empty to mark all
    if (ids && ids.length > 0) {
      await Notification.updateMany({ _id: { $in: ids } }, { isRead: true });
    } else {
      await Notification.updateMany({ isRead: false }, { isRead: true });
    }
    res.json({ status: 'success', message: 'Marked as read' });
  } catch (e) { next(e); }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Notification deleted' });
  } catch (e) { next(e); }
};
