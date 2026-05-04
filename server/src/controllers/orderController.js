import { createRazorpayOrder, verifyRazorpayPayment, createCODOrder, getMyOrders, getOrderById, getAllOrders, getOrderForInvoice, updateOrderStatus } from '../services/orderService.js';
import generateInvoice from '../utils/generateInvoice.js';

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