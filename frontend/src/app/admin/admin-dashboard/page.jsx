'use client';

import AdminDashboard from '../page';

/**
 * Redirection/Wrapper for the admin dashboard to ensure consistency
 * across different entry points (/admin and /admin/admin-dashboard)
 */
export default function AdminDashboardPage() {
    return <AdminDashboard />;
}
