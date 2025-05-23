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
    <div className="flex flex-col sm:flex-row items-center justify-center mb-8 sm:mb-12 px-4 sm:px-0">
      {steps.map((step, idx) => (
        <div key={step.key} className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
          <div
            className={`relative rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center font-bold text-sm sm:text-base shadow transition-all duration-300
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
          <span
            className={`ml-2 mr-4 font-semibold text-base sm:text-lg flex items-center whitespace-nowrap ${
              idx === currentStep
                ? 'text-[#42A5F5]'
                : idx < currentStep
                ? 'text-[#42A5F5]'
                : 'text-[#6c757d]'
            }`}
          >
            <span className="hidden sm:inline-block mr-2">{step.icon}</span>
            <span className="hidden sm:inline">{step.label}</span>
            <span className="sm:hidden">{step.label.split(' ')[0]}</span>
          </span>
          {idx < steps.length - 1 && (
            <div
              className={`hidden sm:block w-8 h-1 rounded mx-1 transition-colors duration-300 ${
                idx < currentStep ? 'bg-[#42A5F5]' : 'bg-[#DEE2E6]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
} 