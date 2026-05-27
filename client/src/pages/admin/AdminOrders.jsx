import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, ChevronDown, Download, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const VALID_TRANSITIONS = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
};

const STATUS_BADGE_MAP = {
  pending:    'warning',
  confirmed:  'info',
  processing: 'info',
  shipped:    'info',
  delivered:  'success',
  cancelled:  'error',
};

const ALL_STATUSES = ['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus]         = useState('');
  const [statusNote, setStatusNote]       = useState('');
  const [showRefund, setShowRefund]       = useState(false);
  const [refundAmount, setRefundAmount]   = useState('');
  const [refundReason, setRefundReason]   = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn:  async () => {
      const res = await api.get('/orders');
      return res.data.data.orders;
    },
  });

  const orders         = data || [];
  const filteredOrders = statusFilter === 'All' ? orders : orders.filter((o) => o.status === statusFilter);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, note }) => api.put(`/orders/${orderId}/status`, { status, note }),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(null);
      setNewStatus('');
      setStatusNote('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  const refundMutation = useMutation({
    mutationFn: ({ orderId, amount, reason }) =>
      api.post(`/orders/${orderId}/refund`, { amount: amount || undefined, reason }),
    onSuccess: () => {
      toast.success('Refund processed successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(null);
      setShowRefund(false);
      setRefundAmount('');
      setRefundReason('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Refund failed'),
  });

  const handleStatusUpdate = () => {
    if (!newStatus || !selectedOrder) return;
    updateStatusMutation.mutate({ orderId: selectedOrder._id, status: newStatus, note: statusNote.trim() || undefined });
  };

  const handleRefund = () => {
    if (!selectedOrder) return;
    refundMutation.mutate({
      orderId: selectedOrder._id,
      amount:  refundAmount ? Number(refundAmount) : undefined,
      reason:  refundReason || 'Refund requested by admin',
    });
  };

  const handleDownloadInvoice = async (order) => {
    setDownloadingInvoice(true);
    try {
      const res = await api.get(`/orders/${order._id}/invoice`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `invoice-${order.orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setNewStatus('');
    setStatusNote('');
    setShowRefund(false);
    setRefundAmount(order.total?.toString() || '');
    setRefundReason('');
  };

  const canRefund = (order) =>
    order?.isPaid &&
    order?.paymentMethod === 'razorpay' &&
    order?.refund?.status !== 'processed';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold text-neutral-900">Orders</h1>
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
              <th className="px-4 py-3 font-medium text-neutral-600">Total</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Payment</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Status</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Date</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">No orders found.</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-neutral-700">{order.user?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-neutral-700">{order.items?.length || 0}</td>
                  <td className="px-4 py-3 text-neutral-700">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium uppercase text-neutral-600">
                      {order.paymentMethod}
                    </span>
                    {order.refund?.status === 'processed' && (
                      <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Refunded</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE_MAP[order.status] || 'default'}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 flex items-center gap-1">
                    <button
                      onClick={() => openOrderDetail(order)}
                      className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-brand-600 transition-colors"
                      title="View order"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {order.isPaid && (
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        disabled={downloadingInvoice}
                        className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-brand-600 transition-colors"
                        title="Download invoice"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10 pb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} aria-hidden="true" />

            <motion.div
              role="dialog" aria-modal="true"
              className="relative w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-neutral-900">
                    Order #{selectedOrder.orderNumber}
                  </h2>
                  {selectedOrder.refund?.status === 'processed' && (
                    <span className="mt-1 inline-block rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                      Refunded — ₹{selectedOrder.refund.amount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedOrder.isPaid && (
                    <button
                      onClick={() => handleDownloadInvoice(selectedOrder)}
                      disabled={downloadingInvoice}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {downloadingInvoice ? 'Downloading…' : 'Invoice'}
                    </button>
                  )}
                  {canRefund(selectedOrder) && !showRefund && (
                    <button
                      onClick={() => setShowRefund(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-50 transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Refund
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">

                {/* Refund Panel */}
                {showRefund && (
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-orange-800">Process Refund</p>
                      <button onClick={() => setShowRefund(false)} className="text-orange-400 hover:text-orange-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-orange-800">
                          Refund Amount (₹) — leave blank to refund full ₹{selectedOrder.total}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={selectedOrder.total}
                          placeholder={selectedOrder.total}
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-orange-800">Reason</label>
                        <input
                          type="text"
                          placeholder="Reason for refund…"
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                          className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={handleRefund}
                        loading={refundMutation.isPending}
                        className="!bg-orange-600 hover:!bg-orange-700"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Confirm Refund
                      </Button>
                    </div>
                  </div>
                )}

                {/* Customer + Payment */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-neutral-500">Customer</p>
                    <p className="font-medium text-neutral-900">{selectedOrder.user?.name || 'N/A'}</p>
                    <p className="text-sm text-neutral-500">{selectedOrder.user?.email || ''}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Payment</p>
                    <p className="font-medium uppercase text-neutral-900">{selectedOrder.paymentMethod}</p>
                    {selectedOrder.paymentResult?.razorpayPaymentId && (
                      <p className="font-mono text-xs text-neutral-400">{selectedOrder.paymentResult.razorpayPaymentId}</p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <p className="mb-1 text-xs font-medium text-neutral-700">Shipping Address</p>
                  <div className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
                    <p>{selectedOrder.shippingAddress?.fullName}</p>
                    <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                    {selectedOrder.shippingAddress?.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} — {selectedOrder.shippingAddress?.pincode}</p>
                    <p className="text-neutral-500">Ph: {selectedOrder.shippingAddress?.phone}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="mb-2 text-xs font-medium text-neutral-700">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                            <p className="text-xs text-neutral-500">
                              Qty: {item.quantity}
                              {item.size  && ` · ${item.size}`}
                              {item.color && ` · ${item.color}`}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-neutral-700">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="rounded-lg bg-neutral-50 p-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between"><span className="text-neutral-500">Discount</span><span className="text-emerald-600">-{formatCurrency(selectedOrder.discount)}</span></div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Shipping</span>
                      <span>{selectedOrder.shippingCost === 0 ? 'Free' : formatCurrency(selectedOrder.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold">
                      <span>Total</span><span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Status History */}
                {selectedOrder.statusHistory?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-neutral-700">Status History</p>
                    <div className="space-y-2">
                      {selectedOrder.statusHistory.map((entry, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="mt-1.5 h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                          <div>
                            <p className="text-sm font-medium capitalize text-neutral-800">{entry.status}</p>
                            <p className="text-xs text-neutral-400">
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
                {(VALID_TRANSITIONS[selectedOrder.status] || []).length > 0 && (
                  <div className="border-t border-neutral-200 pt-4">
                    <p className="mb-3 text-xs font-medium text-neutral-700">Update Status</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <label className="mb-1.5 block text-xs text-neutral-500">New Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="">Select status…</option>
                          {VALID_TRANSITIONS[selectedOrder.status].map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="mb-1.5 block text-xs text-neutral-500">Note (optional)</label>
                        <input
                          type="text"
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          placeholder="Add a note…"
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <Button size="sm" onClick={handleStatusUpdate} loading={updateStatusMutation.isPending} disabled={!newStatus}>
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
    </div>
  );
}
