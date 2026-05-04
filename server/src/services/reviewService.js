import Review from '../models/Review.js';
import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';

/**
 * Recalculate averageRating and numReviews for a product.
 */
const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      numReviews: 0,
    });
  }
};

/**
 * Get all reviews for a product, sorted by newest first.
 */
export const getProductReviews = async (productId) => {
  return Review.find({ product: productId })
    .sort({ createdAt: -1 })
    .populate('user', 'name avatar')
    .lean();
};

/**
 * Create a review. Enforces unique user+product constraint.
 */
export const createReview = async (userId, productId, rating, title, comment) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404);
  }

  const existing = await Review.findOne({ user: userId, product: productId });
  if (existing) {
    throw new AppError('You have already reviewed this product', 400);
  }

  const review = await Review.create({
    user: userId,
    product: productId,
    rating,
    title,
    comment,
  });

  await recalculateProductRating(product._id);

  return review;
};

/**
 * Delete a review by ID. Only the review author or an admin can delete.
 */
export const deleteReview = async (reviewId, userId, userRole) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (review.user.toString() !== userId.toString() && userRole !== 'admin') {
    throw new AppError('You do not have permission to delete this review', 403);
  }

  const productId = review.product;
  await review.deleteOne();

  await recalculateProductRating(productId);
};
