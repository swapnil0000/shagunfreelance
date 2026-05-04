import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN');

const INITIAL_FORM = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxDiscount: '',
  usageLimit: '',
  expiresAt: '',
  isActive: true,
};

function getCouponStatus(coupon) {
  if (!coupon.isActive) return { label: 'Inactive', variant: 'error' };
  if (new Date(coupon.expiresAt) < new Date()) return { label: 'Expired', variant: 'warning' };
  return { label: 'Active', variant: 'success' };
}

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  // Fetch coupons
  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await api.get('/coupons');
      return res.data.data.coupons;
    },
  });

  const coupons = data || [];

  // Create coupon mutation
  const createMutation = useMutation({
    mutationFn: (couponData) => api.post('/coupons', couponData),
    onSuccess: () => {
      toast.success('Coupon created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    },
  });

  // Update coupon mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data: couponData }) =>
      api.put(`/coupons/${id}`, couponData),
    onSuccess: () => {
      toast.success('Coupon updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update coupon');
    },
  });

  // Delete coupon mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setDeleteConfirm(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    },
  });

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: String(coupon.discountValue || ''),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '',
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split('T')[0]
        : '',
      isActive: coupon.isActive !== false,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCoupon(null);
    setForm(INITIAL_FORM);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : undefined,
      maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      isActive: form.isActive,
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold text-neutral-900">
          Coupons
        </h1>
        <Button onClick={openCreateModal} size="sm">
          <Plus className="h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-600">Code</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Type</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Value</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Min Order</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Max Discount</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Usage</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Expires</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Status</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-8 w-16" /></td>
                </tr>
              ))
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-neutral-500">
                  No coupons found. Create one to get started.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => {
                const status = getCouponStatus(coupon);
                return (
                  <tr key={coupon._id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono font-medium text-neutral-900">
                      {coupon.code}
                    </td>
                    <td className="px-4 py-3 capitalize text-neutral-700">
                      {coupon.discountType}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : formatCurrency(coupon.discountValue)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {coupon.minOrderAmount
                        ? formatCurrency(coupon.minOrderAmount)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {coupon.maxDiscount
                        ? formatCurrency(coupon.maxDiscount)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {coupon.usedCount || 0}
                      {coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {formatDate(coupon.expiresAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-brand-600 transition-colors"
                          aria-label={`Edit coupon ${coupon.code}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(coupon)}
                          className="rounded-md p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          aria-label={`Delete coupon ${coupon.code}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Coupon Form Modal */}
      <CouponFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        form={form}
        updateField={updateField}
        handleSubmit={handleSubmit}
        isSaving={isSaving}
        isEditing={!!editingCoupon}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        coupon={deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteMutation.mutate(deleteConfirm._id)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

// ─── Coupon Form Modal ───────────────────────────────────────────────────────

function CouponFormModal({
  isOpen,
  onClose,
  form,
  updateField,
  handleSubmit,
  isSaving,
  isEditing,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
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
            aria-labelledby="coupon-modal-title"
            className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2
                id="coupon-modal-title"
                className="font-heading text-xl font-semibold text-neutral-900"
              >
                {isEditing ? 'Edit Coupon' : 'Add Coupon'}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Coupon Code"
                name="code"
                value={form.code}
                onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                required
                placeholder="e.g. SAVE20"
                className="uppercase"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="w-full">
                  <label
                    htmlFor="discountType"
                    className="mb-1.5 block text-sm font-medium text-neutral-700"
                  >
                    Discount Type
                  </label>
                  <select
                    id="discountType"
                    value={form.discountType}
                    onChange={(e) => updateField('discountType', e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <Input
                  label="Discount Value"
                  name="discountValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountValue}
                  onChange={(e) => updateField('discountValue', e.target.value)}
                  required
                  placeholder={form.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Min Order Amount"
                  name="minOrderAmount"
                  type="number"
                  min="0"
                  value={form.minOrderAmount}
                  onChange={(e) => updateField('minOrderAmount', e.target.value)}
                  placeholder="Optional"
                />
                {form.discountType === 'percentage' && (
                  <Input
                    label="Max Discount"
                    name="maxDiscount"
                    type="number"
                    min="0"
                    value={form.maxDiscount}
                    onChange={(e) => updateField('maxDiscount', e.target.value)}
                    placeholder="Optional"
                  />
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Usage Limit"
                  name="usageLimit"
                  type="number"
                  min="0"
                  value={form.usageLimit}
                  onChange={(e) => updateField('usageLimit', e.target.value)}
                  placeholder="Optional (unlimited)"
                />
                <Input
                  label="Expires At"
                  name="expiresAt"
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => updateField('expiresAt', e.target.value)}
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => updateField('isActive', e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                />
                Active
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={isSaving}>
                  {isEditing ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────────────────────

function DeleteConfirmModal({ coupon, onClose, onConfirm, isDeleting }) {
  if (!coupon) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-coupon-title"
          className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <h3
            id="delete-coupon-title"
            className="text-lg font-semibold text-neutral-900 mb-2"
          >
            Delete Coupon
          </h3>
          <p className="text-sm text-neutral-600 mb-6">
            Are you sure you want to delete coupon{' '}
            <span className="font-mono font-medium">{coupon.code}</span>? This
            action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
              onClick={onConfirm}
              loading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
