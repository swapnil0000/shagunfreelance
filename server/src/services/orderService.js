import crypto from 'crypto';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import razorpay from '../config/razorpay.js';
import generateOrderNumber from '../utils/generateOrderNumber.js';
import AppError from '../utils/AppError.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../utils/email.js';

/**
 * Valid status transitions map.
 */
const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

/**
 * Validate that all cart items reference active products with sufficient stock.
 * Returns the product documents keyed by product ID.
 */
const validateCartItems = async (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  const productIds = cartItems.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean();

  if (products.length !== productIds.length) {
    throw new AppError('One or more products are unavailable', 400);
  }

  const productMap = {};
  for (const product of products) {
    productMap[product._id.toString()] = product;
  }

  for (const item of cartItems) {
    const product = productMap[item.productId];
    if (!product) {
      throw new AppError(`Product ${item.productId} is not available`, 400);
    }
    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        400
      );
    }
  }

  return productMap;
};

/**
 * Calculate subtotal from database product prices (ignoring client prices).
 */
const calculateSubtotal = (productMap, cartItems) => {
  let subtotal = 0;
  for (const item of cartItems) {
    const product = productMap[item.productId];
    subtotal += product.price * item.quantity;
  }
  return subtotal;
};

/**
 * Apply coupon and return the discount amount.
 * Validates coupon is active, not expired, within usage limit, and meets min order.
 */
