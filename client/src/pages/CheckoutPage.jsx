import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CreditCard, CheckCircle } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import ShippingForm from '../components/checkout/ShippingForm';
import PaymentStep from '../components/checkout/PaymentStep';
import ConfirmationStep from '../components/checkout/ConfirmationStep';

const STEPS = [
  { id: 1, label: 'Shipping', icon: Package },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Confirmation', icon: CheckCircle },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (items.length === 0 && currentStep === 1) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, currentStep, navigate]);

  if (!isAuthenticated) return null;

  const handleShippingNext = (address) => {
    setShippingAddress(address);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentBack = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order) => {
    setCompletedOrder(order);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top bar */}
      {/* <div className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-neutral-900 font-heading tracking-tight">
              Zimor India
            </h1>
            <span className="text-sm text-neutral-400">Secure Checkout</span>
          </div>
        </div>
      </div> */}

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        {currentStep < 3 && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-0">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          isCompleted
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : isActive
                            ? 'border-neutral-900 bg-white text-neutral-900'
                            : 'border-neutral-200 bg-white text-neutral-300'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <span
                        className={`mt-1.5 text-[11px] font-medium ${
                          isActive
                            ? 'text-neutral-900'
                            : isCompleted
                            ? 'text-neutral-500'
                            : 'text-neutral-300'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {idx < STEPS.length - 1 && (
                      <div
                        className={`mx-2 mb-4 h-px w-14 sm:w-24 transition-colors duration-300 ${
                          currentStep > step.id ? 'bg-neutral-900' : 'bg-neutral-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className={`${currentStep < 3 ? 'bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8' : ''}`}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <ShippingForm
                key="shipping"
                onNext={handleShippingNext}
                savedAddress={shippingAddress}
              />
            )}
            {currentStep === 2 && (
              <PaymentStep
                key="payment"
                shippingAddress={shippingAddress}
                onBack={handlePaymentBack}
                onSuccess={handleOrderSuccess}
              />
            )}
            {currentStep === 3 && (
              <ConfirmationStep
                key="confirmation"
                order={completedOrder}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
