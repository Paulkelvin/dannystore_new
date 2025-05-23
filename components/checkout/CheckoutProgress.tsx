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
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
      {steps.map((step, idx) => (
        <div key={step.key} className="flex items-center w-full sm:w-auto">
          <div
            className={`relative rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-sm sm:text-base shadow transition-all duration-300
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
              <FaCheck className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              idx + 1
            )}
          </div>
          <div className="ml-3 flex flex-col">
            <span className="font-semibold text-sm sm:text-base flex items-center">
              <span className="hidden sm:inline-block mr-2">{step.icon}</span>
              <span>{step.label}</span>
            </span>
            {idx === currentStep && (
              <span className="text-xs text-[#42A5F5] mt-1">Current Step</span>
            )}
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`hidden sm:block w-12 h-0.5 mx-4 transition-colors duration-300 ${
                idx < currentStep ? 'bg-[#42A5F5]' : 'bg-[#DEE2E6]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
} 