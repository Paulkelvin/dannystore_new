'use client';

import { useState } from 'react';
import { FaTruck, FaCreditCard } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import ShippingInformation, { ShippingData } from './ShippingInformation';
import ShippingMethod, { ShippingMethod as ShippingMethodType } from './ShippingMethod';
import PaymentAndReview from './PaymentAndReview';
import OrderSummary from './OrderSummary';
import CheckoutProgress, { Step } from './CheckoutProgress';
import { toast } from 'react-hot-toast';

// Define available shipping methods
const availableShippingMethods: ShippingMethodType[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    price: 5.99,
    estimatedDays: '3-5 business days',
    description: 'Free shipping on orders over $50',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    price: 14.99,
    estimatedDays: '1-2 business days',
    description: 'Priority handling and faster delivery',
  },
];

const steps: Step[] = [
  {
    key: 'shipping',
    label: 'Shipping',
    icon: <FaTruck className="inline-block mr-2" />,
  },
  {
    key: 'method',
    label: 'Shipping Method',
    icon: <FaTruck className="inline-block mr-2" />,
  },
  {
    key: 'payment',
    label: 'Payment',
    icon: <FaCreditCard className="inline-block mr-2" />,
  },
];

export default function AccordionCheckout() {
  const { cart: items } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethodType | null>(null);

  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // Handle shipping information completion
  const handleShippingComplete = (data: ShippingData) => {
    setShippingData(data);
    setCurrentStep(1);
  };

  // Handle shipping method selection
  const handleShippingMethodComplete = (method: ShippingMethodType) => {
    setSelectedShippingMethod(method);
    setCurrentStep(2);
  };

  // Handle payment completion
  const handlePaymentComplete = async (paymentIntentId: string) => {
    try {
      // Here you would typically make an API call to your backend to create the order
      // await createOrder({
      //   items,
      //   shippingData,
      //   shippingMethod: selectedShippingMethod,
      //   paymentIntentId,
      // });

      // For now, just show a success message
      toast.success('Order placed successfully!');
      // Redirect to success page
      window.location.href = '/checkout/success';
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    }
  };

  // Handle discount code application
  const handleApplyDiscount = async (code: string) => {
    // Here you would typically make an API call to validate and apply the discount
    // For now, just simulate a delay and show an error for invalid codes
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (code.toLowerCase() !== 'valid') {
      throw new Error('Invalid discount code');
    }
    toast.success('Discount applied successfully!');
  };

  // Calculate order total
  const calculateOrderTotal = () => {
    const shipping = selectedShippingMethod?.price || 0;
    const tax = subtotal * 0.0825; // 8.25% tax rate
    return subtotal + shipping + tax;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#F8F9FA] via-white to-[#E3F0FF] animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-16">
        {/* Progress Indicator */}
        <CheckoutProgress steps={steps} currentStep={currentStep} />

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-16 lg:items-start">
          {/* Checkout Steps */}
          <div className="lg:col-span-7">
            {/* Step 1: Shipping Information */}
            <div className={`mb-8 transition-all duration-300 ${currentStep === 0 ? 'block' : 'hidden'}`}>
              <div className="bg-white rounded-2xl shadow-xl border border-[#DEE2E6] p-12">
                <ShippingInformation
                  onComplete={handleShippingComplete}
                  initialData={shippingData || undefined}
                />
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div className={`mb-8 transition-all duration-300 ${currentStep === 1 ? 'block' : 'hidden'}`}>
              <div className="bg-white rounded-2xl shadow-xl border border-[#DEE2E6] p-12">
                <ShippingMethod
                  methods={availableShippingMethods}
                  onComplete={handleShippingMethodComplete}
                  initialMethod={selectedShippingMethod || undefined}
                />
              </div>
            </div>

            {/* Step 3: Payment & Review */}
            <div className={`mb-8 transition-all duration-300 ${currentStep === 2 ? 'block' : 'hidden'}`}>
              <div className="bg-white rounded-2xl shadow-xl border border-[#DEE2E6] p-12">
                {shippingData && selectedShippingMethod && (
                  <PaymentAndReview
                    shippingData={shippingData}
                    shippingMethod={selectedShippingMethod}
                    orderTotal={calculateOrderTotal()}
                    onComplete={handlePaymentComplete}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-12 lg:mt-0 lg:col-span-5">
            <OrderSummary
              items={items}
              shippingMethod={selectedShippingMethod || undefined}
              subtotal={subtotal}
              onApplyDiscount={handleApplyDiscount}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
} 