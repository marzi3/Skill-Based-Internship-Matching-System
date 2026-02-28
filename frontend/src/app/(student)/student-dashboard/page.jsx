
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
    Loader
} from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const [matches, setMatches] = useState([]);
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
                const [matchesRes, statsRes] = await Promise.all([
                    axios.get('/api/matching/best-matches'),
                    axios.get('/api/applications/student/stats')
                ]);

                if (matchesRes.data.success) {
                    setMatches(matchesRes.data.data?.slice(0, 3) || []);
                }
                if (statsRes.data.success) {
                    setStats(statsRes.data.data);
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
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6">
                    <h2 className="text-2xl font-black text-primary-600 tracking-tighter">InternMatch</h2>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/student-dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-700 rounded-xl font-bold">
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link href="/student-profile" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all">
                        <Settings size={20} /> Profile Settings
                    </Link>
                    <Link href="/find-internships" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all">
                        <Search size={20} /> Browse Jobs
                    </Link>
                    <Link href="/student/applications" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all">
                        <Briefcase size={20} /> My Applications
                    </Link>
                    <Link href="/student/matches" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all">
                        <Zap size={20} /> Best Matches
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-100 space-y-2">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-all">
                        <LogOut size={20} /> Logout
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
                        <div className="p-2 bg-gray-100 rounded-xl text-gray-500 hover:bg-gray-200 cursor-pointer transition-all">
                            <Bell size={20} />
                        </div>
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
                                    <Card key={match._id} padding="lg" className="hover:shadow-xl transition-all border border-gray-100 group">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="bg-gray-100 p-3 rounded-2xl"><Briefcase size={24} className="text-gray-600" /></div>
                                                <div className="flex flex-col items-end">
                                                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-black border border-emerald-100 flex items-center gap-1">
                                                        <Star size={12} fill="currentColor" /> {Math.round(match.totalScore)}% Match
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{match.positionTitle}</h3>
                                                <p className="text-gray-500 text-sm font-medium">{match.employer?.companyName || match.company || 'Incubator'}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {(match.requiredSkills || []).slice(0, 3).map(skill => (
                                                    <Badge key={typeof skill === 'string' ? skill : skill.name} variant="secondary" size="sm">
                                                        {typeof skill === 'string' ? skill : skill.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => window.location.href = `/internships/${match._id}`}
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
