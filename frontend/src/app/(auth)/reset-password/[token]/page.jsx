'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
    const { resetPassword } = useAuth();
    const params = useParams(); // Start with empty object
    const router = useRouter();

    // Safety check for params - wait for hydration
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
            setMessage('Password has been successfully reset.');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } else {
            setStatus('error');
            setMessage(result.error);
        }
    };

    // Only render if token is present (client-side safety)
    if (!token) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 p-8"
            >
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                        <Lock size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
                    <p className="text-gray-500 mt-2 text-sm">Enter your new password below.</p>
                </div>

                {status === 'success' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 text-center">
                        <div className="flex justify-center mb-2">
                            <CheckCircle size={24} className="text-green-500" />
                        </div>
                        <p className="font-bold text-lg mb-1">Success!</p>
                        <p className="text-sm">Your password has been updated. Redirecting to login...</p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {status === 'error' && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center border border-red-100">
                                <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {message}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm group-hover:bg-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm group-hover:bg-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 flex justify-center items-center mt-4"
                        >
                            {status === 'loading' ? 'Resetting...' : <>Reset Password <ArrowRight size={18} className="ml-2" /></>}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
