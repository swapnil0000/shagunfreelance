import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';
import Button from '../ui/Button';

export default function ConfirmationStep({ order }) {
  useEffect(() => {
    // Fire confetti on mount
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#b8624a', '#c9a84c', '#f9ede7'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#b8624a', '#c9a84c', '#f9ede7'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || '0'}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      {/* Success Icon */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
        <CheckCircle className="h-10 w-10 text-success" />
      </div>

      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
        Order Placed Successfully!
      </h2>
      <p className="text-neutral-600 mb-8">
        Thank you for shopping with Zimor India. Your order has been confirmed.
      </p>

      {/* Order Details Card */}
      {order && (
        <div className="mx-auto max-w-md rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-left mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-brand-600" />
            <h3 className="text-sm font-semibold text-neutral-900">
              Order Details
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            {order.orderNumber && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Order Number</span>
                <span className="font-medium text-neutral-900">
                  {order.orderNumber}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-neutral-600">Payment Method</span>
              <span className="font-medium text-neutral-900 capitalize">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-600">Status</span>
              <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success capitalize">
                {order.status}
              </span>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="border-t border-neutral-200 pt-3">
                <p className="text-xs text-neutral-500 mb-2">
                  {order.items.length} item{order.items.length > 1 ? 's' : ''}
                </p>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1">
                    <span className="text-neutral-700 truncate max-w-[60%]">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-neutral-800 font-medium tabular-nums">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-neutral-200 pt-3 flex justify-between">
              <span className="font-semibold text-neutral-900">Total</span>
              <span className="font-bold text-neutral-900 tabular-nums">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {order?._id && (
          <Link to={`/account/orders/${order._id}`}>
            <Button variant="outline">
              <Package className="h-4 w-4" />
              View Order
            </Button>
          </Link>
        )}
        <Link to="/shop">
          <Button>
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
