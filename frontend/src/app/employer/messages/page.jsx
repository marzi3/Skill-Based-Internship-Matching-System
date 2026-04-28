'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import { ArrowLeft, MessageSquare, Send, Loader2, Check, CheckCheck, ShieldAlert, Flag, Pin, PinOff } from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { motion } from 'framer-motion';

/**
 * Employer Messages — lists conversations from applications, allows sending/viewing messages.
 */
const EmployerMessagesPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { socket } = useSocket();
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Socket.IO Listener for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            // Update conversation list to move this app to the top
            setApplications(prev => {
                const existing = prev.find(a => a._id === msg.applicationId);
                if (!existing) return prev;
                const filtered = prev.filter(a => a._id !== msg.applicationId);
                return [existing, ...filtered];
            });

            // Only add if it's for the currently open conversation
            if (selectedApp && msg.applicationId === selectedApp._id) {
                setMessages((prev) => [msg, ...prev]); // Prepend for reversed order
                
                // If the message is from the other party and the chat is open, mark as read
                if (msg.senderId?._id !== user?._id && msg.senderId !== user?._id) {
                    axios.patch(`/messages/${msg._id}/read`).then(() => {
                        window.dispatchEvent(new CustomEvent('refresh-badges'));
                    }).catch(() => {});
                }
            } else if (msg.senderId?._id !== user?._id && msg.senderId !== user?._id) {
                // Not open, but received a new message
                window.dispatchEvent(new CustomEvent('refresh-badges'));
            }
        };

        const handleMessagesRead = (data) => {
            if (selectedApp && data.applicationId === selectedApp._id) {
                setMessages(prev => prev.map(m => {
                    if (data.messageId && m._id === data.messageId) return { ...m, isRead: true };
                    if (!data.messageId) return { ...m, isRead: true };
                    return m;
                }));
            }
        };

        socket.on('receiveMessage', handleNewMessage);
        socket.on('messagesRead', handleMessagesRead);

        return () => {
            socket.off('receiveMessage', handleNewMessage);
            socket.off('messagesRead', handleMessagesRead);
        };
    }, [socket, selectedApp, user?._id]);

    useEffect(() => { fetchApplications(); }, []);

    const fetchApplications = async () => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.get('/applications/employer', {
                headers: { Authorization: `Bearer ${token}` },
            });
            let apps = res.data.data || res.data.applications || [];
            
            // Filter out rejected/accepted students from messaging as requested
            apps = apps.filter(app => !['Rejected', 'Accepted'].includes(app.status));
            
            // Sort: pinned first, then by earliest received (meaning latest message date first in the sidebar)
            apps.sort((a, b) => {
                if (a.isPinnedByEmployer && !b.isPinnedByEmployer) return -1;
                if (!a.isPinnedByEmployer && b.isPinnedByEmployer) return 1;
                return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
            });
            
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
            const res = await axios.get(`/messages/${app._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(res.data.data || res.data.messages || []);
            // Mark all received messages as read
            await axios.patch(`/messages/${app._id}/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => {});
            
            // Refresh sidebar badges
            window.dispatchEvent(new CustomEvent('refresh-badges'));
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
            const res = await axios.post('/messages', {
                applicationId: selectedApp._id,
                content: newMessage.trim(),
                receiverId: selectedApp.student?._id || selectedApp.student,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const sent = res.data.data || res.data.message;
            if (sent) {
                setMessages(prev => [sent, ...prev]); // Prepend for reversed order
                // Move current app to top of sidebar
                setApplications(prev => {
                    const filtered = prev.filter(a => a._id !== selectedApp._id);
                    return [selectedApp, ...filtered];
                });
            }
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
            alert('Failed to send message');
        } finally {
            setSendLoading(false);
        }
    };

    const togglePin = async () => {
        if (!selectedApp) return;
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.patch(`/applications/${selectedApp._id}/pin`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const isPinned = res.data.isPinned;
            
            // Update selected app state
            setSelectedApp(prev => ({ ...prev, isPinnedByEmployer: isPinned }));
            
            // Update sidebar sorting
            setApplications(prev => {
                const updated = prev.map(a => a._id === selectedApp._id ? { ...a, isPinnedByEmployer: isPinned } : a);
                return updated.sort((a, b) => {
                    if (a.isPinnedByEmployer && !b.isPinnedByEmployer) return -1;
                    if (!a.isPinnedByEmployer && b.isPinnedByEmployer) return 1;
                    return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
                });
            });
        } catch (err) {
            console.error('Failed to toggle pin:', err);
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
                            <div className="p-6 text-center text-sm text-gray-500">
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
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Avatar
                                                    src={app.student?.profilePicture}
                                                    name={studentName} size="md"
                                                    className="rounded-xl border border-gray-100"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline gap-2">
                                                        <p className="font-bold text-gray-900 text-sm truncate">{studentName}</p>
                                                        {app.isPinnedByEmployer && (
                                                            <Pin size={12} className="text-indigo-500 fill-indigo-500 shrink-0" />
                                                        )}
                                                        {app.lastMessageAt && (
                                                            <span className="text-[10px] text-gray-500 whitespace-nowrap ml-1">
                                                                {new Date(app.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-indigo-500 font-medium truncate">{position}</p>
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
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="font-medium">Select a conversation to start messaging</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={selectedApp.student?.profilePicture}
                                        name={selectedApp.student?.name || 'Student'} size="md"
                                        className="rounded-xl border border-gray-100"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{selectedApp.student?.name || 'Student'}</p>
                                        <p className="text-xs text-gray-500">Re: {selectedApp.internship?.positionTitle || 'Internship'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={togglePin}
                                        className={`p-2 rounded-lg transition-all ${selectedApp.isPinnedByEmployer ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                                        title={selectedApp.isPinnedByEmployer ? "Unpin conversation" : "Pin conversation"}
                                    >
                                        {selectedApp.isPinnedByEmployer ? <PinOff size={18} /> : <Pin size={18} />}
                                    </button>
                                    <button 
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Report Student"
                                        onClick={() => alert('Report feature: Flag inappropriate behavior to system admins.')}
                                    >
                                        <Flag size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages List - Reversed for bottom-up flow */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse">
                                <div ref={chatEndRef} />
                                {msgLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        No messages yet. Start the conversation!
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const sid = msg.senderId?._id ?? msg.senderId;
                                        const userId = user?._id || user?.id;
                                        const isMe = sid?.toString() === userId?.toString();
                                        return (
                                            <motion.div
                                                key={msg._id || idx}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                                        isMe
                                                            ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/15'
                                                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                                    }`}>
                                                        <p>{msg.content}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-1 mt-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <span className="text-[10px] text-gray-500">
                                                            {(msg.timestamp || msg.createdAt) ? new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </span>
                                                        {isMe && (
                                                            msg.isRead
                                                                ? <CheckCheck size={12} className="text-indigo-500" title="Seen" />
                                                                : <Check size={12} className="text-gray-500" title="Sent" />
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>                             {/* Message Input */}
                            {selectedApp.status === 'Rejected' ? (
                                <div className="p-4 bg-red-50 border-t border-red-100 flex items-center gap-3 text-red-700 text-sm font-medium">
                                    <ShieldAlert size={18} />
                                    <span>Messaging is disabled for rejected applications.</span>
                                </div>
                            ) : (
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
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployerMessagesPage;
