'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink, Settings } from 'lucide-react';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all'); // all, unread
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.get('/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.patch(`/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const deleteNotification = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.delete(`/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.patch('/notifications/mark-all-read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const deleteAllNotifications = async () => {
        if (!window.confirm('Are you sure you want to delete all notifications?')) return;
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.delete('/notifications/delete-all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications([]);
        } catch (err) {
            console.error('Failed to delete all', err);
        }
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Bell className="text-indigo-600" size={32} />
                            Notification Center
                        </h1>
                        <p className="text-gray-500 mt-1">Stay updated on your internships, applications, and messages.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-200 rounded-lg shadow-sm transition-colors text-sm font-bold flex items-center gap-2"
                            disabled={!notifications.some(n => !n.isRead)}
                        >
                            <Check size={16} />
                            Mark All Read
                        </button>
                        <button
                            onClick={deleteAllNotifications}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-rose-600 hover:border-rose-200 rounded-lg shadow-sm transition-colors text-sm font-bold flex items-center gap-2"
                            disabled={notifications.length === 0}
                        >
                            <Trash2 size={16} />
                            Clear All
                        </button>
                        <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200 flex ml-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === 'unread' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Unread
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                            <Bell size={48} className="mb-4 opacity-20" />
                            <h3 className="text-lg font-bold text-gray-900 mb-1">You're all caught up!</h3>
                            <p>No {filter === 'unread' ? 'unread' : ''} notifications to display.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredNotifications.map(notif => (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={notif._id}
                                    className={`p-6 transition-colors group relative flex gap-4 ${notif.isRead ? 'hover:bg-gray-50' : 'bg-indigo-50/30 hover:bg-indigo-50/60'}`}
                                >
                                    <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-indigo-600'}`}></div>

                                    <div className="flex-1 min-w-0 pr-12">
                                        <p className={`text-base ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-bold'}`}>
                                            {notif.message}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2 font-medium">
                                            {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>

                                        {notif.link && (
                                            <Link 
                                                href={notif.link}
                                                className="inline-flex items-center gap-2 mt-4 text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
                                            >
                                                Check Details <ExternalLink size={12} />
                                            </Link>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notif.isRead && (
                                            <button
                                                onClick={() => markAsRead(notif._id)}
                                                className="p-2 text-gray-500 bg-white shadow-sm rounded-lg border border-gray-200 hover:text-green-600 hover:border-green-200 transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check size={16} strokeWidth={3} />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => deleteNotification(notif._id, e)}
                                            className="p-2 text-gray-500 bg-white shadow-sm rounded-lg border border-gray-200 hover:text-red-600 hover:border-red-200 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
