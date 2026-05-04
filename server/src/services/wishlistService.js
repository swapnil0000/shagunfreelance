import Wishlist from '../models/Wishlist.js';

/**
 * Get the authenticated user's wishlist, populated with product details.
 */
export const getWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId })
    .populate('products', 'name slug price compareAtPrice images stock isActive')
    .lean();

  if (!wishlist) {
    return { products: [] };
  }

  return wishlist;
};

/**
 * Replace the user's wishlist products array (used for sync on login).
 * Creates the wishlist document if it doesn't exist.
 */
export const replaceWishlist = async (userId, productIds) => {
  // Deduplicate
  const unique = [...new Set(productIds.map(String))];

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { products: unique },
    { new: true, upsert: true, runValidators: true }
  ).populate('products', 'name slug price compareAtPrice images stock isActive');

  return wishlist;
};

/**
 * Remove a single product from the user's wishlist.
 */
export const removeFromWishlist = async (userId, productId) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $pull: { products: productId } },
    { new: true }
  ).populate('products', 'name slug price compareAtPrice images stock isActive');

  if (!wishlist) {
    return { products: [] };
  }

  return wishlist;
};
