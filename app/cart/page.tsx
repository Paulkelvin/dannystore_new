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
    <div className="min-h-screen bg-[#F8F9FA] pt-40 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-10 py-12">
        <h1 className="text-3xl font-extrabold text-[#333333] mb-10">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
          <div className="lg:col-span-8">
            {items.map((item, idx) => (
              <div 
                key={`${item.productId}-${item.variantId}`}
                className="flex gap-6 py-6 border-b border-[#DEE2E6]"
              >
                <div className="relative w-36 h-36 bg-gray-100 rounded-lg flex items-center justify-center">
                  {item.image && item.image.asset ? (
                    <Image
                      src={urlFor(item.image)?.width(160).height(160).url() ?? '/images/placeholder.png'}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm text-center p-4">
                      No image available
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-[#333333] text-lg leading-tight">{item.name}</h3>
                      <p className="text-sm text-[#6c757d] mt-1">{item.variantTitle}</p>
                    </div>
                    <p className="font-bold text-[#333333] text-lg">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center border rounded px-2 py-1 bg-white">
                      <button
                        onClick={() => updateQuantity(item.variantId, (item.quantity || 1) - 1)}
                        className="px-2 text-[#42A5F5] text-lg font-bold focus:outline-none disabled:opacity-50"
                        disabled={item.quantity === 1}
                        aria-label="Decrease quantity"
                      >-</button>
                      <span className="mx-2 w-6 text-center select-none">{item.quantity || 1}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, (item.quantity || 1) + 1)}
                        className="px-2 text-[#42A5F5] text-lg font-bold focus:outline-none"
                        aria-label="Increase quantity"
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="ml-2 text-[#6c757d] hover:text-[#42A5F5] transition-colors focus:outline-none"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <Link
              href="/products"
              className="inline-block mt-8 px-6 py-3 border border-[#42A5F5] text-[#42A5F5] font-semibold rounded-lg hover:bg-[#42A5F5] hover:text-white transition-colors text-center"
            >
              Continue Shopping
            </Link>
          </div>
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl p-10 shadow border border-[#E5E7EB]">
              <h2 className="text-xl font-bold text-[#333333] mb-6">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-[#4A4A4A]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#333333]">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#6c757d]">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t border-[#DEE2E6] mt-6 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#333333]">Total</span>
                  <span className="text-2xl font-extrabold text-[#333333]">${total.toFixed(2)}</span>
                </div>
              </div>
              <Link href="/checkout" className="w-full block bg-[#FFC300] text-[#333333] text-lg font-bold py-4 rounded-lg mt-8 shadow hover:bg-[#FFD740] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2 text-center">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 