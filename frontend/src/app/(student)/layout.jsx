'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';

export default function StudentLayout({ children }) {
    return (
        <ProtectedRoute requiredRole="student">
            {children}
        </ProtectedRoute>
    );
}
