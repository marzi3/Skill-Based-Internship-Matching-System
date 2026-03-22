'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
    const { resetPassword } = useAuth();
    const params = useParams();
    const router = useRouter();
    const token = params?.token;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        setStatus('loading');
        setMessage('');

        const result = await resetPassword(token, password);

        if (result.success) {
            setStatus('success');
            setTimeout(() => router.push('/login'), 3000);
        } else {
            setStatus('error');
            setMessage(result.error);
        }
    };

    if (!token) return null;

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
                        <h1 className="text-3xl font-bold mb-2">Almost there</h1>
                        <p className="text-indigo-100">Set a strong password to secure your account.</p>
                    </div>

                    <div className="relative z-10 mt-12 md:mt-0">
                        <div className="glass bg-white/10 p-5 rounded-2xl border-white/10">
                            <p className="text-sm font-medium leading-relaxed italic opacity-90">
                                "A strong password contains at least 8 characters, a number, and a special character."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Password</h2>
                    <p className="text-gray-500 text-sm mb-8">Please enter and confirm your new password below.</p>

                    {status === 'success' ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            className="bg-indigo-50 text-indigo-700 p-6 rounded-2xl border border-indigo-100 text-center shadow-inner"
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full mb-4 shadow-lg">
                                <CheckCircle size={24} />
                            </div>
                            <p className="font-bold text-lg text-indigo-800">Password Updated!</p>
                            <p className="text-sm mt-1">Redirecting to login in a few seconds...</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {status === 'error' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm flex items-center">
                                    <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {message}
                                </motion.div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all shadow-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all shadow-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 flex justify-center items-center"
                            >
                                {status === 'loading' ? 'Updating...' : <>Update Password <ArrowRight size={18} className="ml-2" /></>}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
