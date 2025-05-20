import { FaTruck, FaCreditCard, FaCheck } from 'react-icons/fa';

export interface Step {
  key: string;
  label: string;
  icon: React.ReactNode;
  completed?: boolean;
}

interface CheckoutProgressProps {
  steps: Step[];
  currentStep: number;
}

export default function CheckoutProgress({ steps, currentStep }: CheckoutProgressProps) {
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, idx) => (
        <div key={step.key} className="flex items-center">
          <div
            className={`relative rounded-full w-9 h-9 flex items-center justify-center font-bold text-base shadow transition-all duration-300
              ${
                idx < currentStep
                  ? 'bg-[#42A5F5] text-white'
                  : idx === currentStep
                  ? 'bg-[#FFC300] text-[#333333]'
                  : 'bg-[#DEE2E6] text-[#6c757d]'
              }
            `}
          >
            {idx < currentStep ? (
              <FaCheck className="w-4 h-4" />
            ) : (
              idx + 1
            )}
          </div>
          <span
            className={`ml-2 mr-4 font-semibold text-lg flex items-center ${
              idx === currentStep
                ? 'text-[#42A5F5]'
                : idx < currentStep
                ? 'text-[#42A5F5]'
                : 'text-[#6c757d]'
            }`}
          >
            {step.icon}
            {step.label}
          </span>
          {idx < steps.length - 1 && (
            <div
              className={`w-8 h-1 rounded mx-1 transition-colors duration-300 ${
                idx < currentStep ? 'bg-[#42A5F5]' : 'bg-[#DEE2E6]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
} 