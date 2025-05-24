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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shopping Cart</h3>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Your cart is empty</p>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {cart.map((item) => {
                    const imageUrlBuilder = urlFor(item.image);
                    return (
                      <div key={item.variantId} className="flex items-center gap-4 py-2 border-b last:border-b-0">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={imageUrlBuilder ? imageUrlBuilder.url() : '/placeholder.png'}
                            alt={item.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h4>
                          {/* Only show variant info if it exists */}
                          {(item.color || item.size) && (
                            <p className="text-xs text-gray-500 truncate">
                              {[item.color, item.size].filter(Boolean).join(' - ')}
                            </p>
                          )}
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-gray-600">
                              Qty: {item.quantity || 1}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              ${(item.price * (item.quantity || 1)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/cart"
                      className="block w-full px-4 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      View Cart
                    </Link>
                    <Link
                      href="/checkout"
                      className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-[#FFC300] hover:bg-[#FFD740] rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Checkout
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