'use client';

import React from 'react';
import Navbar from '@/components/common/Navbar';
import NotificationSettingsPanel from '@/components/settings/NotificationSettingsPanel';

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">
                    Account Settings
                </h1>

                <div className="space-y-8">
                    {/* We can drop other settings panels here in the future like SecurityPanel or ProfilePanel */}
                    <NotificationSettingsPanel />
                </div>
            </main>
        </div>
    );
}
