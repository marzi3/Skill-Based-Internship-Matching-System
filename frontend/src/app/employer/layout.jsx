'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import EmployerSidebar from '@/components/employer/EmployerSidebar';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react';

export default function EmployerLayout({ children }) {
    const { user } = useAuth();
    return (
        <ProtectedRoute requiredRole="employer">
            <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">
                <EmployerSidebar />
                <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
                    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 z-10">
                        <div className="flex items-center gap-4">
                            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest hidden md:block">Employer Terminal</h2>
                        </div>
                        <div className="flex items-center gap-6">
                            <NotificationBell />
                            <div className="h-8 w-px bg-gray-100 mx-2" />
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-black text-gray-900 uppercase leading-none">{user?.companyName || 'Employer Node'}</p>
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
