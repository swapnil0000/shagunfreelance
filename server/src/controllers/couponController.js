import {
  applyCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../services/couponService.js';

/**
 * POST /api/coupons/validate
 */
export const validateCouponHandler = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const result = await applyCoupon(code, subtotal);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/coupons (admin)
 */
export const getAllCouponsHandler = async (req, res, next) => {
  try {
    const coupons = await getAllCoupons();
    res.status(200).json({ status: 'success', data: { coupons } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/coupons (admin)
 */
export const createCouponHandler = async (req, res, next) => {
  try {
    const coupon = await createCoupon(req.body);
    res.status(201).json({ status: 'success', data: { coupon } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/coupons/:id (admin)
 */
export const updateCouponHandler = async (req, res, next) => {
  try {
    const coupon = await updateCoupon(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: { coupon } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/coupons/:id (admin)
 */
export const deleteCouponHandler = async (req, res, next) => {
  try {
    await deleteCoupon(req.params.id);
    res.status(200).json({ status: 'success', message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};
