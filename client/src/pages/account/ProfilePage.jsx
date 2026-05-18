import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, MapPin, Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../../stores/authStore';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number')
    .or(z.literal(''))
    .optional(),
});

const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').trim(),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  addressLine1: z.string().min(1, 'Address line 1 is required').trim(),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().min(1, 'State is required').trim(),
  pincode: z
    .string()
    .min(1, 'Pincode is required')
    .regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  isDefault: z.boolean().optional(),
});

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressIdx, setEditingAddressIdx] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  // Address form
  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddress,
    formState: { errors: addressErrors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    },
  });

  // Update profile mutation
  const profileMutation = useMutation({
    mutationFn: (data) => api.put('/auth/me', data).then((r) => r.data),
    onSuccess: (data) => {
      const updatedUser = data.data?.user;
      if (updatedUser) updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Profile updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  // Save addresses mutation
  const addressMutation = useMutation({
    mutationFn: (addresses) =>
      api.put('/auth/me', { addresses }).then((r) => r.data),
    onSuccess: (data) => {
      const updatedUser = data.data?.user;
      if (updatedUser) updateUser(updatedUser);
      toast.success('Addresses updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update addresses');
    },
  });

  const onProfileSubmit = (data) => {
    profileMutation.mutate(data);
  };

  const openAddAddress = () => {
    setEditingAddressIdx(null);
    resetAddress({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
    setIsAddressModalOpen(true);
  };

  const openEditAddress = (idx) => {
    const addr = user?.addresses?.[idx];
    if (!addr) return;
    setEditingAddressIdx(idx);
    resetAddress({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      isDefault: addr.isDefault || false,
    });
    setIsAddressModalOpen(true);
  };

  const onAddressSubmit = (data) => {
    const addresses = [...(user?.addresses || [])];
    if (data.isDefault) {
      addresses.forEach((a) => (a.isDefault = false));
    }
    if (editingAddressIdx !== null) {
      addresses[editingAddressIdx] = data;
    } else {
      addresses.push(data);
    }
    addressMutation.mutate(addresses);
    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = (idx) => {
    const addresses = [...(user?.addresses || [])];
    addresses.splice(idx, 1);
    addressMutation.mutate(addresses);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-neutral-900 font-heading">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your personal information and addresses
          </p>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-8 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Personal Information
            </h2>
          </div>

          <form
            onSubmit={handleProfileSubmit(onProfileSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full Name"
                {...registerProfile('name')}
                error={profileErrors.name?.message}
              />
              <Input
                label="Phone Number"
                placeholder="9876543210"
                {...registerProfile('phone')}
                error={profileErrors.phone?.message}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-neutral-400">
                Email cannot be changed
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                loading={profileMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-6 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Saved Addresses
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={openAddAddress}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {!user?.addresses?.length ? (
            <div className="py-8 text-center">
              <MapPin className="mx-auto h-10 w-10 text-neutral-300" />
              <p className="mt-2 text-sm text-neutral-500">
                No saved addresses
              </p>
              <button
                onClick={openAddAddress}
                className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Add your first address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {user.addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between rounded-lg border border-neutral-100 p-4"
                >
                  <div className="text-sm text-neutral-700 space-y-0.5">
                    <p className="font-medium text-neutral-900">
                      {addr.fullName}
                      {addr.isDefault && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                          Default
                        </span>
                      )}
                    </p>
                    <p>{addr.addressLine1}</p>
                    {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                    <p>
                      {addr.city}, {addr.state} {addr.pincode}
                    </p>
                    <p className="text-neutral-500">Phone: {addr.phone}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditAddress(idx)}
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                      aria-label="Edit address"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(idx)}
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-error transition-colors"
                      aria-label="Delete address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Address Modal */}
        <Modal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          title={editingAddressIdx !== null ? 'Edit Address' : 'Add Address'}
        >
          <form
            onSubmit={handleAddressSubmit(onAddressSubmit)}
            className="space-y-4"
          >
            <Input
              label="Full Name"
              {...registerAddress('fullName')}
              error={addressErrors.fullName?.message}
            />
            <Input
              label="Phone Number"
              placeholder="9876543210"
              {...registerAddress('phone')}
              error={addressErrors.phone?.message}
            />
            <Input
              label="Address Line 1"
              {...registerAddress('addressLine1')}
              error={addressErrors.addressLine1?.message}
            />
            <Input
              label="Address Line 2 (Optional)"
              {...registerAddress('addressLine2')}
              error={addressErrors.addressLine2?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                {...registerAddress('city')}
                error={addressErrors.city?.message}
              />
              <Input
                label="State"
                {...registerAddress('state')}
                error={addressErrors.state?.message}
              />
            </div>
            <Input
              label="Pincode"
              placeholder="110001"
              {...registerAddress('pincode')}
              error={addressErrors.pincode?.message}
            />
            <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                {...registerAddress('isDefault')}
                className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
              />
              Set as default address
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setIsAddressModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={addressMutation.isPending}>
                {editingAddressIdx !== null ? 'Update' : 'Add'} Address
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
