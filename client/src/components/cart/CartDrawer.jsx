import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import useCartStore from '../../stores/cartStore';

export default function CartDrawer() {
  const { items, isDrawerOpen, toggleDrawer, removeItem, updateQuantity, subtotal } =
    useCartStore();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={toggleDrawer}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">
                Your Cart
              </h2>
              <button
                onClick={toggleDrawer}
                className="p-2 text-neutral-700 hover:text-brand-600"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="h-16 w-16 text-neutral-300 mb-4" />
                <p className="text-neutral-600 font-medium mb-2">
                  Your cart is empty
                </p>
                <p className="text-sm text-neutral-500 mb-6">
                  Discover our premium workbags
                </p>
                <Link
                  to="/shop"
                  onClick={toggleDrawer}
                  className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {items.map((item) => (
                    <CartDrawerItem
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

                {/* Footer */}
                <div className="border-t border-neutral-200 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">
                      Subtotal
                    </span>
                    <span className="text-lg font-semibold text-neutral-900">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Link
                    to="/cart"
                    onClick={toggleDrawer}
                    className="block w-full text-center rounded-lg border border-brand-600 px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    View Cart
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={toggleDrawer}
                    className="block w-full text-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
                  >
                    Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartDrawerItem({ item, onRemove, onUpdateQty }) {
  const { product, quantity, size, color } = item;
  const imageUrl = product.images?.[0]?.url || '/favicon.svg';

  return (
    <div className="flex gap-3">
      <img
        src={imageUrl}
        alt={product.name}
        className="h-20 w-20 rounded-lg object-cover bg-neutral-100 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-neutral-900 truncate">
          {product.name}
        </h4>
        {(size || color) && (
          <p className="text-xs text-neutral-500 mt-0.5">
            {size && <span>{size}</span>}
            {size && color && <span> / </span>}
            {color && <span>{color}</span>}
          </p>
        )}
        <p className="text-sm font-semibold text-brand-700 mt-1">
          ₹{product.price.toLocaleString('en-IN')}
        </p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-neutral-200 rounded-md">
            <button
              onClick={() => onUpdateQty(quantity - 1)}
              className="p-1 text-neutral-600 hover:text-brand-600"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-xs font-medium min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQty(quantity + 1)}
              className="p-1 text-neutral-600 hover:text-brand-600"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={onRemove}
            className="p-1 text-neutral-400 hover:text-error"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
