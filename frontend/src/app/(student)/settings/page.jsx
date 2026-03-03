'use client';

import { Settings, Shield, Bell, User, Clock, CreditCard } from 'lucide-react';
import Card from '@/components/common/Card';

export default function StudentSettings() {
    const sections = [
        { id: 'profile', title: 'Account Meta', desc: 'Secure management of your personal synchronization data', icon: User },
        { id: 'security', title: 'Privacy Shield', desc: 'Protocol encryption and access authorization', icon: Shield },
        { id: 'notifications', title: 'Transmission Prefs', desc: 'Configure real-time internship match alerts', icon: Bell },
        { id: 'history', title: 'Activity Chain', desc: 'Review all historical platform interactions', icon: Clock },
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">System Configuration</h1>
                <p className="text-gray-500 font-medium tracking-tight">Manage your personal matching algorithms and platform preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map(section => (
                    <Card key={section.id} hoverable border padding="lg" className="border-gray-100 group">
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                <section.icon size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-black text-gray-900 tracking-tight uppercase text-lg group-hover:text-indigo-600 transition-colors">{section.title}</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed">{section.desc}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card padding="lg" className="bg-slate-50 border-dashed border-2 border-slate-200 mt-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                    <Settings className="mx-auto text-slate-300 animate-spin-slow" size={48} />
                    <h3 className="font-black text-slate-900 uppercase">Advanced Environment Sync</h3>
                    <p className="text-slate-500 text-sm font-medium">Your account is currently synchronized with the main internship network. Last verification sync: 5 minutes ago.</p>
                </div>
            </Card>
        </div>
    );
}
