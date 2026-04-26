'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, X, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import axios from '@/services/apiClient';

const REASONS = [
    "Inappropriate content or behavior",
    "Fraudulent or scam advertisement",
    "Misleading information",
    "Harassment or abusive language",
    "Spam or duplicate listing",
    "Other"
];

export default function ReportModal({ isOpen, onClose, reportedId, reportedEntity, reportedName }) {
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1: Form, 2: Success

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason && !details) return;

        setIsSubmitting(true);
        try {
            await axios.post('/reports', {
                reportedEntity,
                reportedId,
                reason: reason === "Other" ? details : `${reason}: ${details}`
            });
            setStep(2);
        } catch (err) {
            alert("Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative"
                >
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <X size={20} />
                    </button>

                    {step === 1 ? (
                        <div className="p-8">
                            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-6">
                                <Flag size={24} />
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                                Report {reportedEntity === 'User' ? 'Profile' : 'Internship'}
                            </h2>
                            <p className="text-slate-500 text-sm mb-8 font-medium italic">
                                "{reportedName}"
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Specify Reason</label>
                                    <div className="space-y-2">
                                        {REASONS.map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setReason(r)}
                                                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${reason === r ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Additional Context</label>
                                    <textarea
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        placeholder="Please provide any extra details..."
                                        className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-rose-500 focus:bg-white outline-none transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || (!reason && !details)}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />}
                                    Submit Report for Review
                                </button>
                                
                                <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-tighter">
                                    Your identity remains anonymous to {reportedName}.
                                </p>
                            </form>
                        </div>
                    ) : (
                        <div className="p-6 text-center bg-slate-50">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Report Logged</h2>
                            <p className="text-slate-500 text-sm mt-3 mb-8 leading-relaxed font-medium">
                                Thank you for helping us maintain a safe community. Our trust and safety team will investigate this report shortly.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
