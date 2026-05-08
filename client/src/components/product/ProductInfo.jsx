import { useState } from 'react';
import { Heart, ShoppingBag, Zap, Truck, Shield, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';
import useCartStore from '../../stores/cartStore';
import useWishlistStore from '../../stores/wishlistStore';

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-sm font-semibold text-neutral-800"
        aria-expanded={open}
      >
        {title}
        <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-sm text-neutral-600 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductInfo({ product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

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

  const handleBuyNow = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    navigate('/checkout');
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
      <p className="text-xs font-medium uppercase tracking-widest text-brand-600">
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
            {product.averageRating.toFixed(1)} ({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})
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

      {/* Short description */}
      {product.shortDescription && (
        <p className="text-neutral-600 leading-relaxed">{product.shortDescription}</p>
      )}

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
                  selectedColor === color.name ? 'border-brand-600' : 'border-neutral-200 hover:border-neutral-400'
                }`}
                aria-label={color.name}
                title={color.name}
              >
                <span className="h-6 w-6 rounded-full" style={{ backgroundColor: color.hex || '#ccc' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock */}
      <div className="text-sm">
        {outOfStock ? (
          <span className="font-medium text-error">Out of Stock</span>
        ) : product.stock <= 5 ? (
          <span className="font-medium text-warning">Only {product.stock} left in stock</span>
        ) : (
          <span className="font-medium text-success">In Stock</span>
        )}
      </div>

      {/* Quantity + Buttons */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {!outOfStock && (
            <div className="flex items-center rounded-lg border border-neutral-200">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2.5 text-neutral-600 hover:text-neutral-900"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="min-w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="px-3 py-2.5 text-neutral-600 hover:text-neutral-900"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`flex h-11 w-11 items-center justify-center rounded-lg border transition-colors ${
              wishlisted ? 'border-error/30 bg-error/5 text-error' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
            }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Add to Cart + Buy Now */}
        <div className="flex gap-3">
          <Button onClick={handleAddToCart} disabled={outOfStock} size="lg" variant="outline" className="flex-1">
            <ShoppingBag className="h-5 w-5" />
            Add to Cart
          </Button>
          <Button onClick={handleBuyNow} disabled={outOfStock} size="lg" className="flex-1">
            <Zap className="h-5 w-5" />
            Buy Now
          </Button>
        </div>
      </div>

      {/* Product details accordion */}
      <div className="mt-4 border-t border-neutral-200 pt-2">
        <AccordionItem title="Product Features" defaultOpen={true}>
          <p className="mb-3">{product.description}</p>
          <ul className="list-disc pl-4 space-y-1.5 text-neutral-600">
            <li>Handcrafted by skilled artisans in Varanasi</li>
            <li>Premium quality materials for lasting durability</li>
            <li>Thoughtfully designed compartments for everyday essentials</li>
            {product.sizes?.length > 0 && <li>Available in {product.sizes.join(', ')} sizes</li>}
            {product.colors?.length > 0 && <li>Available in {product.colors.map(c => c.name).join(', ')}</li>}
          </ul>
        </AccordionItem>

        <AccordionItem title="Material & Care">
          <ul className="list-disc pl-4 space-y-1.5">
            {product.material && <li><strong>Material:</strong> {product.material}</li>}
            {product.weight && <li><strong>Weight:</strong> {product.weight}</li>}
            {product.careInstructions ? (
              <li><strong>Care:</strong> {product.careInstructions}</li>
            ) : (
              <>
                <li>Wipe clean with a soft, damp cloth</li>
                <li>Avoid direct sunlight and moisture</li>
                <li>Store in the provided dust bag when not in use</li>
              </>
            )}
          </ul>
        </AccordionItem>

        <AccordionItem title="Dimensions">
          <ul className="list-disc pl-4 space-y-1.5">
            {product.dimensions ? (
              <li>{product.dimensions}</li>
            ) : (
              <li>Please refer to the size chart for exact measurements</li>
            )}
            {product.weight && <li>Weight: {product.weight}</li>}
          </ul>
        </AccordionItem>

        <AccordionItem title="Shipping & Returns">
          <ul className="list-disc pl-4 space-y-1.5">
            <li>Free shipping on orders above ₹999</li>
            <li>Standard delivery: 5–7 business days</li>
            <li>7-day easy return policy</li>
            <li>Items must be unused and in original packaging</li>
            <li>COD orders refunded via bank transfer</li>
          </ul>
        </AccordionItem>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-4 border-t border-neutral-100 pt-4">
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
