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
      📞 +91 89536 96928 | ✉️ Zimorindia@gmail.com
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
 * Send contact form notification to admin + auto-reply to customer.
 */
export const sendContactEmails = async ({ name, email, phone, subject, message }) => {
  // 1. Notify Zimor India team
  await sendEmail({
    to: process.env.EMAIL_USER,
    subject: `New Contact Form Message — ${subject || 'No Subject'}`,
    html: `
      <h2 style="color:#1a1a1a;">New Contact Form Submission</h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        <tr><td style="padding:8px;font-weight:bold;color:#555;width:120px;">Name</td><td style="padding:8px;">${name}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#555;">Email</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555;">Phone</td><td style="padding:8px;">${phone || 'Not provided'}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#555;">Subject</td><td style="padding:8px;">${subject || 'No Subject'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555;vertical-align:top;">Message</td><td style="padding:8px;">${message}</td></tr>
      </table>
      <p style="margin-top:16px;font-size:12px;color:#888;">Reply directly to this email to respond to ${name}.</p>
    `,
  });

  // 2. Auto-reply to the customer
  await sendEmail({
    to: email,
    subject: 'We received your message — Zimor India',
    html: `
      <h2 style="color:#1a1a1a;">Hi ${name}, we got your message!</h2>
      <p style="font-size:14px;color:#444;line-height:1.6;">
        Thank you for reaching out to Zimor India. We have received your message and our team will get back to you within <strong>2–4 hours</strong>.
      </p>
      <div style="background:#f9f9f9;border-left:3px solid #1a1a1a;padding:12px 16px;margin:16px 0;font-size:13px;color:#555;">
        <strong>Your message:</strong><br/>${message}
      </div>
      <p style="font-size:14px;color:#444;">For urgent queries, reach us on WhatsApp: <strong>+91 89536 96928</strong></p>
      <p style="margin-top:24px;font-size:12px;color:#888;">
        Zimor India | D 59/198-KA-1-P, Shivpurwa, Varanasi, UP – 221010<br/>
        📞 +91 89536 96928 | ✉️ Zimorindia@gmail.com
      </p>
    `,
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
