'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
import { 
    Users, Briefcase, CheckCircle, TrendingUp, Loader2, 
    ShieldCheck, Activity, Globe, Zap, AlertCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import Avatar from '@/components/common/Avatar';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, reportsRes] = await Promise.all([
                axios.get('/admin/dashboard'),
                axios.get('/admin/reports')
            ]);
            
            if (statsRes.data.success) setStats(statsRes.data.data);
            if (reportsRes.data.success) setReports(reportsRes.data.data);
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
            setError('The system encountered a synchronization error while fetching dashboard metrics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-indigo-500/20 rounded-full animate-pulse" />
                </div>
                <p className="text-sm font-black text-indigo-600/50 uppercase tracking-[0.2em]">Synchronizing Protocols...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-rose-50 rounded-[3rem] border border-rose-100 mx-8">
                <AlertCircle className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black text-rose-900 mb-2">Protocol Interrupted</h2>
                <p className="text-rose-600 font-bold mb-8 max-w-sm">{error}</p>
                <button onClick={fetchData} className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-all">Retry Synchronization</button>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
        { label: 'Verified Employers', value: stats?.totalEmployers || 0, icon: ShieldCheck, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/20' },
        { label: 'Active Internships', value: stats?.activeInternships || 0, icon: Briefcase, color: 'from-indigo-500 to-purple-400', shadow: 'shadow-indigo-500/20' },
        { label: 'Match Efficiency', value: `${stats?.matchSuccessRate || 0}%`, icon: Zap, color: 'from-orange-500 to-amber-400', shadow: 'shadow-orange-500/20' }
    ];

    return (
        <div className="p-6 space-y-12 max-w-[1600px] mx-auto min-h-screen">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
                            <ShieldCheck className="text-white w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">System Level: Root Access</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-baseline gap-2 leading-none">
                        Command Center <span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-gray-500 font-bold mt-2">Platform-wide heuristic monitoring and moderation console</p>
                </motion.div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={stat.label} 
                        className="relative group overflow-hidden bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity blur-3xl`} />
                        
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} ${stat.shadow} text-white`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        
                        <div className="relative z-10">
                            <p className="text-5xl font-black text-gray-900 tracking-tighter transition-transform duration-500 group-hover:scale-110 origin-left">
                                {stat.value}
                            </p>
                            <div className="flex items-center gap-1 mt-4 text-[10px] font-black text-emerald-500 uppercase tracking-[0.1em]">
                                <TrendingUp size={12} />
                                <span>+2.4% System Baseline</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Placement Trend Chart */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/50 shadow-xl"
                >
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-wide">
                                <Activity className="text-indigo-600" size={24} /> Placement Velocity
                            </h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Daily Transmission Metrics</p>
                        </div>
                    </div>
                    
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={reports?.applicationsTrend || []}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="_id" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        borderRadius: '16px', 
                                        border: '1px solid #f1f5f9',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        padding: '12px'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#6366f1" 
                                    fillOpacity={1} 
                                    fill="url(#colorCount)" 
                                    strokeWidth={4}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Match Quality Chart */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/50 shadow-xl flex flex-col"
                >
                    <h3 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-3 uppercase tracking-wide">
                        <Zap className="text-amber-500" size={24} /> Engine Quality
                    </h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-10">Match Tier Distribution</p>
                    
                    <div className="relative flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={reports?.matchDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {(reports?.matchDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-gray-900 tracking-tighter">
                                {reports?.matchDistribution?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0}
                            </span>
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Total Pairs</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-10">
                        {(reports?.matchDistribution || []).map((item, idx) => (
                            <div key={item._id} className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl hover:bg-white transition-all duration-300 border border-transparent hover:border-gray-100 group">
                                <div className={`w-2.5 h-2.5 rounded-full shadow-sm group-hover:scale-125 transition-transform`} style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter truncate">{item._id}</span>
                                <span className="text-xs font-black text-indigo-600 ml-auto">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recent Feeds Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                {/* Recent Internships */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                            <Globe size={20} className="text-indigo-600" /> Listing Stream
                        </h3>
                    </div>
                    <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-xl divide-y divide-gray-50 overflow-hidden">
                        {(stats?.recentActivity?.internships || []).map((i, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={i._id} 
                                className="p-6 flex justify-between items-center hover:bg-white/80 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-5">
                                    <Avatar
                                        src={i.employer?.profilePicture}
                                        name={i.positionTitle}
                                        size="lg"
                                        className="rounded-2xl group-hover:scale-110 transition-transform"
                                    />
                                    <div>
                                        <p className="font-black text-base text-gray-900">{i.positionTitle}</p>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{i.employer?.companyName || 'Anonymous Node'}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[9px] font-black px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-all">ESTABLISHED</span>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{new Date(i.createdAt).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recent Applications */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                            <Zap size={20} className="text-orange-600" /> Transmission Log
                        </h3>
                    </div>
                    <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-xl divide-y divide-gray-50 overflow-hidden">
                        {(stats?.recentActivity?.applications || []).map((a, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={a._id} 
                                className="p-6 flex justify-between items-center hover:bg-white/80 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-5">
                                    <Avatar
                                        src={a.student?.profilePicture}
                                        name={a.student?.name}
                                        size="lg"
                                        className="rounded-2xl group-hover:scale-110 transition-transform"
                                    />
                                    <div>
                                        <p className="font-black text-base text-gray-900">{a.student?.name || 'Unknown Operator'}</p>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Applying for <span className="text-indigo-600">{a.internship?.positionTitle || 'Position'}</span></p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Sync</span>
                                    </div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{new Date(a.createdAt).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
