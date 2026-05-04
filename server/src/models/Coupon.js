import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code:           { type: String, required: true, unique: true, uppercase: true },
  discountType:   { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue:  { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount:    { type: Number },
  usageLimit:     { type: Number },
  usedCount:      { type: Number, default: 0 },
  expiresAt:      { type: Date, required: true },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

// code index is created automatically by unique: true

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
