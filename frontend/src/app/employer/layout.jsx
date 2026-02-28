'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';

export default function EmployerLayout({ children }) {
    return (
        <ProtectedRoute requiredRole="employer">
            {children}
        </ProtectedRoute>
    );
}
