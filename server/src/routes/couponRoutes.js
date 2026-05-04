import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  validateCouponHandler,
  getAllCouponsHandler,
  createCouponHandler,
  updateCouponHandler,
  deleteCouponHandler,
} from '../controllers/couponController.js';

const router = Router();

// ─── Public ──────────────────────────────────────────────────────────────────

// POST /api/coupons/validate — validate a coupon code against a subtotal
router.post(
  '/validate',
  authenticate,
  [
    body('code').trim().notEmpty().withMessage('Coupon code is required'),
    body('subtotal')
      .isFloat({ min: 0 })
      .withMessage('Subtotal must be a non-negative number'),
  ],
  validate,
  validateCouponHandler
);

// ─── Admin CRUD ──────────────────────────────────────────────────────────────

// GET /api/coupons — list all coupons (admin)
router.get('/', authenticate, authorize('admin'), getAllCouponsHandler);

// POST /api/coupons — create a coupon (admin)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('code').trim().notEmpty().withMessage('Coupon code is required'),
    body('discountType')
      .isIn(['percentage', 'fixed'])
      .withMessage('Discount type must be "percentage" or "fixed"'),
    body('discountValue')
      .isFloat({ min: 0 })
      .withMessage('Discount value must be a non-negative number'),
    body('expiresAt')
      .isISO8601()
      .withMessage('Expiry date must be a valid ISO 8601 date'),
  ],
  validate,
  createCouponHandler
);

// PUT /api/coupons/:id — update a coupon (admin)
router.put('/:id', authenticate, authorize('admin'), updateCouponHandler);

// DELETE /api/coupons/:id — delete a coupon (admin)
router.delete('/:id', authenticate, authorize('admin'), deleteCouponHandler);

export default router;
