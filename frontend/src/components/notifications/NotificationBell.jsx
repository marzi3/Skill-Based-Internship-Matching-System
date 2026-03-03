'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // refresh every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get('http://localhost:5001/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setNotifications(res.data.data);
                setUnreadCount(res.data.data.filter(n => !n.isRead).length);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.patch(`http://localhost:5001/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistic upate
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const deleteNotification = async (id, e) => {
        e.stopPropagation();
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistic update
            const targetNotif = notifications.find(n => n._id === id);
            if (targetNotif && !targetNotif.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-300 z-50"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-50 border border-gray-100 overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold shadow-sm">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>

                        <div className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-hide">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                    <Bell size={32} className="mb-3 opacity-20" />
                                    <p className="font-medium">You're all caught up!</p>
                                    <p className="text-xs mt-1">No new notifications</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif._id}
                                        className={`p-4 rounded-xl transition-all group relative border border-transparent
                      ${notif.isRead ? 'hover:bg-gray-50/80 hover:border-gray-100/50' : 'bg-indigo-50/40 border-indigo-100/50 hover:bg-indigo-50/80'}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-1 min-w-0 pr-8">
                                                <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-bold'}`}>
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2 font-medium">
                                                    {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                {notif.link && (
                                                    <Link
                                                        href={notif.link}
                                                        className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold mt-3 hover:text-indigo-800 transition-colors bg-indigo-50 px-2 py-1 rounded-md"
                                                        onClick={() => { if (!notif.isRead) markAsRead(notif._id); setIsOpen(false); }}
                                                    >
                                                        View Details <ExternalLink size={12} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action buttons (only show on hover via flex reverse order hidden by default on mobile) */}
                                        <div className="absolute top-4 right-3 flex flex-col gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity opacity-100">
                                            {!notif.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notif._id)}
                                                    className="p-1.5 text-gray-400 bg-white shadow-sm rounded-lg border border-gray-100 hover:text-green-600 hover:border-green-200 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} strokeWidth={3} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => deleteNotification(notif._id, e)}
                                                className="p-1.5 text-gray-400 bg-white shadow-sm rounded-lg border border-gray-100 hover:text-red-600 hover:border-red-200 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50/80 text-center backdrop-blur-md">
                            <Link
                                href="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-sm font-black text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                                Go to Notification Center
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
