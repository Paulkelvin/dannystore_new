'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import PaymentForm from './PaymentForm';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/context/CartContext';
import { urlFor } from '@/lib/sanityClient';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutWrapper() {
  const { cart } = useCart();
  const { data: session } = useSession();
  const [customerEmail, setCustomerEmail] = useState<string>(session?.user?.email || '');

  // Listen for email updates from the checkout form
  useEffect(() => {
    const handleEmailUpdate = (event: CustomEvent<{ email: string }>) => {
      console.log('📧 Email update received:', event.detail.email);
      setCustomerEmail(event.detail.email);
    };

    window.addEventListener('checkoutEmailUpdate', handleEmailUpdate as EventListener);
    return () => {
      window.removeEventListener('checkoutEmailUpdate', handleEmailUpdate as EventListener);
    };
  }, []);

  // Update email when session changes
  useEffect(() => {
    if (session?.user?.email) {
      console.log('👤 Session email update:', session.user.email);
      setCustomerEmail(session.user.email);
    }
  }, [session]);

  const subtotal = cart.reduce((total: number, item: CartItem) => total + item.price * (item.quantity ?? 1), 0);
  const shipping = cart.length > 0 ? 10 : 0;
  const total = subtotal + shipping;

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#3B82F6',
      colorBackground: '#ffffff',
      colorText: '#1F2937',
      colorDanger: '#EF4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px',
    },
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some items to your cart to proceed with checkout.</p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-7">
          <CheckoutForm />
        </div>

        {/* Order Summary */}
        <div className="mt-10 lg:mt-0 lg:col-span-5">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <div className="flow-root">
              <ul className="-my-4 divide-y divide-gray-200">
                {cart.map((item: CartItem) => (
                  <li key={item.variantId} className="flex items-center py-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      {(() => {
                        const builder = item.image ? urlFor(item.image) : null;
                        const imageUrl = builder && typeof builder.url === 'function' ? builder.url() : '';
                        return (
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover object-center"
                            sizes="64px"
                          />
                        );
                      })()}
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <p className="ml-4">${item.price.toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.color} / {item.size}
                        </p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <p className="text-gray-500">Qty {item.quantity ?? 1}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>${subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Shipping</p>
                <p>${shipping.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-lg font-medium text-gray-900 border-t border-gray-200 pt-4">
                <p>Total</p>
                <p>${total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 