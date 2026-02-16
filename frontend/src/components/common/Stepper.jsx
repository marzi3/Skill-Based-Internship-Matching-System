'use client';

import React from 'react';

// Stepper Component
const Stepper = ({
  steps = [],
  currentStep = 1,
  onStepClick = null,
  variant = 'default', // 'default', 'vertical'
  className = '',
}) => {
  const isVertical = variant === 'vertical';

  return (
    <div className={`${isVertical ? '' : 'flex items-center gap-4'} ${className}`.trim()}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isUpcoming = stepNumber > currentStep;

        return (
          <React.Fragment key={step.id || index}>
            {/* Step Item */}
            <div
              className={`flex items-start gap-4 ${isVertical ? 'mb-8' : ''} cursor-pointer`}
              onClick={() => onStepClick && onStepClick(stepNumber)}
            >
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    font-bold text-sm transition duration-300
                    ${isCompleted
                      ? 'bg-green-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : 'bg-gray-300 text-gray-600'
                    }
                  `.trim()}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Connector Line */}
                {!isVertical && index < steps.length - 1 && (
                  <div
                    className={`
                      h-1 w-12 mt-2 transition duration-300
                      ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                    `.trim()}
                  ></div>
                )}

                {isVertical && index < steps.length - 1 && (
                  <div
                    className={`
                      w-1 h-12 mt-2 transition duration-300
                      ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                    `.trim()}
                  ></div>
                )}
              </div>

              {/* Step Info */}
              <div className={`flex-1 ${isVertical ? 'pb-8' : ''}`}>
                <h4 className={`font-semibold ${
                  isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {step.title}
                </h4>
                {step.description && (
                  <p className="text-sm text-gray-600">{step.description}</p>
                )}
              </div>
            </div>

            {/* Vertical Connector */}
            {isVertical && !isVertical && index < steps.length - 1 && (
              <div className={`h-8 border-l-2 ${isCompleted ? 'border-green-600' : 'border-gray-300'}`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Horizontal Stepper (simpler variant)
export const HorizontalStepper = ({ steps = [], currentStep = 1, className = '' }) => {
  return (
    <div className={`flex items-center justify-between ${className}`.trim()}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <React.Fragment key={step.id || index}>
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-bold transition duration-300
                  ${isCompleted
                    ? 'bg-green-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                  }
                `.trim()}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>
              <p className="text-sm font-medium text-gray-900 mt-2">{step.title}</p>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-4 transition duration-300
                  ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                `.trim()}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
