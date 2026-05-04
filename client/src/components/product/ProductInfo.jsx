import { useState } from 'react';
import { Heart, ShoppingBag, Truck, Shield, Ruler, Package } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';
import useCartStore from '../../stores/cartStore';
import useWishlistStore from '../../stores/wishlistStore';

export default function ProductInfo({ product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } =
    useWishlistStore();

  const wishlisted = isInWishlist(product._id);
  const outOfStock = product.stock <= 0;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    toggleDrawer();
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlistToggle = () => {
    if (wishlisted) {
      removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product._id);
      toast.success('Added to wishlist');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Category */}
      <p className="text-sm font-medium uppercase tracking-wider text-brand-600">
        {product.category?.replace(/-/g, ' ')}
      </p>

      {/* Name */}
      <h1 className="font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
        {product.name}
      </h1>

      {/* Rating */}
      {product.numReviews > 0 && (
        <div className="flex items-center gap-2">
          <StarRating rating={Math.round(product.averageRating)} size="sm" readOnly />
          <span className="text-sm text-neutral-500">
            {product.averageRating.toFixed(1)} ({product.numReviews} review
            {product.numReviews !== 1 ? 's' : ''})
          </span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-neutral-900">
          ₹{product.price.toLocaleString('en-IN')}
        </span>
        {hasDiscount && (
          <>
            <span className="text-lg text-neutral-400 line-through">
              ₹{product.compareAtPrice.toLocaleString('en-IN')}
            </span>
            <span className="rounded-full bg-error/10 px-2.5 py-0.5 text-sm font-semibold text-error">
              -{discountPercent}% OFF
            </span>
          </>
        )}
      </div>

      {/* Description */}
      <p className="text-neutral-600 leading-relaxed">{product.description}</p>

      {/* Size selector */}
      {product.sizes?.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Size</label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color selector */}
      {product.colors?.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Color: <span className="font-normal text-neutral-500">{selectedColor}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color.name)}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                  selectedColor === color.name
                    ? 'border-brand-600'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
                aria-label={color.name}
                title={color.name}
              >
                <span
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: color.hex || '#ccc' }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock indicator */}
      <div className="text-sm">
        {outOfStock ? (
          <span className="font-medium text-error">Out of Stock</span>
        ) : product.stock <= 5 ? (
          <span className="font-medium text-warning">Only {product.stock} left in stock</span>
        ) : (
          <span className="font-medium text-success">In Stock</span>
        )}
      </div>

      {/* Quantity + Add to cart */}
      <div className="flex flex-wrap items-center gap-3">
        {!outOfStock && (
          <div className="flex items-center rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2.5 text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-10 text-center text-sm font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              className="px-3 py-2.5 text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}

        <Button
          onClick={handleAddToCart}
          disabled={outOfStock}
          size="lg"
          className="flex-1 sm:flex-none"
        >
          <ShoppingBag className="h-5 w-5" />
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>

        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`flex h-12 w-12 items-center justify-center rounded-lg border transition-colors ${
            wishlisted
              ? 'border-error/30 bg-error/5 text-error'
              : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product details */}
      <div className="mt-2 space-y-3 border-t border-neutral-100 pt-5">
        {product.material && (
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <Package className="h-4 w-4 text-neutral-400 shrink-0" />
            <span>Material: {product.material}</span>
          </div>
        )}
        {product.dimensions && (
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <Ruler className="h-4 w-4 text-neutral-400 shrink-0" />
            <span>Dimensions: {product.dimensions}</span>
          </div>
        )}
        {product.weight && (
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <Package className="h-4 w-4 text-neutral-400 shrink-0" />
            <span>Weight: {product.weight}</span>
          </div>
        )}
        {product.careInstructions && (
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <Shield className="h-4 w-4 text-neutral-400 shrink-0" />
            <span>Care: {product.careInstructions}</span>
          </div>
        )}
      </div>

      {/* USP badges */}
      <div className="flex flex-wrap gap-4 border-t border-neutral-100 pt-5">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Truck className="h-4 w-4 text-brand-600" />
          <span>Free shipping over ₹999</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Shield className="h-4 w-4 text-brand-600" />
          <span>Premium quality</span>
        </div>
      </div>
    </div>
  );
}
