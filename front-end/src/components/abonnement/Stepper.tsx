"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-secondary/10 rounded-full">
          <motion.div
            className="h-full bg-secondary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = onStepClick && (isCompleted || step.id === currentStep);

          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center relative z-10",
                isClickable && "cursor-pointer"
              )}
              onClick={() => isClickable && onStepClick?.(step.id)}
            >
              <motion.div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-sans font-bold text-lg transition-all duration-300",
                  isCompleted
                    ? "bg-secondary text-white"
                    : isCurrent
                    ? "bg-secondary text-white ring-4 ring-secondary/20"
                    : "bg-card border-4 border-secondary/20 text-secondary-850"
                )}
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  step.id
                )}
              </motion.div>
              <div className="mt-3 text-center">
                <p
                  className={cn(
                    "font-sans font-semibold text-sm",
                    isCurrent || isCompleted
                      ? "text-secondary"
                      : "text-secondary-850/50"
                  )}
                >
                  {step.title}
                </p>
                <p className="font-sans text-xs text-secondary-850/50 max-w-[120px]">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="font-sans text-sm text-secondary-850/70">
            Étape {currentStep} sur {steps.length}
          </span>
          <span className="font-sans font-semibold text-secondary">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
        <div className="h-2 bg-secondary/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-secondary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Stepper;
