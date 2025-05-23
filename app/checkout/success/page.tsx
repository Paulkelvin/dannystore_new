'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

export default function SuccessPage() {
  const [status, setStatus] = useState<'processing' | 'succeeded' | 'failed'>('processing');
  const [showActivationPrompt, setShowActivationPrompt] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    
    const payment_intent = searchParams.get('payment_intent');
    if (payment_intent) {
      console.log('Payment Intent ID:', payment_intent);
      // Fetch the real status from the backend
      fetch(`/api/payment-intent-status?payment_intent=${payment_intent}`)
        .then(res => res.json())
        .then(data => {
          console.log('Payment Status Response:', data);
          // Handle all possible Stripe payment intent statuses
          switch (data.status) {
            case 'succeeded':
              console.log('Setting status to succeeded');
              setStatus('succeeded');
              // If user is not logged in, show activation prompt
              if (!session?.user) {
                // Fetch customer email from the payment intent
                fetch(`/api/payment-intent-details?payment_intent=${payment_intent}`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.customerEmail) {
                      setCustomerEmail(data.customerEmail);
                      setShowActivationPrompt(true);
                    }
                  })
                  .catch(console.error);
              }
              break;
            case 'processing':
            case 'requires_payment_method':
            case 'requires_confirmation':
            case 'requires_action':
            case 'requires_capture':
              console.log('Setting status to processing');
              setStatus('processing');
              break;
            default:
              console.log('Setting status to failed, received status:', data.status);
              setStatus('failed');
          }
        })
        .catch((error) => {
          console.error('Error fetching payment status:', error);
          setStatus('failed');
        });
    } else {
      console.log('No payment_intent found in URL');
      setStatus('failed');
    }
  }, [searchParams]);

  // Only show activation prompt if NOT logged in
  const shouldShowActivation = showActivationPrompt && !session?.user;

  return (
    <div className="max-w-2xl mx-auto px-4 py-32 mt-16 text-center">
      {status === 'processing' && (
        <>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Processing your payment...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </>
      )}

      {status === 'succeeded' && (
        <>
          <div className="mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. We'll send you an email confirmation shortly.
          </p>
          <p className="text-gray-600 mb-8">
            You can view your order history and track your order status in your{' '}
            <Link href="/account" className="text-blue-600 hover:text-blue-800 underline">
              account dashboard
            </Link>.
          </p>
          
          {shouldShowActivation && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Activate Your Account</h2>
              <p className="text-blue-700 mb-4">
                Would you like to activate your account to track your order and save your information for future purchases?
              </p>
              <button
                onClick={() => signIn('google', { callbackUrl: '/account' })}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-100 focus:ring-1 focus:ring-blue-500 mr-4 transition-colors"
                style={{ minWidth: 220, fontWeight: 500 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-5 h-5 mr-2"
                >
                  <g>
                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.09 30.18 0 24 0 14.82 0 6.73 5.48 2.69 13.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.66 7.01l7.19 5.6C43.98 37.36 46.1 31.44 46.1 24.55z"/>
                    <path fill="#FBBC05" d="M9.67 28.65c-1.13-3.36-1.13-6.99 0-10.35l-7.98-6.2C-1.13 17.09-1.13 30.91 1.69 37.91l7.98-6.2z"/>
                    <path fill="#EA4335" d="M24 48c6.18 0 11.64-2.09 15.85-5.72l-7.19-5.6c-2.01 1.35-4.59 2.15-8.66 2.15-6.38 0-11.87-3.63-14.33-8.94l-7.98 6.2C6.73 42.52 14.82 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </g>
                </svg>
                <span>Sign in with Google</span>
              </button>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue as Guest
              </Link>
            </div>
          )}

          {!shouldShowActivation && (
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue Shopping
            </Link>
          )}
        </>
      )}

      {status === 'failed' && (
        <>
          <div className="mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-8">
            We couldn't process your payment. Please try again or contact support if the problem persists.
          </p>
          <Link
            href="/checkout"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Checkout
          </Link>
        </>
      )}
    </div>
  );
} 