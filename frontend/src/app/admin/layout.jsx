'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
    return (
        <ProtectedRoute requiredRole="admin">
            <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">
                <AdminSidebar />
                <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
                    <main className="w-full flex-1 p-4 lg:p-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
