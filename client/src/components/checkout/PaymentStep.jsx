import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ChevronLeft, ShieldCheck, Truck, Lock, Smartphone, Building2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/axios';
import useCartStore from '../../stores/cartStore';
import Button from '../ui/Button';

const PAYMENT_METHODS = [
  { icon: Smartphone, label: 'UPI' },
  { icon: CreditCard, label: 'Cards' },
  { icon: Building2, label: 'Net Banking' },
  { icon: Wallet, label: 'Wallets' },
];

export default function PaymentStep({ shippingAddress, onBack, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(!!window.Razorpay);

  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const { items, subtotal, discount, shipping, total, coupon, clearCart } = useCartStore();
  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  const handlePayment = async () => {
    if (!razorpayReady || !window.Razorpay) {
      toast.error('Payment gateway is still loading. Please try again in a moment.');
      return;
    }

    setLoading(true);
    try {
      const cartItems = items.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const { data: responseData } = await api.post('/orders/razorpay/create', {
        cartItems,
        shippingAddress,
        couponCode: coupon?.code || null,
      });

      const { razorpayOrderId, amount, key } = responseData.data;

      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'Zimor India',
        description: 'Premium Workbags',
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/orders/razorpay/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            onSuccess(verifyRes.data.data?.order || verifyRes.data.data || verifyRes.data);
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
            setLoading(false);
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },
        theme: { color: '#1a1a1a' },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(response.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left — Payment Info */}
        <div className="lg:col-span-3 space-y-5">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Payment</h3>
            <p className="text-sm text-neutral-500 mt-0.5">
              Complete your purchase securely via Razorpay
            </p>
          </div>

          {/* Amount card */}
          <div className="rounded-xl bg-neutral-900 p-5 text-white">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Razorpay</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <Lock className="h-3 w-3" />
                <span>Secure</span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 mb-1">Amount to pay</p>
            <p className="text-3xl font-bold tabular-nums">{formatCurrency(total)}</p>
          </div>

          {/* Accepted methods */}
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
              Accepted Payment Methods
            </p>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3 hover:border-neutral-300 transition-colors"
                >
                  <Icon className="h-4 w-4 text-neutral-600" />
                  <span className="text-[11px] font-medium text-neutral-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <p className="text-xs text-neutral-500 leading-relaxed">
              Your payment is protected with 256-bit SSL encryption. We never store your card details.
            </p>
          </div>
        </div>

        {/* Right — Order Summary */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 sticky top-4">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Order Summary</h3>

            <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img
                    src={item.product.images?.[0]?.url || '/placeholder.png'}
                    alt={item.product.name}
                    className="h-11 w-11 rounded-lg object-cover shrink-0 border border-neutral-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-800 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {item.size && `${item.size}`}
                      {item.size && item.color && ' · '}
                      {item.color && `${item.color}`}
                      {' · '}qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-neutral-800 tabular-nums shrink-0">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span className="tabular-nums">−{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="tabular-nums">
                  {shipping === 0 ? (
                    <span className="text-success flex items-center gap-1">
                      <Truck className="h-3 w-3" /> Free
                    </span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>
              <div className="border-t border-neutral-200 pt-2 flex justify-between">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="font-bold text-neutral-900 tabular-nums">
                  {formatCurrency(total)}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 text-right">
                18% GST Included.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-neutral-100">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          <ChevronLeft className="h-4 w-4" />
          Back to Shipping
        </Button>
        <Button
          onClick={handlePayment}
          loading={loading}
          disabled={!razorpayReady}
          className="sm:ml-auto"
        >
          <Lock className="h-4 w-4" />
          {!razorpayReady ? 'Loading Gateway...' : `Pay ${formatCurrency(total)}`}
        </Button>
      </div>
    </motion.div>
  );
}
