import {
  getRecentReviews,
  getProductReviews,
  createReview,
  deleteReview,
} from '../services/reviewService.js';

/**
 * GET /api/reviews/recent
 */
export const getRecentReviewsHandler = async (req, res, next) => {
  try {
    const reviews = await getRecentReviews(10);
    res.status(200).json({ status: 'success', data: { reviews } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/:productId
 */
export const getProductReviewsHandler = async (req, res, next) => {
  try {
    const reviews = await getProductReviews(req.params.productId);
    res.status(200).json({ status: 'success', data: { reviews } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/reviews
 */
export const createReviewHandler = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const review = await createReview(req.user._id, productId, rating, title, comment);
    res.status(201).json({ status: 'success', data: { review } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/reviews/:id
 */
export const deleteReviewHandler = async (req, res, next) => {
  try {
    await deleteReview(req.params.id, req.user._id, req.user.role);
    res.status(200).json({ status: 'success', message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
