'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error Boundary caught:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl text-center border border-red-100"
                    >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">System Fault Detected</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                A critical error occurred while rendering this page. Our technical team has been notified.
                            </p>
                        </div>
                        <div className="mt-8 space-y-4">
                            <button
                                onClick={() => reset()}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Attempt Recovery
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </motion.div>
                </div>
            </body>
        </html>
    );
}
