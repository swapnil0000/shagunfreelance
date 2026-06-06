import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderFeaturedProducts,
} from '../controllers/productController.js';

const router = Router();

// ─── Public Routes ───────────────────────────────────────────────────────────
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);

// ─── Admin Routes ────────────────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('category')
      .isIn(['shoulder-bags', 'tote-bags', 'laptop-bags', 'crossbody-bags', 'handbags'])
      .withMessage('Invalid category'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ],
  validate,
  createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [
    body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('category')
      .optional()
      .isIn(['shoulder-bags', 'tote-bags', 'laptop-bags', 'crossbody-bags', 'handbags'])
      .withMessage('Invalid category'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ],
  validate,
  updateProduct
);

// Bulk reorder featured products (drag-and-drop in admin)
router.patch(
  '/featured-order',
  authenticate,
  authorize('admin'),
  [
    body('ids').isArray({ min: 1 }).withMessage('ids must be a non-empty array'),
    body('ids.*').isMongoId().withMessage('Each id must be a valid Mongo id'),
  ],
  validate,
  reorderFeaturedProducts
);

router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;
