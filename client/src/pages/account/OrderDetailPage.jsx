import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Package,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../../stores/authStore';
import api from '../../lib/axios';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';

const statusVariantMap = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
};

const statusIconMap = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data.data?.order),
    enabled: isAuthenticated && !!id,
    staleTime: 60 * 1000,
  });

  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/orders/${id}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order?.orderNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-neutral-200 bg-white py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-neutral-300" />
            <p className="mt-3 text-neutral-600">Order not found</p>
            <Link
              to="/account/orders"
              className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              ← Back to orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStatusIdx = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link & header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 font-heading">
                Order {order.orderNumber}
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={statusVariantMap[order.status] || 'default'}>
                {order.status}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadInvoice}
              >
                <Download className="h-4 w-4" />
                Invoice
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-8 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <h2 className="text-base font-semibold text-neutral-900 mb-6">
            Order Status
          </h2>

          {isCancelled ? (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4">
              <XCircle className="h-5 w-5 text-error" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Order Cancelled
                </p>
                <p className="text-xs text-red-600">
                  This order has been cancelled.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, idx) => {
                const Icon = statusIconMap[step];
                const isCompleted = idx <= currentStatusIdx;
                const isCurrent = idx === currentStatusIdx;

                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                          isCompleted
                            ? 'border-success bg-success text-white'
                            : 'border-neutral-300 bg-white text-neutral-400'
                        } ${isCurrent ? 'ring-2 ring-success/30' : ''}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium capitalize ${
                          isCompleted ? 'text-success' : 'text-neutral-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`mx-1 h-0.5 flex-1 ${
                          idx < currentStatusIdx
                            ? 'bg-success'
                            : 'bg-neutral-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div className="mt-6 border-t border-neutral-100 pt-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                History
              </p>
              <div className="space-y-2">
                {order.statusHistory.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="text-xs text-neutral-400 min-w-[80px]">
                      {new Date(entry.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <Badge
                      variant={statusVariantMap[entry.status] || 'default'}
                    >
                      {entry.status}
                    </Badge>
                    {entry.note && (
                      <span className="text-neutral-500">{entry.note}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-6 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <h2 className="text-base font-semibold text-neutral-900 mb-4">
            Items ({order.items?.length})
          </h2>
          <div className="divide-y divide-neutral-100">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 py-3 first:pt-0 last:pb-0"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-lg object-cover border border-neutral-100"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.color && ' · '}
                    {item.color && `Color: ${item.color}`}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-neutral-900">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Summary & Shipping */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Payment Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="rounded-xl border border-neutral-200 bg-white p-6"
          >
            <h2 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-neutral-500" />
              Payment Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="text-neutral-800">
                  ₹{order.subtotal?.toLocaleString('en-IN')}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">
                    Discount{order.couponCode && ` (${order.couponCode})`}
                  </span>
                  <span className="text-success">
                    -₹{order.discount?.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span className="text-neutral-800">
                  {order.shippingCost === 0
                    ? 'Free'
                    : `₹${order.shippingCost?.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-2">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="font-bold text-neutral-900">
                  ₹{order.total?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">Payment Method</span>
                <span className="text-neutral-800 capitalize">
                  {order.paymentMethod === 'cod'
                    ? 'Cash on Delivery'
                    : 'Razorpay'}
                </span>
              </div>
              {order.isPaid && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Paid on</span>
                  <span className="text-neutral-800">
                    {new Date(order.paidAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="rounded-xl border border-neutral-200 bg-white p-6"
          >
            <h2 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-neutral-500" />
              Shipping Address
            </h2>
            {order.shippingAddress && (
              <div className="text-sm text-neutral-700 space-y-1">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.pincode}
                </p>
                <p className="text-neutral-500">
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
