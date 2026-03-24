'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import { Send, User as UserIcon, Check, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSocket } from '@/context/SocketContext';

/**
 * MessageThread
 *
 * Renders a bidirectional chat thread for an application.
 * - Sent messages (isMe) are right-aligned with indigo bubble.
 * - Received messages are left-aligned with white bubble.
 * - Shows a single grey tick for sent-but-unread, double indigo tick for read.
 * - Marks all incoming messages as read when the thread is opened.
 *
 * @param {string} applicationId  Application document ID (scopes the thread)
 * @param {string} receiverId     The other party's User ID
 * @param {string} currentUserId  The authenticated user's ID
 */
export default function MessageThread({ applicationId, receiverId, currentUserId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const { socket } = useSocket();

    /** Fetch thread and immediately mark received messages as read */
    const fetchMessages = async () => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.get(`/messages/${applicationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch messages', err);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.patch(`/messages/${applicationId}/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistically update local state so ticks appear immediately
            setMessages(prev =>
                prev.map(m =>
                    m.receiverId?._id === currentUserId || m.receiverId === currentUserId
                        ? { ...m, isRead: true }
                        : m
                )
            );
        } catch (_) {
            // Silent fail — UI degrades gracefully
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [applicationId]);

    // After messages load, mark the received ones as read
    useEffect(() => {
        if (!loading && messages.length > 0) {
            markAllRead();
        }
    }, [loading]);

    // Real-time incoming message listener
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (incomingMsg) => {
            if (incomingMsg.applicationId?.toString() === applicationId?.toString() ||
                incomingMsg.applicationId === applicationId) {
                setMessages((prev) => [...prev, incomingMsg]);
                // Immediately mark it read since the user is looking at the thread
                markAllRead();
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);
        return () => socket.off('receiveMessage', handleReceiveMessage);
    }, [socket, applicationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.post(`/messages`, {
                applicationId,
                receiverId,
                content: newMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setMessages((prev) => [...prev, res.data.data]);
                setNewMessage('');
            }
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    /**
     * Determine if a message was sent by the current user.
     * The `senderId` field may be a populated object or a raw string ID.
     */
    const isMine = (msg) => {
        const sid = msg.senderId?._id ?? msg.senderId;
        return sid?.toString() === currentUserId?.toString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-[500px]">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <h3 className="font-bold text-gray-900 text-sm">Application Messages</h3>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#F8FAFC]">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        <p className="font-medium">No messages yet.</p>
                        <p className="text-sm mt-1">Start the conversation below!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const mine = isMine(msg);
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.15 }}
                                key={msg._id || idx}
                                className={`flex w-full ${mine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-end gap-2 max-w-[75%] ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${mine ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                                        <UserIcon size={13} />
                                    </div>

                                    {/* Bubble */}
                                    <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                                        <div className={`
                                            rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                                            ${mine
                                                ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/15'
                                                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
                                            }
                                        `}>
                                            {msg.content}
                                        </div>

                                        {/* Time + Read tick */}
                                        <div className={`flex items-center gap-1 mt-1 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {mine && (
                                                msg.isRead
                                                    ? <CheckCheck size={13} className="text-indigo-500" title="Seen" />
                                                    : <Check size={13} className="text-gray-400" title="Sent" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="absolute right-2 top-1.5 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}
