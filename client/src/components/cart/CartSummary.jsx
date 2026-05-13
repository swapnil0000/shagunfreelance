import { Link } from 'react-router-dom';
import useCartStore from '../../stores/cartStore';
import CouponInput from './CouponInput';

export default function CartSummary() {
  const { subtotal, discount, shipping, total, items } = useCartStore();
  const isEmpty = items.length === 0;

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Order Summary
      </h2>

      {/* Coupon */}
      <div className="mb-5">
        <CouponInput />
      </div>

      {/* Line items */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600">Subtotal</span>
          <span className="font-medium text-neutral-900 tabular-nums">
            ₹{subtotal.toLocaleString('en-IN')}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount</span>
            <span className="font-medium tabular-nums">
              -₹{discount.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-neutral-600">Shipping</span>
          <span className="font-medium text-success">Free</span>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-neutral-900">Total</span>
            <span className="text-base font-bold text-neutral-900 tabular-nums">
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout button */}
      <Link
        to="/checkout"
        className={`mt-6 block w-full text-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors ${
          isEmpty
            ? 'opacity-50 pointer-events-none'
            : 'hover:bg-brand-700'
        }`}
        aria-disabled={isEmpty}
      >
        Proceed to Checkout
      </Link>

      {/* Continue shopping */}
      <Link
        to="/shop"
        className="mt-3 block w-full text-center text-sm text-brand-600 hover:text-brand-700 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
