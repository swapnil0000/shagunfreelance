import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  if (!to) {
    console.warn('[email] Skipped — no recipient address for subject:', subject);
    return;
  }
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER === '...') {
    console.warn('[email] Skipped — EMAIL_USER / EMAIL_PASS not configured');
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Zimor India" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('[email] Sent to', to, '|', subject);
  } catch (err) {
    console.error('[email] Failed to send to', to, '—', err.message);
  }
};

/**
 * Send order confirmation email after successful payment.
 */
export const sendOrderConfirmationEmail = async (order) => {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₹${item.price.toFixed(2)}</td></tr>`
    )
    .join('');

  const html = `
    <h2>Order Confirmed — ${order.orderNumber}</h2>
    <p>Hi, your order has been confirmed.</p>
    <table border="1" cellpadding="8" cellspacing="0">
      <tr><th>Product</th><th>Qty</th><th>Price</th></tr>
      ${itemsHtml}
    </table>
    <p><strong>Subtotal:</strong> ₹${order.subtotal.toFixed(2)}</p>
    <p><strong>Discount:</strong> ₹${order.discount.toFixed(2)}</p>
    <p><strong>Shipping:</strong> Free</p>
    <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
    <p>Thank you for shopping with Zimor India!</p>
    <p style="margin-top:16px;font-size:12px;color:#666;">
      Zimor India | D 59/198-KA-1-P, Shivpurwa, Varanasi, UP – 221010<br/>
      📞 +91 89536 96928 | ✉️ support@zimorindia.com
    </p>
  `;

  const recipient = typeof order.user === 'object' ? order.user?.email : null;
  await sendEmail({
    to: recipient,
    subject: `Order Confirmation — ${order.orderNumber}`,
    html,
  });
};


/**
 * Send order status update email.
 */
export const sendOrderStatusEmail = async (order, newStatus) => {
  const html = `
    <h2>Order Update — ${order.orderNumber}</h2>
    <p>Your order status has been updated to: <strong>${newStatus}</strong>.</p>
    <p>Order Number: ${order.orderNumber}</p>
    <p>If you have any questions, please contact us.</p>
    <p>— Zimor India</p>
  `;

  const recipient = typeof order.user === 'object' ? order.user?.email : null;
  await sendEmail({
    to: recipient,
    subject: `Order ${order.orderNumber} — Status Update: ${newStatus}`,
    html,
  });
};

/**
 * Send password reset email with a reset link.
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    <p>— Zimor India</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Zimor India — Password Reset',
    html,
  });
};
