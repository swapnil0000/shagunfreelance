import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Eye, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const STATUS_BADGE_MAP = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
};

const ALL_STATUSES = ['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN');

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // Fetch all orders
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data.data.orders;
    },
  });

  const orders = data || [];

  // Filter orders by status
  const filteredOrders = statusFilter === 'All'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, note }) =>
      api.put(`/orders/${orderId}/status`, { status, note }),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(null);
      setNewStatus('');
      setStatusNote('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  const handleStatusUpdate = () => {
    if (!newStatus || !selectedOrder) return;
    updateStatusMutation.mutate({
      orderId: selectedOrder._id,
      status: newStatus,
      note: statusNote.trim() || undefined,
    });
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setNewStatus('');
    setStatusNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold text-neutral-900">
          Orders
        </h1>
        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-lg border border-neutral-300 bg-white py-2 pl-4 pr-10 text-sm text-neutral-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-600">Order #</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Customer</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Items</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Total (₹)</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Status</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Date</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-8 w-16" /></td>
                </tr>
              ))
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {order.user?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {order.items?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE_MAP[order.status] || 'default'}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openOrderDetail(order)}
                      className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-brand-600 transition-colors"
                      aria-label={`View order ${order.orderNumber}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        statusNote={statusNote}
        setStatusNote={setStatusNote}
        onUpdateStatus={handleStatusUpdate}
        isUpdating={updateStatusMutation.isPending}
      />
    </div>
  );
}

// ─── Order Detail Modal ──────────────────────────────────────────────────────

function OrderDetailModal({
  order,
  onClose,
  newStatus,
  setNewStatus,
  statusNote,
  setStatusNote,
  onUpdateStatus,
  isUpdating,
}) {
  if (!order) return null;

  const validNextStatuses = VALID_TRANSITIONS[order.status] || [];

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10 pb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-detail-title"
            className="relative w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2
                id="order-detail-title"
                className="font-heading text-xl font-semibold text-neutral-900"
              >
                Order #{order.orderNumber}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Info Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-neutral-500">Customer</p>
                  <p className="font-medium text-neutral-900">{order.user?.name || 'N/A'}</p>
                  <p className="text-sm text-neutral-600">{order.user?.email || ''}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Payment Method</p>
                  <p className="font-medium text-neutral-900 uppercase">{order.paymentMethod}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-1">Shipping Address</p>
                <div className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
                  <p>{order.shippingAddress?.fullName}</p>
                  <p>{order.shippingAddress?.addressLine1}</p>
                  {order.shippingAddress?.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </p>
                  <p>Phone: {order.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-2">Items</p>
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                          <p className="text-xs text-neutral-500">
                            Qty: {item.quantity}
                            {item.size && ` · Size: ${item.size}`}
                            {item.color && ` · Color: ${item.color}`}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-neutral-700">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-lg bg-neutral-50 p-4">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="text-neutral-800">{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Discount</span>
                      <span className="text-green-600">-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Shipping</span>
                    <span className="text-neutral-800">
                      {order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold">
                    <span className="text-neutral-900">Total</span>
                    <span className="text-neutral-900">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              {order.statusHistory?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">Status History</p>
                  <div className="space-y-2">
                    {order.statusHistory.map((entry, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-neutral-800 capitalize">
                            {entry.status}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(entry.timestamp).toLocaleString('en-IN')}
                            {entry.note && ` — ${entry.note}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update */}
              {validNextStatuses.length > 0 && (
                <div className="border-t border-neutral-200 pt-4">
                  <p className="text-sm font-medium text-neutral-700 mb-3">Update Status</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label htmlFor="new-status" className="mb-1.5 block text-sm text-neutral-600">
                        New Status
                      </label>
                      <select
                        id="new-status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">Select status...</option>
                        {validNextStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label htmlFor="status-note" className="mb-1.5 block text-sm text-neutral-600">
                        Note (optional)
                      </label>
                      <input
                        id="status-note"
                        type="text"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="Add a note..."
                        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={onUpdateStatus}
                      loading={isUpdating}
                      disabled={!newStatus}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
