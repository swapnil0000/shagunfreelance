import PDFDocument from 'pdfkit';

/**
 * Generate a PDF invoice for an order and pipe it to the response stream.
 * @param {Object} order - Populated order document
 * @param {import('express').Response} res - Express response object
 */
const generateInvoice = (order, res) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=invoice-${order.orderNumber}.pdf`
  );
  doc.pipe(res);

  // Company header
  doc.fontSize(20).text('Zimor India', { align: 'center' });
  doc.fontSize(10).text('D 59/198-KA-1-P, Shivpurwa, Varanasi, UP – 221010', { align: 'center' });
  doc.fontSize(10).text('+91 89536 96928 | Zimorindia@gmail.com', { align: 'center' });
  doc.moveDown();

  // Invoice title
  doc.fontSize(16).text('INVOICE', { align: 'center' });
  doc.moveDown();

  // Order details
  doc.fontSize(10);
  doc.text(`Order Number: ${order.orderNumber}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`);
  doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`);
  if (order.isPaid) {
    doc.text(`Paid At: ${new Date(order.paidAt).toLocaleDateString('en-IN')}`);
  }
  doc.moveDown();

  // Shipping address
  const addr = order.shippingAddress;
  doc.text('Ship To:', { underline: true });
  doc.text(addr.fullName);
  doc.text(addr.addressLine1);
  if (addr.addressLine2) doc.text(addr.addressLine2);
  doc.text(`${addr.city}, ${addr.state} — ${addr.pincode}`);
  doc.text(`Phone: ${addr.phone}`);
  doc.moveDown();

  // Items table header
  const tableTop = doc.y;
  const col = { name: 50, qty: 320, price: 390, total: 460 };

  doc.font('Helvetica-Bold');
  doc.text('Item', col.name, tableTop);
  doc.text('Qty', col.qty, tableTop);
  doc.text('Price', col.price, tableTop);
  doc.text('Total', col.total, tableTop);
  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

  // Items rows
  doc.font('Helvetica');
  let y = tableTop + 25;

  for (const item of order.items) {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    const lineTotal = item.price * item.quantity;
    doc.text(item.name, col.name, y, { width: 260 });
    doc.text(String(item.quantity), col.qty, y);
    doc.text(`₹${item.price.toFixed(2)}`, col.price, y);
    doc.text(`₹${lineTotal.toFixed(2)}`, col.total, y);
    y += 20;
  }

  // Totals
  y += 10;
  doc.moveTo(50, y).lineTo(545, y).stroke();
  y += 10;

  doc.text(`Subtotal: ₹${order.subtotal.toFixed(2)}`, col.price, y);
  y += 15;
  if (order.discount > 0) {
    doc.text(`Discount: -₹${order.discount.toFixed(2)}`, col.price, y);
    y += 15;
  }
  doc.text(`Shipping: Free`, col.price, y);
  y += 15;
  doc.font('Helvetica-Bold');
  doc.text(`Total: ₹${order.total.toFixed(2)}`, col.price, y);

  // Footer
  doc.font('Helvetica');
  doc.moveDown(4);
  doc.fontSize(8).text('Thank you for shopping with Zimor India!', 50, 750, {
    align: 'center',
  });

  doc.end();
};

export default generateInvoice;
