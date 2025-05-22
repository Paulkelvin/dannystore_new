import { useState, useEffect } from 'react';
import { FaCreditCard, FaLock } from 'react-icons/fa';
import { loadStripe, PaymentIntentResult } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { ShippingData } from './ShippingInformation';
import { ShippingMethod } from './ShippingMethod';
import { useCart } from '@/context/CartContext';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentAndReviewProps {
  shippingData: ShippingData;
  shippingMethod: ShippingMethod;
  orderTotal: number;
  onComplete: (paymentIntentId: string) => void;
}

interface PaymentFormProps {
  onComplete: (paymentIntentId: string) => void;
  orderTotal: number;
  email: string;
  cartItems: any[];
  shippingAddress: any;
  paymentIntentId: string;
}

// Utility to get or create a persistent orderNumber for the session
function getOrCreateOrderNumber() {
  let orderNumber = localStorage.getItem('checkout_orderNumber');
  if (!orderNumber) {
    orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('checkout_orderNumber', orderNumber);
  }
  return orderNumber;
}

function clearOrderNumber() {
  localStorage.removeItem('checkout_orderNumber');
}

function PaymentForm({ onComplete, orderTotal, email, cartItems, shippingAddress, paymentIntentId }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      // Confirm the payment using the existing payment intent
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
        },
        redirect: 'always',
      }) as PaymentIntentResult;

      if ('error' in result) {
        setErrorMessage(result.error?.message || 'An error occurred during payment.');
      } else if ('paymentIntent' in result && result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        clearOrderNumber();
        onComplete(result.paymentIntent.id);
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#FFC300] text-[#333333] text-lg font-bold py-4 rounded-xl shadow-lg hover:bg-[#FFD740] transition-all focus:outline-none focus:ring-2 focus:ring-[#42A5F5]/40 disabled:bg-[#DEE2E6] disabled:text-[#6c757d] disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : `Pay $${orderTotal.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function PaymentAndReview({
  shippingData,
  shippingMethod,
  orderTotal,
  onComplete,
}: PaymentAndReviewProps) {
  const { cart: cartItems } = useCart();
  console.log('cartItems in PaymentAndReview:', cartItems);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Defensive: Only run if cartItems is a non-empty array
  useEffect(() => {
    if (clientSecret) return;
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      setIsLoading(false); // Stop loading if cart is empty
      return;
    }

    const createPaymentIntent = async () => {
      const orderNumber = getOrCreateOrderNumber();
      console.log('💰 Creating payment intent for order:', orderNumber);
      console.log('cartItems being sent to backend:', cartItems);

      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(orderTotal * 100),
            email: shippingData.email,
            cartItems: cartItems,
            shippingAddress: shippingData,
            orderNumber,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create payment intent');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();

    // Cleanup function to cancel payment intent if component unmounts
    return () => {
      if (clientSecret) {
        fetch('/api/cancel-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientSecret }),
        }).catch(console.error);
      }
    };
  }, [cartItems, orderTotal, shippingData, clientSecret]);

  // Show message if cart is empty
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return <div>Your cart is empty. Please add items before checking out.</div>;
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading payment form...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!clientSecret || !paymentIntentId) {
    return <div className="text-red-500">Failed to initialize payment form</div>;
  }

  // Format address for display
  const formatAddress = (data: ShippingData) => {
    const parts = [
      data.fullName,
      data.address1,
      data.address2,
      `${data.city}, ${data.state} ${data.zipCode}`,
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center mb-6">
        <FaCreditCard className="text-2xl text-[#42A5F5] mr-3" />
        <h2 className="text-3xl font-extrabold text-[#333333] tracking-tight">Payment Details</h2>
      </div>
      <div className="border-b border-[#DEE2E6] mb-6" />

      {/* Shipping Address Review */}
      <div className="bg-white rounded-lg p-6 border border-[#DEE2E6]">
        <h3 className="text-lg font-semibold text-[#333333] mb-4">Shipping Address</h3>
        <p className="text-[#6c757d]">{formatAddress(shippingData)}</p>
      </div>

      {/* Shipping Method Review */}
      <div className="bg-white rounded-lg p-6 border border-[#DEE2E6]">
        <h3 className="text-lg font-semibold text-[#333333] mb-4">Shipping Method</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[#6c757d]">{shippingMethod.name}</p>
            <p className="text-sm text-[#6c757d] mt-1">
              Estimated delivery: {shippingMethod.estimatedDays}
            </p>
          </div>
          <span className="font-semibold text-[#333333]">
            ${shippingMethod.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-lg p-6 border border-[#DEE2E6]">
        <h3 className="text-lg font-semibold text-[#333333] mb-4">Payment Method</h3>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm 
            onComplete={onComplete} 
            orderTotal={orderTotal} 
            email={shippingData.email} 
            cartItems={cartItems} 
            shippingAddress={shippingData}
            paymentIntentId={paymentIntentId}
          />
        </Elements>
        <div className="flex items-center mt-6 text-[#6c757d] text-sm">
          <FaLock className="mr-2 text-[#42A5F5]" />
          Your payment details are securely processed by Stripe.
        </div>
      </div>
    </div>
  );
} 