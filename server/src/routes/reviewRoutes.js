import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  getProductReviewsHandler,
  createReviewHandler,
  deleteReviewHandler,
} from '../controllers/reviewController.js';

const router = Router();

// GET /api/reviews/:productId — get all reviews for a product (public)
router.get('/:productId', getProductReviewsHandler);

// POST /api/reviews — create a review (authenticated)
router.post(
  '/',
  authenticate,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be an integer between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
  ],
  validate,
  createReviewHandler
);

// DELETE /api/reviews/:id — delete a review (author or admin)
router.delete('/:id', authenticate, deleteReviewHandler);

export default router;
