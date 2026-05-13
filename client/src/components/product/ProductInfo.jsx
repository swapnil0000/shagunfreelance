import { useState } from 'react';
import { Heart, ShoppingBag, Zap, Truck, Shield, RotateCcw, ChevronDown } from 'lucide-react';
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
        className="flex w-full items-center justify-between py-3.5 text-sm font-semibold text-neutral-800"
        aria-expanded={open}
      >
        {title}
        <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
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
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

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
    <>
      {/* ── Info panel ── */}
      <div className="flex flex-col gap-4">

        {/* Category tag */}
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          {product.category?.replace(/-/g, ' ')}
        </p>

        {/* Product name */}
        <h1 className="font-heading text-xl font-bold text-neutral-900 sm:text-2xl lg:text-3xl leading-tight">
          {product.name}
        </h1>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(product.averageRating)} size="sm" readOnly />
            <span className="text-sm text-neutral-500">
              {product.averageRating.toFixed(1)} · {product.numReviews} review{product.numReviews !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xl font-bold text-neutral-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <>
              <span className="text-base text-neutral-400 line-through">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </span>
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>

        {/* Short description */}
        {product.shortDescription && (
          <p className="text-sm text-neutral-600 leading-relaxed">{product.shortDescription}</p>
        )}

        {/* Size selector */}
        {product.sizes?.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700">
              Size: <span className="font-semibold text-neutral-900">{selectedSize}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[3rem] rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-neutral-200 text-neutral-600 hover:border-brand-400'
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
            <p className="mb-2 text-sm font-medium text-neutral-700">
              Color: <span className="font-semibold text-neutral-900">{selectedColor}</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.name)}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                    selectedColor === color.name
                      ? 'border-brand-600 scale-110'
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

        {/* Stock status */}
        <div className="text-sm font-medium">
          {outOfStock ? (
            <span className="text-red-500">Out of Stock</span>
          ) : product.stock <= 5 ? (
            <span className="text-amber-600">Only {product.stock} left in stock — order soon</span>
          ) : (
            <span className="text-green-600">In Stock</span>
          )}
        </div>

        {/* Quantity + Wishlist — visible on desktop, hidden on mobile (mobile has sticky bar) */}
        <div className="hidden sm:flex items-center gap-3">
          {!outOfStock && (
            <div className="flex items-center rounded-lg border border-neutral-200 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2.5 text-xl leading-none text-neutral-600 hover:text-neutral-900"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="px-4 py-2.5 text-xl leading-none text-neutral-600 hover:text-neutral-900"
                aria-label="Increase"
              >
                +
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors ${
              wishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-neutral-200 text-neutral-400 hover:border-neutral-400'
            }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* CTA buttons — desktop only */}
        <div className="hidden sm:grid grid-cols-2 gap-3">
          <Button onClick={handleAddToCart} disabled={outOfStock} size="lg" variant="outline" className="w-full">
            <ShoppingBag className="h-4 w-4 shrink-0" />
            Add to Cart
          </Button>
          <Button onClick={handleBuyNow} disabled={outOfStock} size="lg" className="w-full">
            <Zap className="h-4 w-4 shrink-0" />
            Buy Now
          </Button>
        </div>

        {/* Trust badges */}
        <div className="hidden sm:flex flex-wrap gap-4 border-t border-neutral-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Truck className="h-4 w-4 text-brand-600" />
            Free shipping
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Shield className="h-4 w-4 text-brand-600" />
            Premium quality
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <RotateCcw className="h-4 w-4 text-brand-600" />
            7-day returns
          </div>
        </div>

        {/* Accordions */}
        <div className="border-t border-neutral-200 pt-1">
          <AccordionItem title="Product Details" defaultOpen>
            <p className="mb-3">{product.description}</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Handcrafted by skilled artisans in Varanasi</li>
              <li>Premium materials for lasting durability</li>
              <li>Thoughtfully designed compartments</li>
              {product.sizes?.length > 0 && <li>Sizes: {product.sizes.join(', ')}</li>}
              {product.colors?.length > 0 && <li>Colors: {product.colors.map(c => c.name).join(', ')}</li>}
            </ul>
          </AccordionItem>

          <AccordionItem title="Material & Care">
            <ul className="list-disc pl-4 space-y-1">
              {product.material && <li><strong>Material:</strong> {product.material}</li>}
              {product.weight && <li><strong>Weight:</strong> {product.weight}</li>}
              {product.careInstructions
                ? <li><strong>Care:</strong> {product.careInstructions}</li>
                : <>
                    <li>Wipe with a soft damp cloth</li>
                    <li>Avoid direct sunlight and moisture</li>
                  </>
              }
            </ul>
          </AccordionItem>

          {(product.dimensions || product.weight) && (
            <AccordionItem title="Dimensions">
              <ul className="list-disc pl-4 space-y-1">
                {product.dimensions && <li>{product.dimensions}</li>}
                {product.weight && <li>Weight: {product.weight}</li>}
              </ul>
            </AccordionItem>
          )}

          <AccordionItem title="Shipping & Returns">
            <ul className="list-disc pl-4 space-y-1">
              <li>Free shipping on all orders</li>
              <li>Standard delivery: 5–7 business days</li>
              <li>7-day easy return policy</li>
              <li>Items must be unused and in original packaging</li>
            </ul>
          </AccordionItem>
        </div>

      </div>

      {/* ── Sticky bottom CTA — mobile only ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t border-neutral-200 px-4 py-3 safe-bottom">
        <div className="flex items-center gap-2">
          {/* Wishlist */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              wishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-neutral-200 text-neutral-400'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-brand-600 bg-white text-sm font-semibold text-brand-600 transition-colors disabled:opacity-40"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </button>

          {/* Buy Now */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors disabled:opacity-40"
          >
            <Zap className="h-4 w-4" />
            Buy Now
          </button>
        </div>
      </div>
    </>
  );
}
