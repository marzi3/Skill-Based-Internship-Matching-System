'use client';

import { Bell, Zap, Info, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import Card from '@/components/common/Card';

const NotificationsPage = () => {
    const notifications = [
        {
            id: 1,
            type: 'match',
            title: 'New High-Score Match',
            message: 'Alex Chen matches 95% of your React Developer requirements.',
            time: '15 mins ago',
            icon: Zap,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        },
        {
            id: 2,
            type: 'system',
            title: 'Posting Expiring Soon',
            message: 'Your Backend Engineer posting will expire in 48 hours.',
            time: '2 hours ago',
            icon: AlertTriangle,
            color: 'text-amber-500',
            bg: 'bg-amber-50'
        },
        {
            id: 3,
            type: 'success',
            title: 'Interview Confirmed',
            message: 'Jordan Smith confirmed the interview for Feb 22nd.',
            time: '4 hours ago',
            icon: CheckCircle2,
            color: 'text-sky-500',
            bg: 'bg-sky-50'
        },
    ];

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Intelligence Feed</h1>
                    <p className="text-gray-600">Real-time status synchronizations and protocol alerts</p>
                </div>
                <button className="text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-800 transition-colors">
                    Mark all as synchronized
                </button>
            </div>

            <div className="max-w-4xl space-y-4">
                {notifications.map((notif) => {
                    const Icon = notif.icon;
                    return (
                        <Card key={notif.id} shadow="sm" rounded="lg" padding="md" className="hover:shadow-md transition-all border border-gray-100 group">
                            <div className="flex items-start gap-5">
                                <div className={`p-4 rounded-2xl ${notif.bg} ${notif.color} transition-transform group-hover:scale-110 duration-300`}>
                                    <Icon size={24} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-gray-900 tracking-tight">{notif.title}</h3>
                                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-400">
                                            <Clock size={12} />
                                            {notif.time}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm font-medium leading-relaxed">{notif.message}</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="pt-12 flex justify-center">
                <div className="bg-gray-50 border border-gray-200 px-8 py-4 rounded-3xl flex items-center gap-3">
                    <Info size={16} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 italic">No further transmissions detected in the current cycle.</span>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
