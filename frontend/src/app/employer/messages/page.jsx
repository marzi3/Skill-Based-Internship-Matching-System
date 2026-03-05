'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import { ArrowLeft, MessageSquare, Send, Loader2, User } from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

/**
 * Employer Messages — lists conversations from applications, allows sending/viewing messages.
 */
const EmployerMessagesPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => { fetchApplications(); }, []);

    const fetchApplications = async () => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/applications/employer', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const apps = res.data.data || res.data.applications || [];
            setApplications(apps);
        } catch (err) {
            console.error('Failed to fetch applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const selectConversation = async (app) => {
        setSelectedApp(app);
        setMsgLoading(true);
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5001/api/messages/${app._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(res.data.data || res.data.messages || []);
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
            setMessages([]);
        } finally {
            setMsgLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedApp) return;
        setSendLoading(true);
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.post('http://localhost:5001/api/messages', {
                applicationId: selectedApp._id,
                content: newMessage.trim(),
                receiverId: selectedApp.student?._id || selectedApp.student,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const sent = res.data.data || res.data.message;
            if (sent) setMessages(prev => [...prev, sent]);
            setNewMessage('');
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            console.error('Failed to send message:', err);
            alert('Failed to send message');
        } finally {
            setSendLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => router.push('/employer/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Messages</h1>
                    <p className="text-sm text-gray-500">Communicate with applicants</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
                {/* Conversation List */}
                <div className="w-80 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden flex-shrink-0">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Conversations</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-400">
                                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                No conversations yet
                            </div>
                        ) : (
                            applications.map((app) => {
                                const studentName = app.student?.name || 'Unknown Student';
                                const position = app.internship?.positionTitle || 'Internship';
                                const isSelected = selectedApp?._id === app._id;
                                return (
                                    <button
                                        key={app._id}
                                        onClick={() => selectConversation(app)}
                                        className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${studentName}`}
                                                name={studentName} size="md"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 text-sm truncate">{studentName}</p>
                                                <p className="text-xs text-gray-400 truncate">{position}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    {!selectedApp ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="font-medium">Select a conversation to start messaging</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                                <Avatar
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedApp.student?.name || 'user'}`}
                                    name={selectedApp.student?.name || 'Student'} size="md"
                                />
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{selectedApp.student?.name || 'Student'}</p>
                                    <p className="text-xs text-gray-400">Re: {selectedApp.internship?.positionTitle || 'Internship'}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {msgLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        No messages yet. Start the conversation!
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
                                        return (
                                            <motion.div
                                                key={msg._id || idx}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMe
                                                    ? 'bg-indigo-600 text-white rounded-br-md'
                                                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                                    }`}>
                                                    <p>{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Message Input */}
                            <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Type your message…"
                                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sendLoading}
                                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {sendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployerMessagesPage;
