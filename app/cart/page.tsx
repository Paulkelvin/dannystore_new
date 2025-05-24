'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { urlFor } from '@/lib/sanityClient';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart: items, removeItem, updateItemQuantity: updateQuantity } = useCart();

  const total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-6 pt-32">
        <h1 className="text-2xl font-bold text-[#333333] mb-4">Your cart is empty</h1>
        <Link 
          href="/products" 
          className="mt-2 px-6 py-3 bg-[#FFC300] text-[#333333] font-semibold rounded-lg shadow hover:bg-[#FFD740] transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 pt-32">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#333333] mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const imageUrlBuilder = urlFor(item.image);
              return (
                <div key={item.variantId} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={imageUrlBuilder ? imageUrlBuilder.url() : '/placeholder.png'}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <h3 className="font-semibold text-[#333333]">{item.name}</h3>
                    {/* Only show variant info if it exists */}
                    {(item.color || item.size) && (
                      <p className="text-sm text-gray-600">
                        {[item.color, item.size].filter(Boolean).join(' - ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(item.variantId, (item.quantity || 1) - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 py-1">{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, (item.quantity || 1) + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-semibold text-[#333333]">
                      ${(item.price * (item.quantity || 1)).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-[#333333] mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Calculated at checkout</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                className="w-full mt-6 px-6 py-3 bg-[#FFC300] text-[#333333] font-semibold rounded-lg shadow hover:bg-[#FFD740] transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 