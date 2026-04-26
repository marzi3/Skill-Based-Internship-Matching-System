'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import EmployerSidebar from '@/components/employer/EmployerSidebar';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { User, Menu as MenuIcon } from 'lucide-react';

export default function EmployerLayout({ children }) {
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <ProtectedRoute requiredRole="employer">
            <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden relative">
                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm"
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar - Desktop (flex-row) and Mobile (absolute) */}
                <div className={`
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:translate-x-0 transition-transform duration-300
                    fixed md:relative z-[70] md:z-20 h-full
                `}>
                    <EmployerSidebar closeMobileMenu={() => setIsMobileMenuOpen(false)} />
                </div>

                <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
                    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 md:hidden"
                            >
                                <MenuIcon size={20} />
                            </button>
                            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest hidden md:block">Employer Terminal</h2>
                        </div>
                        <div className="flex items-center gap-6">
                            <NotificationBell />
                            <div className="h-8 w-px bg-gray-100 mx-2" />
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block min-w-0">
                                    <p className="text-xs font-black text-gray-900 uppercase leading-none truncate max-w-[120px]">{user?.companyName || 'Employer Node'}</p>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter mt-1">Verified Active</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                                    {user?.profilePicture ? (
                                        <img 
                                            src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/${user.profilePicture}`} 
                                            alt={user.companyName} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={20} className="text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>
                    <main className="w-full flex-1 p-4 lg:p-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
