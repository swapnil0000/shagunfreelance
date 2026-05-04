import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getWishlistHandler,
  replaceWishlistHandler,
  removeFromWishlistHandler,
} from '../controllers/wishlistController.js';

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

// GET /api/wishlist — get user's wishlist
router.get('/', getWishlistHandler);

// PUT /api/wishlist — replace wishlist products (for sync)
router.put('/', replaceWishlistHandler);

// DELETE /api/wishlist/:productId — remove a product from wishlist
router.delete('/:productId', removeFromWishlistHandler);

export default router;
