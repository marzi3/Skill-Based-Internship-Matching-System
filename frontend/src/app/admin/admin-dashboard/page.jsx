'use client';

export default function AdminDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-black text-gray-900 uppercase">Secure Command Center</h1>
            <p className="text-gray-500 font-bold mb-8">System-wide synchronization of all platform protocols</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: '1,284' },
                    { label: 'Active Internships', value: '456' },
                    { label: 'Pending Verifications', value: '23' },
                    { label: 'System Health', value: '99.9%' }
                ].map(stat => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                        <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
