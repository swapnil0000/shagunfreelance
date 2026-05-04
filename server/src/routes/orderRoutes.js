import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createRazorpayOrderHandler,
  verifyRazorpayPaymentHandler,
  createCODOrderHandler,
  getMyOrdersHandler,
  getOrderByIdHandler,
  getAllOrdersHandler,
  downloadInvoiceHandler,
  updateOrderStatusHandler,
} from '../controllers/orderController.js';

const router = Router();

// ─── Order Queries ───────────────────────────────────────────────────────────
// IMPORTANT: Place specific routes BEFORE /:id to avoid Express matching them as params

// GET /api/orders/my-orders — authenticated user's orders
router.get('/my-orders', authenticate, getMyOrdersHandler);

// GET /api/orders — admin only, all orders (must come BEFORE /:id)
router.get('/', authenticate, authorize('admin'), getAllOrdersHandler);

// ─── Razorpay Order Creation ─────────────────────────────────────────────────
router.post(
  '/razorpay/create',
  authenticate,
  [
    body('cartItems')
      .isArray({ min: 1 })
      .withMessage('Cart must contain at least one item'),
    body('cartItems.*.productId')
      .notEmpty()
      .withMessage('Each cart item must have a productId'),
    body('cartItems.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Each cart item must have a quantity of at least 1'),
    body('shippingAddress.fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required'),
    body('shippingAddress.phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required'),
    body('shippingAddress.addressLine1')
      .trim()
      .notEmpty()
      .withMessage('Address line 1 is required'),
    body('shippingAddress.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    body('shippingAddress.state')
      .trim()
      .notEmpty()
      .withMessage('State is required'),
    body('shippingAddress.pincode')
      .trim()
      .notEmpty()
      .withMessage('Pincode is required'),
  ],
  validate,
  createRazorpayOrderHandler
);

// ─── Razorpay Payment Verification ──────────────────────────────────────────
router.post(
  '/razorpay/verify',
  authenticate,
  [
    body('razorpayOrderId')
      .trim()
      .notEmpty()
      .withMessage('razorpayOrderId is required')
      .isString()
      .withMessage('razorpayOrderId must be a string'),
    body('razorpayPaymentId')
      .trim()
      .notEmpty()
      .withMessage('razorpayPaymentId is required')
      .isString()
      .withMessage('razorpayPaymentId must be a string'),
    body('razorpaySignature')
      .trim()
      .notEmpty()
      .withMessage('razorpaySignature is required')
      .isString()
      .withMessage('razorpaySignature must be a string'),
  ],
  validate,
  verifyRazorpayPaymentHandler
);

// ─── COD Order Creation ──────────────────────────────────────────────────────
router.post(
  '/cod',
  authenticate,
  [
    body('cartItems')
      .isArray({ min: 1 })
      .withMessage('Cart must contain at least one item'),
    body('cartItems.*.productId')
      .notEmpty()
      .withMessage('Each cart item must have a productId'),
    body('cartItems.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Each cart item must have a quantity of at least 1'),
    body('shippingAddress.fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required'),
    body('shippingAddress.phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required'),
    body('shippingAddress.addressLine1')
      .trim()
      .notEmpty()
      .withMessage('Address line 1 is required'),
    body('shippingAddress.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    body('shippingAddress.state')
      .trim()
      .notEmpty()
      .withMessage('State is required'),
    body('shippingAddress.pincode')
      .trim()
      .notEmpty()
      .withMessage('Pincode is required'),
  ],
  validate,
  createCODOrderHandler
);

// ─── Order by ID (with sub-routes) ──────────────────────────────────────────

// PUT /api/orders/:id/status — admin only, update order status
router.put(
  '/:id/status',
  authenticate,
  authorize('admin'),
  [
    body('status')
      .trim()
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled'),
  ],
  validate,
  updateOrderStatusHandler
);

// GET /api/orders/:id/invoice — authenticated, owner or admin
router.get('/:id/invoice', authenticate, downloadInvoiceHandler);

// GET /api/orders/:id — authenticated, owner or admin
router.get('/:id', authenticate, getOrderByIdHandler);

export default router;
