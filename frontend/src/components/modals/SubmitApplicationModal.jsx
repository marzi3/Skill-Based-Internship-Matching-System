'use client';

import { useState } from 'react';
import { X, Send, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SubmitApplicationModal
 * 
 * Allows students to review their match score and add an optional cover letter
 * before finalizing their application to an internship.
 * 
 * @param {boolean} isOpen Modal visibility state
 * @param {function} onClose Close handler
 * @param {function} onSubmit Submit handler (receives coverLetter)
 * @param {Object} internship Internship data
 * @param {Object} analysis Matching engine analysis
 */
export default function SubmitApplicationModal({ isOpen, onClose, onSubmit, internship, analysis }) {
    const [coverLetter, setCoverLetter] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(coverLetter);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                // Reset for next time
                setSuccess(false);
                setSubmitting(false);
            }, 1500);
        } catch (error) {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white"
                >
                    {success ? (
                        <div className="p-12 text-center space-y-6">
                            <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto"
                            >
                                <CheckCircle2 className="text-emerald-500" size={40} />
                            </motion.div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Transmission Successful</h2>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed px-8">
                                    Your application protocol has been established and synchronized with the employer node.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Submit Application</h2>
                                <button 
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-500 hover:text-slate-900"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Match Snapshot Warning */}
                            {analysis?.tier === 'DISQUALIFIED' ? (
                                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 mb-8">
                                    <AlertCircle className="text-rose-500 shrink-0" size={18} />
                                    <p className="text-xs font-bold text-rose-700 leading-relaxed">
                                        Our engine indicates high disqualification risk due to missing mandatory requirements.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600 font-black">
                                            {analysis?.normalizedScore || 0}%
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Protocol Match Score</span>
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{analysis?.tier}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                                        Cover Letter (Optional)
                                    </label>
                                    <textarea
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        placeholder="Add a short message to the employer explaining your interest..."
                                        className="w-full h-40 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all resize-none"
                                        maxLength={2000}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                                            {coverLetter.length} / 2000
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-4 bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all"
                                    >
                                        Cancel Protocol
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[1.5] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <Loader2 className="animate-spin" size={14} />
                                        ) : (
                                            <>Apply <Send size={14} /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
