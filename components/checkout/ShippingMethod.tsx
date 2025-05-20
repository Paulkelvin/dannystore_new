import { useState } from 'react';
import { FaTruck } from 'react-icons/fa';

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  description?: string;
}

interface ShippingMethodProps {
  methods: ShippingMethod[];
  onComplete: (method: ShippingMethod) => void;
  initialMethod?: ShippingMethod;
}

export default function ShippingMethod({ methods, onComplete, initialMethod }: ShippingMethodProps) {
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | undefined>(initialMethod);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethod) {
      onComplete(selectedMethod);
    }
  };

  if (methods.length === 0) {
    return null; // Don't show this step if there are no shipping methods
  }

  if (methods.length === 1) {
    // If there's only one method, auto-select it and show as info
    return (
      <div className="bg-white rounded-lg p-4 border border-[#DEE2E6] mb-6">
        <div className="flex items-center text-[#6c757d]">
          <FaTruck className="mr-2 text-[#42A5F5]" />
          <span className="font-medium">{methods[0].name}</span>
          <span className="ml-auto font-semibold text-[#333333]">${methods[0].price.toFixed(2)}</span>
        </div>
        {methods[0].description && (
          <p className="mt-1 text-sm text-[#6c757d]">{methods[0].description}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center mb-6">
        <FaTruck className="text-2xl text-[#42A5F5] mr-3" />
        <h2 className="text-3xl font-extrabold text-[#333333] tracking-tight">Shipping Method</h2>
      </div>
      <div className="border-b border-[#DEE2E6] mb-6" />

      <div className="space-y-4">
        {methods.map((method) => (
          <label
            key={method.id}
            className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
              selectedMethod?.id === method.id
                ? 'border-[#42A5F5] bg-[#42A5F5]/5'
                : 'border-[#DEE2E6] hover:border-[#42A5F5]/50'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="shipping-method"
                  value={method.id}
                  checked={selectedMethod?.id === method.id}
                  onChange={() => setSelectedMethod(method)}
                  className="h-4 w-4 border-[#DEE2E6] text-[#42A5F5] focus:ring-[#42A5F5]"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-[#333333]">
                    {method.name}
                  </span>
                  {method.description && (
                    <span className="block text-sm text-[#6c757d] mt-1">
                      {method.description}
                    </span>
                  )}
                  <span className="block text-sm text-[#6c757d] mt-1">
                    Estimated delivery: {method.estimatedDays}
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <span className="text-lg font-semibold text-[#333333]">
                ${method.price.toFixed(2)}
              </span>
            </div>
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={!selectedMethod}
        className="mt-8 w-full bg-[#FFC300] text-[#333333] text-lg font-bold py-4 rounded-xl shadow-lg hover:bg-[#FFD740] transition-all focus:outline-none focus:ring-2 focus:ring-[#42A5F5]/40 disabled:bg-[#DEE2E6] disabled:text-[#6c757d] disabled:cursor-not-allowed"
      >
        Continue to Payment
      </button>
    </form>
  );
} 