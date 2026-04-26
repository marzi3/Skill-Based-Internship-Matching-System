'use client';

import React, { useState } from 'react';
import { 
    User, 
    Mail, 
    Lock, 
    Shield, 
    AlertCircle, 
    CheckCircle2, 
    ChevronRight, 
    Loader2,
    Eye,
    EyeOff
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from '@/services/apiClient';
import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';
import { motion } from 'framer-motion';

export default function AccountSettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Password change state
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });
            
            const res = await axios.put('/auth/password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });

            if (res.data.success) {
                setMessage({ type: 'success', text: 'Password updated successfully!' });
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'Failed to update password' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
            <header className="space-y-2">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Account Control</h1>
                <p className="text-gray-500 font-medium">Manage your security credentials and core account parameters.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-8 text-center bg-white border-gray-100 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
                        <div className="flex flex-col items-center">
                            <Avatar name={user?.name} src={user?.profilePicture} size="xl" className="ring-4 ring-indigo-50" />
                            <h2 className="mt-6 text-xl font-black text-gray-900 uppercase tracking-tight">{user?.name}</h2>
                            <p className="text-sm font-bold text-indigo-600 uppercase tracking-[0.2em] mt-1">{user?.role} NODE</p>
                            
                            <div className="w-full mt-8 pt-8 border-t border-gray-50 space-y-4">
                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                                    <span>Status</span>
                                    <span className="text-emerald-500 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Active
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                                    <span>Verified</span>
                                    <span className={user?.isVerified ? 'text-indigo-600' : 'text-amber-500'}>
                                        {user?.isVerified ? 'YES' : 'PENDING'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-indigo-900 border-none text-white shadow-2xl">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <Shield className="text-indigo-300" size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-black uppercase text-xs tracking-widest">Security Protocol</h3>
                                <p className="text-indigo-100 text-xs leading-relaxed">Ensure your password uses at least 12 characters, including special symobls and numeric nodes for maximum encryption.</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Account Actions */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Public Info */}
                    <Card padding="lg" className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Core Details</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Identity Name</label>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 font-bold flex items-center gap-3">
                                        <User size={18} className="text-gray-400" />
                                        {user?.name}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Interface</label>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 font-bold flex items-center gap-3">
                                        <Mail size={18} className="text-gray-400" />
                                        {user?.email}
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 italic">Critical identity fields cannot be modified here. Contact admin for node re-aliasing.</p>
                        </div>
                    </Card>

                    {/* Password Update */}
                    <Card padding="lg" className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Master Password Update</h3>
                        </div>

                        {message.text && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}
                            >
                                {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                                <p className="text-sm font-bold">{message.text}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        required
                                        className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                                        placeholder="Enter current system password"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Protocol Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            required
                                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                                            placeholder="Min. 12 characters"
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirm New Protocol</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            required
                                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                                            placeholder="Re-enter new password"
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gray-900 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={18} />}
                                Synchronize New Password
                            </button>
                        </form>
                    </Card>

                    {/* Dangerous Actions */}
                    <div className="p-8 border-2 border-rose-100 bg-rose-50/30 rounded-3xl space-y-6">
                        <div className="flex items-center gap-4 text-rose-600">
                            <AlertCircle size={32} />
                            <div>
                                <h3 className="font-black uppercase text-sm tracking-widest">Deactivate Node Interface</h3>
                                <p className="text-xs font-medium text-rose-500 mt-1">Permanently remove your identity from the InternMatch neural network.</p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">
                            Terminate Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
