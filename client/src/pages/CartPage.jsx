import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import useCartStore from '../stores/cartStore';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <ShoppingBag className="h-20 w-20 text-neutral-300 mb-6" />
          <h1 className="font-heading text-2xl font-bold text-neutral-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-neutral-500 mb-8 max-w-md">
            Looks like you haven't added any bags to your cart yet. Explore our
            collection and find your perfect workbag.
          </p>
          <Link
            to="/shop"
            className="rounded-lg bg-brand-600 px-8 py-3 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-neutral-900">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-neutral-500 hover:text-error transition-colors"
        >
          Clear cart
        </button>
      </div>

      {/* Cart layout */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Items list */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="divide-y divide-neutral-100">
            {items.map((item) => (
              <CartItem
                key={`${item.product._id}-${item.size}-${item.color}`}
                item={item}
                onRemove={() =>
                  removeItem(item.product._id, item.size, item.color)
                }
                onUpdateQty={(qty) =>
                  updateQuantity(
                    item.product._id,
                    item.size,
                    item.color,
                    qty
                  )
                }
              />
            ))}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="mt-8 lg:mt-0 lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24">
            <CartSummary />
          </div>
        </div>
      </div>
    </section>
  );
}
