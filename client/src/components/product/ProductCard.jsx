import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import useCartStore from '../../stores/cartStore';
import useWishlistStore from '../../stores/wishlistStore';
import StarRating from '../ui/StarRating';
import { cld, cldSrcSet } from '../../lib/cloudinary';

function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);
  // Subscribe only to THIS product's membership, so the whole grid no longer
  // re-renders when any single wishlist item changes.
  const wishlisted = useWishlistStore((s) => s.items.includes(product._id));
  const outOfStock = product.stock <= 0;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const mainImage = product.images?.[0]?.url || '/favicon.svg';

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (outOfStock) return;
    addItem(product, 1, product.sizes?.[0] || '', product.colors?.[0]?.name || '');
    toggleDrawer();
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (wishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product._id);
    }
  };

  return (
    <div className="group relative">
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-neutral-100">
          <img
            src={cld(mainImage, { w: 500 })}
            srcSet={cldSrcSet(mainImage, [300, 500, 700])}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            alt={product.images?.[0]?.alt || product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />

          {/* Discount badge */}
          {hasDiscount && (
            <span className="absolute top-3 left-3 rounded-full bg-error px-2.5 py-1 text-xs font-semibold text-white">
              -{discountPercent}%
            </span>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-neutral-800">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`h-4.5 w-4.5 transition-colors ${
                wishlisted ? 'fill-error text-error' : 'text-neutral-600'
              }`}
            />
          </button>

          {/* Add to cart button — visible on hover (desktop) and always visible (mobile) */}
          {!outOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 rounded-lg bg-brand-600 py-2 text-xs font-medium text-white opacity-100 transition-all duration-300 hover:bg-brand-700 sm:py-2.5 sm:text-sm sm:opacity-0 sm:group-hover:opacity-100"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Add to Cart
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium text-neutral-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>

          {product.numReviews > 0 && (
            <div className="flex items-center gap-1.5">
              <StarRating rating={Math.round(product.averageRating)} size="sm" readOnly />
              <span className="text-xs text-neutral-500">({product.numReviews})</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-neutral-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-sm text-neutral-400 line-through">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default memo(ProductCard);
