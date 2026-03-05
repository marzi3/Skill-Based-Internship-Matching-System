'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Briefcase, FileText, CheckCircle, Activity, LayoutDashboard, Settings } from 'lucide-react';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = Cookies.get('token') || localStorage.getItem('token');
                if (!token) throw new Error('No authentication token found');

                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch stats and reports concurrently
                const [statsRes, reportsRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/admin/dashboard', config),
                    axios.get('http://localhost:5001/api/admin/reports', config)
                ]);

                setStats(statsRes.data.data);
                setReports(reportsRes.data.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
                <p>{error}</p>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Students', value: stats?.totalStudents || 0, icon: <Users size={24} className="text-blue-500" /> },
        { label: 'Total Employers', value: stats?.totalEmployers || 0, icon: <Briefcase size={24} className="text-purple-500" /> },
        { label: 'Active Internships', value: stats?.activeInternships || 0, icon: <Activity size={24} className="text-green-500" /> },
        { label: 'Total Applications', value: stats?.totalApplications || 0, icon: <FileText size={24} className="text-orange-500" /> },
        { label: 'Match Success Rate', value: `${stats?.matchSuccessRate || 0}%`, icon: <CheckCircle size={24} className="text-teal-500" /> }
    ];

    return (
        <div className="w-full h-full">
            <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Admin Command Center</h1>
                    <p className="text-gray-500 mt-1">Platform overview, metrics and recent activity</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-8">
                {statCards.map((stat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={stat.label}
                        className="glass p-6 rounded-2xl hover:-translate-y-1 transition-transform"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-semibold text-gray-500">{stat.label}</span>
                            <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-6 rounded-2xl"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-indigo-600" /> Applications Trend
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={reports?.applicationsTrend || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-6 rounded-2xl"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Briefcase size={20} className="text-purple-600" /> Placements by Department
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reports?.placements || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6 rounded-2xl"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6 line-clamp-1">Recent Applications</h3>
                    <div className="space-y-4">
                        {stats?.recentActivity?.applications?.length > 0 ? (
                            stats.recentActivity.applications.map((app) => (
                                <div key={app._id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-white transition-colors">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{app.student?.name || 'Unknown User'}</h4>
                                        <p className="text-sm text-gray-500">Applied for {app.internship?.positionTitle || 'Unknown Position'}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                    ${app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                                            app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'}`}>
                                        {app.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No recent applications found.</p>
                        )}
                    </div>
                </motion.div>

                {/* Top Skills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-6 rounded-2xl overflow-hidden"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Top Skills in Demand</h3>
                    <div className="space-y-4">
                        {reports?.skillsDemand?.length > 0 ? (
                            reports.skillsDemand.map((skill, idx) => (
                                <div key={skill._id || idx} className="flex items-center">
                                    <span className="w-8 text-sm font-bold text-gray-400">{idx + 1}.</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-gray-800">{skill._id}</span>
                                            <span className="text-sm text-gray-500">{skill.count} postings</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                                style={{ width: `${Math.min((skill.count / (reports.skillsDemand[0]?.count || 1)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No skills data available.</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
