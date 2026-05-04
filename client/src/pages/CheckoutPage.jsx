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

  // Protected route — redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Redirect to cart if empty (only on shipping step)
  useEffect(() => {
    if (items.length === 0 && currentStep < 3) {
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
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-neutral-900 mb-8 text-center font-heading">
          Checkout
        </h1>

        {/* Step Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-center">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  {/* Step circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                        isCompleted
                          ? 'border-success bg-success text-white'
                          : isActive
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-neutral-300 bg-white text-neutral-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive
                          ? 'text-brand-600'
                          : isCompleted
                          ? 'text-success'
                          : 'text-neutral-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Connector line */}
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`mx-3 h-0.5 w-12 sm:w-20 transition-colors duration-300 ${
                        currentStep > step.id
                          ? 'bg-success'
                          : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
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
  );
}
