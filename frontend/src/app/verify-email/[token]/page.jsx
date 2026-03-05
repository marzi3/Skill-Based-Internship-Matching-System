'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/services/apiClient';
import { motion } from 'framer-motion';

export default function VerifyEmailPage() {
    const { token } = useParams();
    const router = useRouter();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        if (!token) return;

        const verifyToken = async () => {
            try {
                const response = await apiClient.get(`/auth/verifyemail/${token}`);
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login?verified=true');
                }, 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Invalid or expired verification link.');
            }
        };

        verifyToken();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center"
            >
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900">{message}</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting you to login...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-red-600 mb-6">{message}</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
