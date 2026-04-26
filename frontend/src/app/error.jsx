'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Route Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white/50 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-red-100 text-center"
            >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-6">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
                <p className="text-gray-500 mb-8 text-sm">
                    We're sorry, but we encountered an unexpected error while loading this content.
                </p>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Try again
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
