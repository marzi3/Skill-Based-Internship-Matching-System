'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';

export default function AdminLayout({ children }) {
    return (
        <ProtectedRoute requiredRole="admin">
            {children}
        </ProtectedRoute>
    );
}
