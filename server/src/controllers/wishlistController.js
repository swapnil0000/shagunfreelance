import {
  getWishlist,
  replaceWishlist,
  removeFromWishlist,
} from '../services/wishlistService.js';

/**
 * GET /api/wishlist
 */
export const getWishlistHandler = async (req, res, next) => {
  try {
    const wishlist = await getWishlist(req.user._id);
    res.status(200).json({ status: 'success', data: { wishlist } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/wishlist — replace wishlist products array (for sync)
 */
export const replaceWishlistHandler = async (req, res, next) => {
  try {
    const { products } = req.body;
    const wishlist = await replaceWishlist(req.user._id, products || []);
    res.status(200).json({ status: 'success', data: { wishlist } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/wishlist/:productId — remove a single product
 */
export const removeFromWishlistHandler = async (req, res, next) => {
  try {
    const wishlist = await removeFromWishlist(req.user._id, req.params.productId);
    res.status(200).json({ status: 'success', data: { wishlist } });
  } catch (error) {
    next(error);
  }
};
