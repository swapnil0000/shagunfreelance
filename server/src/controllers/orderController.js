import { createRazorpayOrder, verifyRazorpayPayment, createCODOrder, getMyOrders, getOrderById, getAllOrders, getOrderForInvoice, updateOrderStatus } from '../services/orderService.js';
import generateInvoice from '../utils/generateInvoice.js';
import Order from '../models/Order.js';
import razorpay from '../config/razorpay.js';
import { sendEmail } from '../utils/email.js';

/**
 * POST /api/orders/razorpay/create
 */
export const createRazorpayOrderHandler = async (req, res, next) => {
  try {
    const { cartItems, shippingAddress, couponCode } = req.body;
    const result = await createRazorpayOrder(
      req.user._id,
      cartItems,
      shippingAddress,
      couponCode
    );

    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/razorpay/verify
 */
export const verifyRazorpayPaymentHandler = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const order = await verifyRazorpayPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    res.status(200).json({ status: 'success', data: { order } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/cod
 */
export const createCODOrderHandler = async (req, res, next) => {
  try {
    const { cartItems, shippingAddress, couponCode } = req.body;
    const order = await createCODOrder(
      req.user._id,
      cartItems,
      shippingAddress,
      couponCode
    );

    res.status(201).json({ status: 'success', data: { order } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/my-orders
 */
export const getMyOrdersHandler = async (req, res, next) => {
  try {
    const orders = await getMyOrders(req.user._id);
    res.status(200).json({ status: 'success', data: { orders } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 */
export const getOrderByIdHandler = async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.id, req.user._id, req.user.role);
    res.status(200).json({ status: 'success', data: { order } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders (admin only)
 */
export const getAllOrdersHandler = async (req, res, next) => {
  try {
    const orders = await getAllOrders();
    res.status(200).json({ status: 'success', data: { orders } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id/invoice
 */
export const downloadInvoiceHandler = async (req, res, next) => {
  try {
    const order = await getOrderForInvoice(req.params.id, req.user._id, req.user.role);
    generateInvoice(order, res);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orders/:id/status (admin only)
 */
export const updateOrderStatusHandler = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await updateOrderStatus(req.params.id, status, note);
    res.status(200).json({ status: 'success', data: { order } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/:id/refund (admin only)
 * Processes a Razorpay refund for a paid order.
 */
export const processRefundHandler = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' });
    if (!order.isPaid) return res.status(400).json({ status: 'error', message: 'Order has not been paid' });
    if (order.paymentMethod !== 'razorpay') {
      return res.status(400).json({ status: 'error', message: 'Refunds are only available for Razorpay orders' });
    }
    if (order.refund?.status === 'processed') {
      return res.status(400).json({ status: 'error', message: 'This order has already been refunded' });
    }
    if (!razorpay) return res.status(503).json({ status: 'error', message: 'Payment gateway not configured' });

    const { amount, reason = 'Refund requested by admin' } = req.body;
    const refundAmount = amount ? Math.round(Number(amount) * 100) : Math.round(order.total * 100); // paise

    const paymentId = order.paymentResult?.razorpayPaymentId;
    if (!paymentId) return res.status(400).json({ status: 'error', message: 'Payment ID not found on order' });

    const refund = await razorpay.payments.refund(paymentId, {
      amount: refundAmount,
      notes:  { reason, orderId: order._id.toString(), orderNumber: order.orderNumber },
    });

    order.refund = {
      status:            'processed',
      razorpayRefundId:  refund.id,
      amount:            refundAmount / 100,
      reason,
      processedAt:       new Date(),
    };
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: `Refund processed: ${reason}` });
    await order.save();

    // Notify customer
    if (order.user?.email) {
      sendEmail({
        to:      order.user.email,
        subject: `Refund Processed — Order ${order.orderNumber}`,
        html:    `<p>Hi ${order.user.name},</p>
                  <p>Your refund of <strong>₹${refundAmount / 100}</strong> for order <strong>${order.orderNumber}</strong> has been processed.</p>
                  <p>Reason: ${reason}</p>
                  <p>Refund ID: ${refund.id}</p>
                  <p>It may take 5–7 business days to reflect in your account.</p>`,
      }).catch(() => {});
    }

    res.status(200).json({ status: 'success', data: { order } });
  } catch (error) {
    next(error);
  }
};