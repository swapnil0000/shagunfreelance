import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { shippingAddressSchema } from '../../schemas/checkoutSchemas';
import useAuthStore from '../../stores/authStore';
import Input from '../ui/Input';
import Button from '../ui/Button';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

export default function ShippingForm({ onNext, savedAddress }) {
  const { user } = useAuthStore();
  const addresses = user?.addresses || [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: savedAddress || {
      fullName: user?.name || '',
      phone: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  const handleSelectAddress = (address) => {
    setValue('fullName', address.fullName);
    setValue('phone', address.phone);
    setValue('addressLine1', address.addressLine1);
    setValue('addressLine2', address.addressLine2 || '');
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('pincode', address.pincode);
  };

  const onSubmit = (data) => {
    onNext(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Saved Addresses */}
      {addresses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">
            Saved Addresses
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.map((addr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectAddress(addr)}
                className="text-left rounded-lg border border-neutral-200 p-3 hover:border-brand-500 hover:bg-brand-50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-neutral-600">
                    <p className="font-medium text-neutral-800">{addr.fullName}</p>
                    <p>{addr.addressLine1}</p>
                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p>{addr.phone}</p>
                  </div>
                </div>
                {addr.isDefault && (
                  <span className="mt-1 inline-block text-[10px] font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                    Default
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Address Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full Name"
            placeholder="Enter full name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Phone Number"
            placeholder="10-digit mobile number"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <Input
          label="Address Line 1"
          placeholder="House no., Building, Street"
          error={errors.addressLine1?.message}
          {...register('addressLine1')}
        />

        <Input
          label="Address Line 2 (Optional)"
          placeholder="Landmark, Area"
          error={errors.addressLine2?.message}
          {...register('addressLine2')}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="City"
            placeholder="City"
            error={errors.city?.message}
            {...register('city')}
          />

          <div className="w-full">
            <label
              htmlFor="state"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              State
            </label>
            <select
              id="state"
              {...register('state')}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-neutral-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                errors.state ? 'border-error' : 'border-neutral-300'
              }`}
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-error" role="alert">
                {errors.state.message}
              </p>
            )}
          </div>

          <Input
            label="Pincode"
            placeholder="6-digit pincode"
            error={errors.pincode?.message}
            {...register('pincode')}
          />
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto">
            Continue to Payment
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
