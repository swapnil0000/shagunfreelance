import { useState } from 'react';
import { Tag, X, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import useCartStore from '../../stores/cartStore';

export default function CouponInput() {
  const { coupon, applyCoupon, removeCoupon, subtotal } = useCartStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/coupons/validate', {
        code: trimmed,
        subtotal,
      });
      applyCoupon(data.data);
      setCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    removeCoupon();
    setError('');
  };

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">
            {coupon.code}
          </span>
          <span className="text-xs text-neutral-500">applied</span>
        </div>
        <button
          onClick={handleRemove}
          className="p-1 text-neutral-400 hover:text-error transition-colors"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter coupon code"
            className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
              error ? 'border-error' : 'border-neutral-300'
            }`}
            aria-label="Coupon code"
            aria-invalid={error ? 'true' : undefined}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="rounded-lg border border-brand-600 px-5 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Apply
        </button>
      </form>
      {error && (
        <p className="mt-1.5 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
