
'use client';

// Student dashboard Page

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Zap,
    Search,
    MapPin,
    Clock,
    Briefcase,
    Star,
    CheckCircle2,
    Loader2,
    TrendingUp,
    LayoutDashboard,
    Filter,
    Users,
    Bell,
    Settings,
    LogOut,
    ChevronRight,
    Loader,
    MessageSquare,
    Menu,
    ChevronLeft
} from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const [matches, setMatches] = useState([]);
    const [applications, setApplications] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [stats, setStats] = useState({
        applicationsCount: 0,
        skillMatches: 0,
        verificationPoints: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                const [matchesRes, statsRes, appsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/matching/best-matches`, config),
                    axios.get(`${API_URL}/api/applications/student/stats`, config),
                    axios.get(`${API_URL}/api/applications/student`, config)
                ]);

                if (matchesRes.data.success) {
                    setMatches(matchesRes.data.data?.slice(0, 3) || []);
                }
                if (statsRes.data.success) {
                    setStats(statsRes.data.data);
                }
                if (appsRes.data.success) {
                    setApplications(appsRes.data.data?.slice(0, 3) || []);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 hidden md:flex flex-col transition-all duration-300 ease-in-out`}>
                <div className={`p-6 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                    {isSidebarOpen && <h2 className="text-2xl font-black text-primary-600 tracking-tighter">InternMatch</h2>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                    </button>
                </div>
                <nav className="flex-1 px-4 space-y-2 mt-2">
                    <Link href="/student-dashboard" className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 bg-primary-50 text-primary-700 rounded-xl font-bold`} title="Dashboard">
                        <LayoutDashboard size={20} className="flex-shrink-0" />
                        {isSidebarOpen && <span>Dashboard</span>}
                    </Link>
                    <Link href="/student-profile" className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all`} title="Profile Settings">
                        <Settings size={20} className="flex-shrink-0" />
                        {isSidebarOpen && <span>Profile Settings</span>}
                    </Link>
                    <Link href="/find-internships" className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all`} title="Browse Jobs">
                        <Search size={20} className="flex-shrink-0" />
                        {isSidebarOpen && <span>Browse Jobs</span>}
                    </Link>
                    <Link href="/applications" className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all`} title="My Applications">
                        <Briefcase size={20} className="flex-shrink-0" />
                        {isSidebarOpen && <span>My Applications</span>}
                    </Link>
                    <Link href="/matches" className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all`} title="Best Matches">
                        <Zap size={20} className="flex-shrink-0" />
                        {isSidebarOpen && <span>Best Matches</span>}
                    </Link>
                    <Link href="/messages" className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all`} title="Messages">
                        <MessageSquare size={20} className="flex-shrink-0" />
                        {isSidebarOpen && <span>Messages</span>}
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-100 space-y-2">
                    <button onClick={logout} className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-all`} title="Logout">
                        <LogOut size={20} className="flex-shrink-0" />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-500 font-medium">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <Avatar name={user?.name} src={user?.profilePicture} size="md" />
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 relative overflow-hidden group">
                            <div className="relative z-10 space-y-4">
                                <div className="p-3 bg-white/20 rounded-xl w-fit"><Briefcase size={24} /></div>
                                <div>
                                    <h3 className="text-indigo-100 font-bold uppercase text-[10px] tracking-widest">Active Applications</h3>
                                    <p className="text-4xl font-black">{stats.applicationsCount}</p>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <Briefcase size={120} />
                            </div>
                        </Card>

                        <Card className="p-6 border border-gray-100 space-y-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit"><Zap size={24} /></div>
                            <div>
                                <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">A.I. Skill Matches</h3>
                                <p className="text-4xl font-black text-gray-900 items-baseline flex gap-2">
                                    {stats.skillMatches} <span className="text-sm text-emerald-500 font-bold mt-2 flex items-center"><TrendingUp size={14} /> +0 pending</span>
                                </p>
                            </div>
                        </Card>

                        <Card className="p-6 border border-gray-100 space-y-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit"><Star size={24} /></div>
                            <div>
                                <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Verification Points</h3>
                                <p className="text-4xl font-black text-gray-900">{stats.verificationPoints}</p>
                            </div>
                        </Card>
                    </div>

                    {/* Recent Applications Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase className="text-primary-600" size={20} fill="currentColor" /> Recent Applications
                            </h2>
                            <Link href="/student/applications" className="text-sm font-bold text-primary-600 hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="py-10 text-center"><Loader size={32} className="animate-spin mx-auto text-primary-600" /></div>
                            ) : applications.length > 0 ? (
                                applications.map((app) => (
                                    <Card key={app._id} className="p-4 flex items-center justify-between hover:shadow-md transition-all border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <Avatar name={app.employer?.companyName} src={app.employer?.profilePicture} size="md" />
                                            <div>
                                                <h3 className="font-bold text-gray-900">{app.internship?.positionTitle || 'Unknown Position'}</h3>
                                                <p className="text-sm text-gray-500">{app.employer?.companyName || 'Unknown Company'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={app.status === 'Applied' ? 'secondary' : app.status === 'Selected' ? 'success' : 'primary'}>{app.status}</Badge>
                                            <Link href={`/internships/${app.internship?._id}`} className="text-gray-400 hover:text-primary-600"><ChevronRight size={20} /></Link>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="py-10 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                                    <p className="text-gray-400 font-bold">No applications submitted yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Matches Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Zap className="text-primary-600" size={20} fill="currentColor" /> Recommended for You
                            </h2>
                            <Link href="/student/matches" className="text-sm font-bold text-primary-600 hover:underline">View All Matches</Link>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {loading ? (
                                <div className="col-span-full py-20 text-center"><Loader size={32} className="animate-spin mx-auto text-primary-600" /></div>
                            ) : matches.length > 0 ? (
                                matches.map((match) => (
                                    <Card key={match.internship._id} padding="lg" className="hover:shadow-xl transition-all border border-gray-100 group">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="bg-gray-100 p-3 rounded-2xl"><Briefcase size={24} className="text-gray-600" /></div>
                                                <div className="flex flex-col items-end">
                                                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-black border border-emerald-100 flex items-center gap-1">
                                                        <Star size={12} fill="currentColor" /> {Math.round(match.score)}% Match
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{match.internship.positionTitle}</h3>
                                                <p className="text-gray-500 text-sm font-medium">{match.internship.employer?.companyName || match.internship.company}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {(match.internship.requiredSkills || []).slice(0, 3).map(skill => (
                                                    <Badge key={typeof skill === 'string' ? skill : skill.name} variant="secondary" size="sm">
                                                        {typeof skill === 'string' ? skill : skill.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => window.location.href = `/internships/${match.internship._id}`}
                                                className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group/btn"
                                            >
                                                Launch Protocol <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                                    <p className="text-gray-400 font-bold">No high-probability matches detected yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
