import Coupon from '../models/Coupon.js';
import AppError from '../utils/AppError.js';

/**
 * Validate and apply a coupon code against a subtotal.
 * Returns the calculated discount amount.
 */
export const applyCoupon = async (code, subtotal) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

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
    discount = coupon.discountValue;
  }

  // Discount never exceeds subtotal
  discount = Math.min(discount, subtotal);

  // Round to 2 decimal places
  discount = Math.round(discount * 100) / 100;

  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discount,
  };
};

/**
 * Get all coupons (admin).
 */
export const getAllCoupons = async () => {
  return Coupon.find().sort({ createdAt: -1 }).lean();
};

/**
 * Create a new coupon (admin).
 */
export const createCoupon = async (data) => {
  const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
  if (existing) {
    throw new AppError('A coupon with this code already exists', 409);
  }
  return Coupon.create(data);
};

/**
 * Update a coupon by ID (admin).
 */
export const updateCoupon = async (couponId, data) => {
  const coupon = await Coupon.findByIdAndUpdate(couponId, data, {
    new: true,
    runValidators: true,
  });
  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }
  return coupon;
};

/**
 * Delete a coupon by ID (admin).
 */
export const deleteCoupon = async (couponId) => {
  const coupon = await Coupon.findByIdAndDelete(couponId);
  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }
  return coupon;
};
