'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { urlFor } from '@/lib/sanityClient';
import Image from 'next/image';

export default function CartPreview() {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);

  return (
    <div className="relative">
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span className="text-sm font-medium">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </button>

      {/* Dropdown Preview */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Your cart is empty</p>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.variantId} className="flex items-center py-2 border-b">
                      {item.image && (
                        <div className="w-16 h-16 relative flex-shrink-0">
                          <Image
                            src={(function() {
                              const builder = urlFor(item.image);
                              if (builder && typeof builder.width === 'function' && typeof builder.height === 'function') {
                                const url = builder.width(64).height(64).url();
                                return url ?? '';
                              }
                              return '';
                            })()}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="ml-4 flex-grow">
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.color} / {item.size}
                        </p>
                        <p className="text-sm text-gray-900">
                          ${item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>${total.toFixed(2)}</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/cart"
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      onClick={() => setIsOpen(false)}
                    >
                      View Cart
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 