import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  title:      { type: String, trim: true },
  comment:    { type: String, required: true },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Indexes
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
