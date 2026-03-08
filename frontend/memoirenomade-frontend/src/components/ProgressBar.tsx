import { Check } from "lucide-react";

interface Step {
  label: string;
  number: number;
}

const steps: Step[] = [
  { number: 1, label: "Carrito" },
  { number: 2, label: "Datos" },
  { number: 3, label: "Pago" },
  { number: 4, label: "Confirmación" },
];

interface ProgressBarProps {
  currentStep: number; // 1, 2, 3 o 4
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-4">
      <div className="container-app">
        <div className="flex items-center justify-center gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Círculo del paso */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step.number < currentStep
                      ? "bg-green-500 text-white"
                      : step.number === currentStep
                        ? "bg-yellow-500 text-[#1a1a2e]"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.number < currentStep ? (
                    <Check size={16} />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-xs mt-1 font-medium ${
                    step.number === currentStep
                      ? "text-yellow-600"
                      : step.number < currentStep
                        ? "text-green-600"
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Línea conectora */}
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-16 md:w-24 mb-4 mx-1 transition-all ${
                    step.number < currentStep ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
