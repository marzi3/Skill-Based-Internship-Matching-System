'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import { Send, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSocket } from '@/context/SocketContext';

export default function MessageThread({ applicationId, receiverId, currentUserId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const { socket } = useSocket();

    useEffect(() => {
        fetchMessages();
    }, [applicationId]);

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (incomingMsg) => {
            // Only append if it belongs to this conversation
            if (incomingMsg.applicationId === applicationId) {
                setMessages((prev) => [...prev, incomingMsg]);
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [socket, applicationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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
                setMessages([...messages, res.data.data]);
                setNewMessage('');
            }
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-[500px]">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Application Messages</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        <p className="font-medium">No messages yet.</p>
                        <p className="text-sm mt-1">Start the conversation below!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId?._id === currentUserId;
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={msg._id || idx}
                                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isMe ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                                        <UserIcon size={14} />
                                    </div>
                                    <div className={`rounded-2xl px-4 py-2 ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none shadow-sm'}`}>
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

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
                        className="absolute right-2 top-1.5 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}
