'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationBell from '@/components/notifications/NotificationBell';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }) {
    const { user } = useAuth();
    return (
        <ProtectedRoute requiredRole="admin">
            <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">
                <AdminSidebar />
                <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
                    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                        <div className="md:hidden">
                             {/* Mobile Header elements can go here if needed */}
                        </div>
                        <div className="hidden md:block">
                            {/* Empty space for now */}
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <Avatar name={user?.name} src={user?.profilePicture} size="md" />
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
