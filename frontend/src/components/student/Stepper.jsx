'use client';
import React from 'react';

export default function Stepper({ steps, activeTab, currentStepIndex, onStepClick }) {
  return (
    <div className="mb-6 px-4">
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-0 w-full relative">
          {steps.map((step, index) => {
            const isActive = step.id === activeTab;
            const isCompleted = step.isCompleted;
            const isPast = index < currentStepIndex;
            const Icon = step.icon;
            return (
              <React.Fragment key={step.id}>
                {/* Connector Line - Connects diamond corners */}
                {index > 0 && (
                  <div 
                    className={`
                      h-1 flex-1 transition-all duration-500 rounded-full
                      ${(index - 1) < currentStepIndex || steps[index - 1].isCompleted || isCompleted
                        ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-600'
                        : isActive
                          ? 'bg-gradient-to-r from-green-400 via-green-500 to-slate-300'
                          : 'bg-slate-200'
                      }
                    `} 
                    style={{ 
                      marginLeft: '7px', 
                      marginRight: '7px'
                    }} 
                  />
                )}
                {/* Step Content */}
                <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                  {/* Step Diamond */}
                  <button
                    onClick={() => onStepClick(step.id)}
                    className={`
                      w-10 h-10 transform transition-all duration-300 flex items-center justify-center
                      font-semibold text-xs border-2 relative flex-shrink-0
                      hover:scale-110 active:scale-95
                      ${isCompleted
                        ? 'rotate-45 bg-gradient-to-br from-green-400 to-green-600 border-green-300 text-white shadow-md'
                        : isActive
                          ? 'rotate-45 bg-gradient-to-br from-indigo-500 to-indigo-700 border-indigo-400 text-white shadow-lg'
                          : isPast
                            ? 'rotate-45 bg-gradient-to-br from-slate-300 to-slate-400 border-slate-400 text-white shadow-sm'
                            : 'rotate-45 bg-white border-slate-300 text-slate-600 hover:border-indigo-300 shadow-sm'
                      }
                    `}
                  >
                    <span className="-rotate-45 flex items-center justify-center">
                      <Icon size={16} className={isCompleted ? 'drop-shadow' : ''} />
                    </span>
                  </button>
                  
                  {/* Step Label */}
                  <span className={`
                    mt-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 text-center whitespace-nowrap
                    ${isActive ? 'text-indigo-700 font-extrabold' : isCompleted ? 'text-green-600' : 'text-slate-500'}
                  `}>
                    {step.name}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}