'use client';

import { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
import { 
    Users, Briefcase, CheckCircle, TrendingUp, Loader2, 
    ShieldCheck, Activity, Globe, Zap, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchDistributionChart, PlacementTrendChart } from '@/components/admin/AdminCharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoverTab, setHoverTab] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, reportsRes] = await Promise.all([
                    axios.get('/admin/dashboard'),
                    axios.get('/admin/reports')
                ]);
                
                if (statsRes.data.success) setStats(statsRes.data.data);
                if (reportsRes.data.success) setReports(reportsRes.data.data);
            } catch (err) {
                console.error('Failed to fetch admin data:', err);
            } finally {
                setLoading(false);
            }
        };
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

    const statCards = [
        { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
        { label: 'Verified Employers', value: stats?.totalEmployers || 0, icon: ShieldCheck, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/20' },
        { label: 'Active Internships', value: stats?.activeInternships || 0, icon: Briefcase, color: 'from-indigo-500 to-purple-400', shadow: 'shadow-indigo-500/20' },
        { label: 'Match Efficiency', value: `${stats?.matchSuccessRate || 0}%`, icon: Zap, color: 'from-orange-500 to-amber-400', shadow: 'shadow-orange-500/20' }
    ];

    return (
        <div className="p-8 space-y-12 max-w-[1600px] mx-auto">
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
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">System Level: Root</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-baseline gap-2">
                        Command Center <span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Global platform synchronization and heuristic monitoring</p>
                </motion.div>

                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Network Live</span>
                    </div>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={stat.label} 
                        className="relative group overflow-hidden bg-white/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity blur-3xl`} />
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} ${stat.shadow} text-white`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        
                        <div className="relative z-10">
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">
                                {stat.value}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-500">
                                <TrendingUp size={12} />
                                <span>+2.4% from system baseline</span>
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
                    className="lg:col-span-2 bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 shadow-xl"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                <Activity className="text-indigo-600" size={24} /> Placement Velocity
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mt-1">Daily application and conversion metrics</p>
                        </div>
                        <div className="flex gap-2">
                            {['7D', '30D', '90D'].map(t => (
                                <button key={t} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${t === '30D' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-gray-100/50 text-gray-400 hover:bg-gray-200'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <PlacementTrendChart data={reports?.applicationsTrend} />
                </motion.div>

                {/* Match Quality Chart */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 shadow-xl"
                >
                    <h3 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-3">
                        <Zap className="text-amber-500" size={24} /> Engine Quality
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mb-8">Match tier distribution across ecosystem</p>
                    
                    <div className="relative">
                        <MatchDistributionChart data={reports?.matchDistribution} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-gray-900">
                                {reports?.matchDistribution?.reduce((acc, curr) => acc + curr.count, 0) || 0}
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Pairs</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        {reports?.matchDistribution?.map((item, idx) => (
                            <div key={item._id} className="flex items-center gap-2 p-3 bg-gray-50/50 rounded-2xl hover:bg-white transition-colors duration-300">
                                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'][idx % 4] }} />
                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter truncate">{item._id}</span>
                                <span className="text-xs font-bold text-gray-400 ml-auto">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recent Feeds Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                {/* Recent Internships */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                            <Globe size={20} className="text-indigo-600" /> Live Protocol: Listings
                        </h3>
                        <button className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-full transition-colors">VIEW LOGS</button>
                    </div>
                    <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-xl divide-y divide-gray-100 overflow-hidden">
                        {stats?.recentActivity?.internships?.map((i, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={i._id} 
                                className="p-5 flex justify-between items-center hover:bg-white/50 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl group-hover:scale-110 transition-transform">
                                        {i.positionTitle[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-gray-900">{i.positionTitle}</p>
                                        <p className="text-xs font-bold text-gray-400">{i.employer?.companyName || 'Anonymous Company'}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500 uppercase">ACTIVE</span>
                                    <span className="text-[9px] font-bold text-gray-300 uppercase">{new Date(i.createdAt).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recent Applications */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                            <Zap size={20} className="text-orange-600" /> Transmission Log: Apps
                        </h3>
                        <button className="text-[10px] font-black text-orange-600 hover:bg-orange-50 px-3 py-1 rounded-full transition-colors">MONITOR ALL</button>
                    </div>
                    <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-xl divide-y divide-gray-100 overflow-hidden">
                        {stats?.recentActivity?.applications?.map((a, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={a._id} 
                                className="p-5 flex justify-between items-center hover:bg-white/50 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 font-bold text-xl group-hover:scale-110 transition-transform">
                                        {a.student?.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-gray-900">{a.student?.name || 'Applicant'}</p>
                                        <p className="text-xs font-bold text-gray-400">applied for <span className="text-gray-600">{a.internship?.positionTitle || 'Position'}</span></p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1">
                                        <AlertCircle size={10} className="text-orange-500" />
                                        <span className="text-[10px] font-black text-orange-500">PENDING SYNC</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-300 uppercase">{new Date(a.createdAt).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
