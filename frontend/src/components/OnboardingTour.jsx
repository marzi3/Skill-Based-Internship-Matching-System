'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    ArrowRight, 
    ArrowLeft, 
    Sparkles, 
    Target, 
    Zap, 
    ShieldCheck, 
    CheckCircle2 
} from 'lucide-react';

export default function OnboardingTour({ role, onComplete }) {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    const studentSteps = [
        {
            title: "Welcome to InternMatch!",
            content: "Let's take a quick look at your new workspace.",
            icon: <Sparkles className="w-8 h-8 text-indigo-500" />,
            targetId: null // Centered
        },
        {
            title: "Profile & Skills",
            content: "This is where you manage your resume and skills. A 100% complete profile gets better matches!",
            icon: <Target className="w-8 h-8 text-rose-500" />,
            targetId: "nav-profile"
        },
        {
            title: "Your Matches",
            content: "We automatically find the best internships for you based on your verified skills.",
            icon: <Zap className="w-8 h-8 text-amber-500" />,
            targetId: "nav-matches"
        },
        {
            title: "Verification Status",
            content: "Check your status here. Verified students get a Blue Checkmark and more visibility.",
            icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
            targetId: "nav-verification"
        }
    ];

    const employerSteps = [
        {
            title: "Welcome back!",
            content: "Let's show you how to find the best talent quickly.",
            icon: <Sparkles className="w-8 h-8 text-indigo-500" />,
            targetId: null
        },
        {
            title: "Post Internships",
            content: "Create new listings here to start receiving AI-matched candidates.",
            icon: <Zap className="w-8 h-8 text-amber-500" />,
            targetId: "nav-create"
        },
        {
            title: "Candidate Search",
            content: "Browse our full directory of skill-verified students and filters.",
            icon: <Target className="w-8 h-8 text-rose-500" />,
            targetId: "nav-candidates"
        }
    ];

    const steps = role === 'employer' ? employerSteps : studentSteps;

    // Handle Window Resize
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Find Target Element Rect
    useEffect(() => {
        const targetId = steps[step].targetId;
        if (!targetId) {
            setTargetRect(null);
            return;
        }

        const updateRect = () => {
            const el = document.getElementById(targetId);
            if (el) {
                const rect = el.getBoundingClientRect();
                setTargetRect({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
            }
        };

        updateRect();
        // Small delay to ensure render
        const timer = setTimeout(updateRect, 100);
        return () => clearTimeout(timer);
    }, [step, windowSize]);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] pointer-events-none">
                {/* SVG Mask for Spotlight */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <mask id="spotlight-mask">
                            <rect width="100%" height="100%" fill="white" />
                            {targetRect && (
                                <rect 
                                    x={targetRect.left - 10} 
                                    y={targetRect.top - 10} 
                                    width={targetRect.width + 20} 
                                    height={targetRect.height + 20} 
                                    rx="20" 
                                    fill="black" 
                                />
                            )}
                        </mask>
                    </defs>
                    <rect 
                        width="100%" 
                        height="100%" 
                        fill="rgba(15, 23, 42, 0.7)" 
                        mask="url(#spotlight-mask)" 
                        className="transition-all duration-500"
                    />
                </svg>

                {/* The Tooltip/Content */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            y: 0,
                            // If we have a target, try to position the tooltip near it
                            ...(targetRect ? {
                                x: targetRect.left > windowSize.width / 2 ? -200 : 200,
                                y: targetRect.top > windowSize.height / 2 ? -150 : 150,
                            } : {})
                        }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden shadow-black/40 border border-slate-100"
                    >
                        <div className="p-6 relative">
                            <button 
                                onClick={onComplete}
                                className="absolute top-6 right-6 text-slate-500 hover:text-slate-600 transition-colors"
                            >
                                <X size={18} />
                            </button>

                            <div className="mb-4 flex justify-start">
                                <motion.div 
                                    key={step}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="p-3 bg-slate-50 rounded-xl"
                                >
                                    {steps[step].icon}
                                </motion.div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                    {steps[step].title}
                                </h2>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    {steps[step].content}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                    {steps.map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-indigo-600' : 'w-1 bg-slate-200'}`}
                                        />
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    {step > 0 && (
                                        <button 
                                            onClick={handleBack}
                                            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
                                        >
                                            <ArrowLeft size={16} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleNext}
                                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all group text-sm"
                                    >
                                        {step === steps.length - 1 ? 'Start Mission' : 'Next'}
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
}