const applyCoupon = async (couponCode, subtotal) => {
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

  if (!coupon) {
    throw new AppError('Invalid coupon code', 400);
  }

  if (!coupon.isActive) {
    throw new AppError('This coupon is no longer active', 400);
  }

  if (coupon.expiresAt < new Date()) {
    throw new AppError('This coupon has expired', 400);
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError('This coupon has reached its usage limit', 400);
  }

  if (subtotal < coupon.minOrderAmount) {
    throw new AppError(
      `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
      400
    );
  }

  let discount = 0;

  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    // fixed
    discount = coupon.discountValue;
  }

  // Ensure discount never exceeds subtotal
  discount = Math.min(discount, subtotal);

  // Round to 2 decimal places
  discount = Math.round(discount * 100) / 100;

  return discount;
};

/**
 * Map cart items to order items using database product data.
 */
const mapCartToOrderItems = (productMap, cartItems) => {
  return cartItems.map((item) => {
    const product = productMap[item.productId];
    return {
      product: product._id,
      name: product.name,
      image: product.images && product.images.length > 0 ? product.images[0].url : '',
      price: product.price,
      quantity: item.quantity,
      size: item.size || undefined,
      color: item.color || undefined,
    };
  });
};

/**
 * Create a Razorpay order and a pending Order document.
 *
 * Validates stock, calculates totals server-side (ignores client prices),
 * applies coupon, determines shipping (free >= ₹999, else ₹99),
 * creates Razorpay order (amount in paise), creates pending Order document.
 * Does NOT decrement stock.
 */
export const createRazorpayOrder = async (userId, cartItems, shippingAddress, couponCode) => {
  // 1. Validate all products exist, are active, and have sufficient stock
  const productMap = await validateCartItems(cartItems);

  // 2. Calculate subtotal server-side from database prices
  const subtotal = calculateSubtotal(productMap, cartItems);

  // 3. Apply coupon if provided
  let discount = 0;
  if (couponCode) {
    discount = await applyCoupon(couponCode, subtotal);
  }

  // 4. Shipping is always free
  const shippingCost = 0;

  // 5. Calculate total
  const total = subtotal - discount + shippingCost;

  // 6. Generate order number (ZIM-XXXXXX format)
  const orderNumber = await generateOrderNumber();

  // 7. Create Razorpay order (amount in paise)
  if (!razorpay) {
    throw new AppError('Payment gateway is not configured. Please contact support.', 503);
  }
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(total * 100),
    currency: 'INR',
    receipt: orderNumber,
  });

  // 8. Create pending Order document (do NOT decrement stock)
  const order = await Order.create({
    user: userId,
    orderNumber,
    items: mapCartToOrderItems(productMap, cartItems),
    shippingAddress,
    paymentMethod: 'razorpay',
    paymentResult: { razorpayOrderId: razorpayOrder.id },
    subtotal,
    discount,
    shippingCost,
    total,
    couponCode: couponCode ? couponCode.toUpperCase() : undefined,
    status: 'pending',
    statusHistory: [{ status: 'pending', note: 'Order created, awaiting payment' }],
  });

  return {
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
  };
};


/**
 * Decrement stock for each order item atomically.
 */
const decrementStock = async (items) => {
  const operations = items.map((item) =>
    Product.updateOne(
      { _id: item.product },
      { $inc: { stock: -item.quantity } }
    )
  );
  await Promise.all(operations);
};

/**
 * Create a COD (Cash on Delivery) order.
 *
 * Same validation and total calculation as Razorpay, but creates Order with
 * paymentMethod "cod" and status "confirmed" immediately.
 * Decrements stock immediately since the order is confirmed right away.
 */
export const createCODOrder = async (userId, cartItems, shippingAddress, couponCode) => {
  // 1. Validate all products exist, are active, and have sufficient stock
  const productMap = await validateCartItems(cartItems);

  // 2. Calculate subtotal server-side from database prices
  const subtotal = calculateSubtotal(productMap, cartItems);

  // 3. Apply coupon if provided
  let discount = 0;
  if (couponCode) {
    discount = await applyCoupon(couponCode, subtotal);
  }

  // 4. Shipping is always free
  const shippingCost = 0;

  // 5. Calculate total
  const total = subtotal - discount + shippingCost;

  // 6. Generate order number (ZIM-XXXXXX format)
  const orderNumber = await generateOrderNumber();

  // 7. Create confirmed Order document with paymentMethod "cod"
  const order = await Order.create({
    user: userId,
    orderNumber,
    items: mapCartToOrderItems(productMap, cartItems),
    shippingAddress,
    paymentMethod: 'cod',
    subtotal,
    discount,
    shippingCost,
    total,
    couponCode: couponCode ? couponCode.toUpperCase() : undefined,
    status: 'confirmed',
    statusHistory: [{ status: 'confirmed', note: 'COD order confirmed' }],
  });

  // 8. Decrement stock immediately (order is confirmed)
  await decrementStock(order.items);

  // 9. Increment coupon usage if applicable
  if (order.couponCode) {
    await Coupon.findOneAndUpdate(
      { code: order.couponCode },
      { $inc: { usedCount: 1 } }
    );
  }

  // 10. Populate user email before sending confirmation
  await order.populate('user', 'email name');

  // 11. Send order confirmation email
  await sendOrderConfirmationEmail(order);

  return order;
};


/**
 * Get all orders for a specific user, sorted by createdAt descending.
 */
export const getMyOrders = async (userId) => {
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();
  return orders;
};

/**
 * Get a single order by ID. Verifies ownership (user matches) or admin role.
 * Throws 404 if not found, 403 if not authorized.
 */
export const getOrderById = async (orderId, userId, userRole) => {
  const order = await Order.findById(orderId).lean();

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user.toString() !== userId.toString() && userRole !== 'admin') {
    throw new AppError('You do not have permission to view this order', 403);
  }

  return order;
};

/**
 * Get all orders (admin only), sorted by createdAt descending.
 * Populates user with name and email.
 */
export const getAllOrders = async () => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .lean();
  return orders;
};

/**
 * Get an order for invoice generation. Same ownership/admin check as getOrderById.
 * Returns populated order for PDF generation.
 */
export const getOrderForInvoice = async (orderId, userId, userRole) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user.toString() !== userId.toString() && userRole !== 'admin') {
    throw new AppError('You do not have permission to access this invoice', 403);
  }

  return order;
};

/**
 * Verify Razorpay payment signature and confirm the order.
 *
 * 1. Compute expected HMAC-SHA256 signature of razorpayOrderId|razorpayPaymentId
 * 2. Timing-safe compare with provided signature
 * 3. On valid: update order to confirmed/isPaid, decrement stock, increment coupon, send email
 * 4. On invalid: throw 400 error with no mutations
 */
export const verifyRazorpayPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  // 1. Generate expected signature
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  // 2. Timing-safe comparison to prevent timing attacks
  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(razorpaySignature);

  if (expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
    throw new AppError('Payment verification failed', 400);
  }

  // 3. Find the order by razorpayOrderId
  const order = await Order.findOne({
    'paymentResult.razorpayOrderId': razorpayOrderId,
  }).populate('user', 'email name');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // 4. Update order to confirmed
  order.paymentResult.razorpayPaymentId = razorpayPaymentId;
  order.paymentResult.razorpaySignature = razorpaySignature;
  order.isPaid = true;
  order.paidAt = new Date();
  order.status = 'confirmed';
  order.statusHistory.push({ status: 'confirmed', note: 'Payment verified' });
  await order.save();

  // 5. Decrement stock for each item
  await decrementStock(order.items);

  // 6. Increment coupon usage if applicable
  if (order.couponCode) {
    await Coupon.findOneAndUpdate(
      { code: order.couponCode },
      { $inc: { usedCount: 1 } }
    );
  }

  // 7. Send confirmation email
  await sendOrderConfirmationEmail(order);

  return order;
};

/**
 * Update order status (admin action).
 *
 * Enforces valid status transitions, appends to statusHistory,
 * sets isDelivered/deliveredAt on delivered, and sends status email.
 */
export const updateOrderStatus = async (orderId, newStatus, note) => {
  const order = await Order.findById(orderId).populate('user', 'email name');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const allowedTransitions = VALID_TRANSITIONS[order.status];
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    throw new AppError(
      `Cannot transition from "${order.status}" to "${newStatus}"`,
      400
    );
  }

  order.status = newStatus;
  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || undefined,
  });

  if (newStatus === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  await order.save();

  // Send status update email to customer
  await sendOrderStatusEmail(order, newStatus);

  return order;
};
