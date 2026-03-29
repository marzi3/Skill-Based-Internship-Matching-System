'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '@/lib/validationSchemas';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const { forgotPassword } = useAuth();
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        mode: 'onBlur',
        defaultValues: { email: '' },
    });

    const onSubmit = async (data) => {
        setStatus('loading');
        setMessage('');

        const result = await forgotPassword(data.email);

        if (result.success) {
            setStatus('success');
            setMessage('A secure reset link has been dispatched to your email.');
        } else {
            setStatus('error');
            setMessage(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20"
            >
                {/* Left Side - Visuals */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <img src="/images/logo.png" alt="InternMatch Logo" className="h-16 w-auto object-contain mb-6 drop-shadow-md bg-white/20 p-2 rounded-xl backdrop-blur-sm" />
                        <h1 className="text-3xl font-bold mb-2">Back on track</h1>
                        <p className="text-indigo-100">Don&apos;t worry, even the best of us forget sometimes.</p>
                    </div>

                    <div className="relative z-10 mt-12 md:mt-0">
                        <div className="glass bg-white/10 p-5 rounded-2xl border-white/10">
                            <p className="text-sm font-medium leading-relaxed italic opacity-90">
                                &quot;Security is our priority. Your password reset link is encrypted and valid for 1 hour.&quot;
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 relative">
                     <Link href="/login" className="absolute top-6 right-8 text-sm text-indigo-600 font-semibold hover:underline">
                        Return to Sign In
                    </Link>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2 mt-4 md:mt-0">Forgot Password?</h2>
                    <p className="text-gray-500 text-sm mb-8">Enter your registered email and we&apos;ll send a recovery link.</p>

                    {status === 'success' ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            className="bg-indigo-50 text-indigo-700 p-6 rounded-2xl border border-indigo-100 text-center shadow-inner"
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full mb-4 shadow-lg">
                                <CheckCircle size={24} />
                            </div>
                            <p className="font-bold text-lg">Check your inbox</p>
                            <p className="text-sm mt-1">{message}</p>
                            <button 
                                onClick={() => setStatus('idle')}
                                className="mt-6 text-indigo-600 text-xs font-bold uppercase tracking-widest hover:text-indigo-800"
                            >
                                Try another email
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <AnimatePresence>
                                {status === 'error' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm flex items-center">
                                        <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {message}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1">
                                <label htmlFor="email" className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        {...register('email')}
                                        id="email"
                                        type="email"
                                        aria-invalid={errors.email ? 'true' : undefined}
                                        aria-describedby={errors.email ? 'email-error' : undefined}
                                        className={`w-full pl-10 pr-4 py-3.5 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all shadow-sm ${errors.email ? 'border-red-500 focus:ring-red-500/50' : 'border-transparent focus:ring-indigo-500/50'}`}
                                        placeholder="you@domain.com"
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.email && (
                                        <motion.p id="email-error" role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-rose-500 text-xs font-bold mt-1 ml-1">{errors.email.message}</motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 flex justify-center items-center"
                            >
                                {status === 'loading' ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>Send Recovery Link <ArrowRight size={18} className="ml-2" /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
