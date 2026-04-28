'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import { Bell, Zap, CheckCircle2, AlertTriangle, Clock, ArrowLeft, Loader2, Check, Trash2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Employer Notifications — live data from the notifications API.
 * Supports mark-as-read and delete actions.
 */
const NotificationsPage = () => {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.get('/notifications', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(res.data.data || res.data.notifications || []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.patch(`/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            window.dispatchEvent(new CustomEvent('notif-read'));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.delete(`/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.patch('/notifications/mark-all-read', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            window.dispatchEvent(new CustomEvent('notif-read-all'));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const getNotifStyle = (type) => {
        const styles = {
            NEW_MATCH: { icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            APPLICATION_STATUS: { icon: CheckCircle2, color: 'text-sky-500', bg: 'bg-sky-50' },
            NEW_APPLICATION: { icon: Bell, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            ACCOUNT_STATUS: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
        };
        return styles[type] || { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/employer/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
                        <p className="text-sm text-gray-500">Stay updated with matches, applications, and system alerts</p>
                    </div>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold uppercase tracking-wide text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20">
                    <Bell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="font-bold text-gray-600">All caught up!</p>
                    <p className="text-sm text-gray-500 mt-1">No notifications at this time.</p>
                </div>
            ) : (
                <div className="max-w-4xl space-y-3">
                    {notifications.map((notif, idx) => {
                        const style = getNotifStyle(notif.type);
                        const Icon = style.icon;
                        return (
                            <motion.div
                                key={notif._id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all group ${notif.isRead ? 'border-gray-100 opacity-70' : 'border-indigo-100'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${style.bg} ${style.color} flex-shrink-0`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm">{notif.type?.replace(/_/g, ' ') || 'Notification'}</h3>
                                                <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">{notif.message}</p>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            {notif.link && (
                                                <button onClick={() => { markAsRead(notif._id); router.push(notif.link); }}
                                                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                                    <Info size={12} /> View Details
                                                </button>
                                            )}
                                            {!notif.isRead && (
                                                <button onClick={() => markAsRead(notif._id)}
                                                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                                    <Check size={12} /> Mark as read
                                                </button>
                                            )}
                                            <button onClick={() => deleteNotification(notif._id)}
                                                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors">
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
