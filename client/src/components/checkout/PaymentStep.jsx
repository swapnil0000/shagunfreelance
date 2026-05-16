import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Banknote, ChevronLeft, ShieldCheck, Truck } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/axios';
import useCartStore from '../../stores/cartStore';
import Button from '../ui/Button';

export default function PaymentStep({ shippingAddress, onBack, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(!!window.Razorpay);

  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  const { items, subtotal, discount, shipping, total, coupon, clearCart } = useCartStore();

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  const handleRazorpayPayment = async () => {
    // Guard before API call — avoids creating a dangling server order
    if (!razorpayReady || !window.Razorpay) {
      toast.error('Payment gateway is still loading. Please try again in a moment.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Razorpay order on server
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

      // 2. Open Razorpay checkout modal
      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'Zimor India',
        description: 'Premium Workbags',
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            // 3. Verify payment on server
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
        theme: {
          color: '#1a1a1a',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
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

  const handleCODPayment = async () => {
    setLoading(true);
    try {
      const cartItems = items.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const { data: codData } = await api.post('/orders/cod', {
        cartItems,
        shippingAddress,
        couponCode: coupon?.code || null,
      });

      onSuccess(codData.data?.order || codData.data || codData);
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleCODPayment();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Payment Methods */}
        <div className="lg:col-span-3 space-y-6">
          <h3 className="text-lg font-semibold text-neutral-900">
            Select Payment Method
          </h3>

          <div className="space-y-3">
            {/* Razorpay */}
            <label
              className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                paymentMethod === 'razorpay'
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={paymentMethod === 'razorpay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500"
              />
              <CreditCard className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  Pay Online (Razorpay)
                </p>
                <p className="text-xs text-neutral-500">
                  UPI, Cards, Net Banking, Wallets
                </p>
              </div>
            </label>

            {/* COD */}
            <label
              className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                paymentMethod === 'cod'
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500"
              />
              <Banknote className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  Cash on Delivery
                </p>
                <p className="text-xs text-neutral-500">
                  Pay when your order arrives
                </p>
              </div>
            </label>
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">
              Order Summary
            </h3>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img
                    src={item.product.images?.[0]?.url || '/placeholder.png'}
                    alt={item.product.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-800 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.color && ' · '}
                      {item.color && `Color: ${item.color}`}
                      {' × '}{item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-neutral-800 tabular-nums">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-neutral-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span className="font-medium tabular-nums">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600">Shipping</span>
                <span className="font-medium tabular-nums">
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
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          <ChevronLeft className="h-4 w-4" />
          Back to Shipping
        </Button>
        <Button
          onClick={handlePlaceOrder}
          loading={loading}
          disabled={paymentMethod === 'razorpay' && !razorpayReady}
          className="sm:ml-auto"
        >
          {paymentMethod === 'razorpay' && !razorpayReady ? 'Loading...' : paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order (COD)'}
        </Button>
      </div>
    </motion.div>
  );
}
