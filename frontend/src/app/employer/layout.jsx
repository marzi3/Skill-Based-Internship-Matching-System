'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import EmployerSidebar from '@/components/employer/EmployerSidebar';

export default function EmployerLayout({ children }) {
    return (
        <ProtectedRoute requiredRole="employer">
            <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">
                <EmployerSidebar />
                <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
                    <main className="w-full flex-1 p-4 lg:p-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
