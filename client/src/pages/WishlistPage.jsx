import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Loader2 } from 'lucide-react';
import useWishlistStore from '../stores/wishlistStore';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import api from '../lib/axios';

export default function WishlistPage() {
  const { items: wishlistIds, removeItem, syncWithBackend } = useWishlistStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addToCart = useCartStore((s) => s.addItem);
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchWishlistProducts() {
      setLoading(true);
      try {
        if (isAuthenticated) {
          // Fetch populated wishlist from backend
          const { data } = await api.get('/wishlist');
          if (!cancelled) {
            const items = (data.data?.wishlist?.products || []).filter(
              (p) => p.isActive
            );
            setProducts(items);
          }
        } else {
          // Guest: fetch each product by slug isn't possible, so fetch all and filter
          // Since we only store IDs locally, fetch products in bulk via listing
          if (wishlistIds.length === 0) {
            setProducts([]);
          } else {
            // Fetch products page by page until we have all wishlisted ones
            // For simplicity, fetch with a high limit
            const { data } = await api.get('/products', {
              params: { limit: 50 },
            });
            if (!cancelled) {
              const allProducts = data?.products || [];
              const filtered = allProducts.filter(
                (p) => wishlistIds.includes(p._id) && p.isActive
              );
              setProducts(filtered);
            }
          }
        }
      } catch {
        // Silently handle — products will be empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWishlistProducts();
    return () => { cancelled = true; };
  }, [isAuthenticated, wishlistIds]);

  // Sync local wishlist with backend on login
  useEffect(() => {
    if (isAuthenticated && wishlistIds.length > 0) {
      syncWithBackend(wishlistIds, async (merged) => {
        await api.put('/wishlist', { products: merged });
      });
    }
  }, [isAuthenticated]);

  const handleAddToCart = (product) => {
    addToCart(
      product,
      1,
      product.sizes?.[0] || '',
      product.colors?.[0]?.name || ''
    );
    toggleDrawer();
  };

  const handleRemove = async (productId) => {
    removeItem(productId);
    if (isAuthenticated) {
      try {
        await api.delete(`/wishlist/${productId}`);
      } catch {
        // Already removed from local state
      }
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      </section>
    );
  }

  if (products.length === 0 && wishlistIds.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Heart className="h-20 w-20 text-neutral-300 mb-6" />
          <h1 className="font-heading text-2xl font-bold text-neutral-900 mb-2">
            Your wishlist is empty
          </h1>
          <p className="text-neutral-500 mb-8 max-w-md">
            Save your favorite bags here and come back to them anytime.
          </p>
          <Link
            to="/shop"
            className="rounded-lg bg-brand-600 px-8 py-3 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Explore Collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-neutral-900">
          My Wishlist
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {products.length} item{products.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
            onAddToCart={() => handleAddToCart(product)}
            onRemove={() => handleRemove(product._id)}
          />
        ))}
      </div>
    </section>
  );
}

function WishlistCard({ product, onAddToCart, onRemove }) {
  const imageUrl = product.images?.[0]?.url || '/favicon.svg';
  const outOfStock = product.stock <= 0;
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="group relative">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-neutral-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-neutral-800">
                Out of Stock
              </span>
            </div>
          )}

          {/* Remove button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-error"
            aria-label={`Remove ${product.name} from wishlist`}
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Add to cart — visible on hover */}
          {!outOfStock && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart();
              }}
              className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white opacity-0 transition-all duration-300 hover:bg-brand-700 group-hover:opacity-100"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </button>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium text-neutral-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
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
