'use client';

import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

interface PaymentFormProps {
  isLoading: boolean;
}

export default function PaymentForm({ isLoading }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  if (!stripe || !elements) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h2>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: 'Jane Doe',
                email: 'jane@example.com',
              },
            },
          }}
        />
      </div>
    </div>
  );
} 