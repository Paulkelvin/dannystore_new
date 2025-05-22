import { useState } from 'react';
import Image from 'next/image';
import { FaLock } from 'react-icons/fa';
import { ShippingMethod } from './ShippingMethod';
import { urlFor } from '@/lib/sanityClient';

interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  image: any;
  color?: string;
  size?: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  shippingMethod?: ShippingMethod;
  subtotal: number;
  taxRate?: number;
  onApplyDiscount: (code: string) => Promise<void>;
}

export default function OrderSummary({
  items = [],
  shippingMethod,
  subtotal = 0,
  taxRate = 0.0825, // Default tax rate of 8.25%
  onApplyDiscount,
}: OrderSummaryProps) {
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Ensure we have valid numbers
  const safeSubtotal = Number(subtotal) || 0;
  const safeTaxRate = Number(taxRate) || 0;
  const safeShipping = Number(shippingMethod?.price) || 0;

  const tax = safeSubtotal * safeTaxRate;
  const shipping = safeShipping;
  const total = safeSubtotal + tax + shipping;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    setIsApplyingDiscount(true);
    setDiscountError(null);

    try {
      await onApplyDiscount(discountCode);
      setDiscountCode('');
    } catch (error) {
      setDiscountError('Invalid discount code');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[#DEE2E6] p-6 lg:p-8">
      <h2 className="text-2xl font-extrabold text-[#333333] mb-6">Order Summary</h2>
      <div className="border-b border-[#DEE2E6] mb-6" />

      {/* Product List */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId}`} className="flex items-center space-x-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              {item.image ? (() => {
                const builder = urlFor(item.image);
                const imageUrl = builder && typeof builder.url === 'function' ? builder.url() : '';
                return (
                  <Image
                    src={imageUrl}
                    alt={item.name || 'Product image'}
                    fill
                    className="object-cover rounded-lg"
                    sizes="80px"
                  />
                );
              })() : (
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#333333] font-medium truncate">{item.name}</p>
              <p className="text-[#6c757d] text-sm truncate">{item.variantTitle || `${item.color || ''} / ${item.size || ''}`}</p>
              <p className="text-[#6c757d] text-sm">Qty: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="text-[#333333] font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Discount Code */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Discount code"
            className="flex-1 px-4 py-2 border border-[#DEE2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent transition-all"
          />
          <button
            onClick={handleApplyDiscount}
            disabled={isApplyingDiscount || !discountCode.trim()}
            className="px-4 py-2 bg-[#42A5F5] text-white rounded-lg font-semibold hover:bg-[#63b3fa] transition-all focus:outline-none focus:ring-2 focus:ring-[#42A5F5]/40 disabled:bg-[#DEE2E6] disabled:text-[#6c757d] disabled:cursor-not-allowed"
          >
            {isApplyingDiscount ? 'Applying...' : 'Apply'}
          </button>
        </div>
        {discountError && (
          <p className="mt-2 text-sm text-red-500">{discountError}</p>
        )}
      </div>

      {/* Order Totals */}
      <div className="space-y-3 border-t border-[#DEE2E6] pt-4">
        <div className="flex justify-between text-[#6c757d]">
          <span>Subtotal</span>
          <span>${safeSubtotal.toFixed(2)}</span>
        </div>
        {shippingMethod && (
          <div className="flex justify-between text-[#6c757d]">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-[#6c757d]">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-[#333333] pt-3 border-t border-[#DEE2E6]">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center mt-6 text-[#6c757d] text-sm">
        <FaLock className="mr-2 text-[#42A5F5]" />
        Secure checkout
      </div>
    </div>
  );
} 