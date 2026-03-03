'use client';
export default function AdminUsersPending() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4 uppercase">Pending Verifications</h1>
            <div className="bg-white rounded-xl border p-12 text-center text-gray-500 font-bold">
                Awaiting incoming synchronization requests from new users.
            </div>
        </div>
    );
}
