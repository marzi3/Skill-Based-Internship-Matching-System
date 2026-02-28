'use client';

import React from 'react';
import { Check } from 'lucide-react';

const Stepper = ({ currentStep, steps }) => {
    return (
        <div className="flex items-center justify-center w-full max-w-2xl mx-auto mb-10">
            {steps.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;

                return (
                    <React.Fragment key={step.id}>
                        {/* Step Circle */}
                        <div className="flex flex-col items-center relative">
                            <div
                                className={`
                  w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500
                  ${isCompleted || isActive
                                        ? 'bg-[#6366F1] border-[#6366F1] shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                                        : 'bg-white border-slate-200 text-slate-300'
                                    }
                `}
                            >
                                {isCompleted ? (
                                    <Check className="text-white w-5 h-5" />
                                ) : (
                                    <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                        {step.id}
                                    </span>
                                )}
                            </div>

                            {/* Step Title */}
                            <div className="absolute top-12 whitespace-nowrap">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive || isCompleted ? 'text-[#6366F1]' : 'text-slate-400'}`}>
                                    {step.title}
                                </span>
                            </div>
                        </div>

                        {/* Connecting Line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-0.5 mx-4 bg-slate-100 relative overflow-hidden rounded-full">
                                <div
                                    className="absolute inset-0 bg-[#6366F1] transition-all duration-700 ease-in-out origin-left"
                                    style={{ transform: `scaleX(${isCompleted ? 1 : 0})` }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default Stepper;
