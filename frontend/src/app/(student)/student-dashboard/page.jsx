
'use client';

// Student dashboard Page

import { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
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
    ChevronLeft,
    Sparkles
} from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/notifications/NotificationBell';
import RecommendedInternships from '@/components/matching/RecommendedInternships';
import OnboardingTour from '@/components/OnboardingTour';

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [matches, setMatches] = useState([]);
    const [applications, setApplications] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [stats, setStats] = useState({
        applicationsCount: 0,
        skillMatches: 0,
        verificationPoints: 0
    });
    const [loading, setLoading] = useState(true);
    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem('hasSeenStudentTour');
        if (!hasSeen && user) {
            setShowTour(true);
        }
    }, [user]);

    const handleTourComplete = () => {
        setShowTour(false);
        localStorage.setItem('hasSeenStudentTour', 'true');
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [matchesRes, statsRes, appsRes] = await Promise.all([
                    axios.get(`matching/best-matches`),
                    axios.get(`applications/student/stats`),
                    axios.get(`applications/student`)
                ]);

                if (matchesRes.data.success) {
                    setMatches(matchesRes.data.data?.slice(0, 10) || []);
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
        <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden relative">
            {showTour && <OnboardingTour role="student" onComplete={handleTourComplete} />}
            {/* Sidebar / Bottom Nav */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 hidden md:flex flex-col transition-all duration-300 ease-in-out z-20`}>
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
                    <Link id="nav-profile" href="/student-profile" className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all`} title="Profile Settings">
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
                    <Link id="nav-matches" href="/matches" className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all`} title="Best Matches">
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

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Link href="/student-dashboard" className="flex flex-col items-center text-primary-600">
                    <LayoutDashboard size={24} />
                    <span className="text-[10px] font-bold mt-1">Home</span>
                </Link>
                <Link href="/find-internships" className="flex flex-col items-center text-gray-400 hover:text-primary-600 transition-colors">
                    <Search size={24} />
                    <span className="text-[10px] mt-1">Search</span>
                </Link>
                <Link href="/matches" className="flex flex-col items-center text-gray-400 hover:text-primary-600 transition-colors">
                    <Zap size={24} />
                    <span className="text-[10px] mt-1">Matches</span>
                </Link>
                <Link href="/applications" className="flex flex-col items-center text-gray-400 hover:text-primary-600 transition-colors">
                    <Briefcase size={24} />
                    <span className="text-[10px] mt-1">Apps</span>
                </Link>
                <Link href="/student-profile" className="flex flex-col items-center text-gray-400 hover:text-primary-600 transition-colors">
                    <Settings size={24} />
                    <span className="text-[10px] mt-1">Profile</span>
                </Link>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative">
                <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 md:py-6 flex items-center justify-between sticky top-0 z-50 transition-all shadow-sm">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-xs md:text-sm text-gray-500 font-medium">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        {!localStorage.getItem('hasSeenStudentTour') && (
                            <button
                                onClick={() => setShowTour(true)}
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                            >
                                <Sparkles size={14} /> Start Tour
                            </button>
                        )}
                        <NotificationBell />
                        <Avatar name={user?.name} src={user?.profilePicture} size="md" />
                    </div>
                </header>

                <div className="relative z-0 p-4 md:p-8 space-y-6 md:space-y-8">
                    {/* Upcoming Interviews Protocol (if any) */}
                    {applications.some(app => app.status === 'Interviewing') && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 italic">
                                <Clock className="text-indigo-600" size={20} /> Upcoming Interviews
                            </h2>
                            <div className="space-y-4">
                                {applications.filter(app => app.status === 'Interviewing').map(app => (
                                    <div key={app._id} onClick={() => router.push(`/applications/${app._id}`)} className="cursor-pointer">
                                        <Card className="p-8 border-indigo-100 bg-white relative overflow-hidden group hover:shadow-xl transition-all border-l-4 border-l-indigo-600">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                                <div className="flex items-center gap-6 flex-1">
                                                    <Avatar name={app.employer?.companyName} src={app.employer?.profilePicture} size="lg" />
                                                    <div className="space-y-1">
                                                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-lg">{app.internship?.positionTitle}</h3>
                                                        <p className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em]">{app.employer?.companyName}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 lg:gap-12 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-50 md:border-0">
                                                    <div className="hidden sm:flex flex-col items-center min-w-[90px]">
                                                        <p className="text-[10px] font-black text-slate-300 uppercase underline decoration-indigo-500/30 underline-offset-4 mb-2">Status</p>
                                                        <Badge variant="primary">{app.status}</Badge>
                                                    </div>
                                                    <div className="hidden lg:flex flex-col items-center min-w-[100px]">
                                                        <p className="text-[10px] font-black text-slate-300 uppercase underline decoration-indigo-500/30 underline-offset-4 mb-2">Applied</p>
                                                        <p className="text-sm font-black text-slate-900 tracking-tighter">{new Date(app.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-6 ml-auto">
                                                        <span onClick={(e) => { e.stopPropagation(); router.push(`/internships/${app.internship?._id}`); }} className="hidden sm:inline-block text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline cursor-pointer whitespace-nowrap">View Spec</span>
                                                        <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-indigo-600 group-hover:scale-110 group-hover:rotate-12 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center">
                                                            <ChevronRight size={18} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                            <Link href="/applications" className="text-sm font-bold text-primary-600 hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="py-10 text-center"><Loader size={32} className="animate-spin mx-auto text-primary-600" /></div>
                            ) : applications.length > 0 ? (
                                applications.map((app) => (
                                    <div key={app._id} onClick={() => router.push(`/applications/${app._id}`)} className="cursor-pointer">
                                        <Card className="p-8 border-slate-100 bg-white relative overflow-hidden group hover:shadow-xl transition-all border-l-4 border-l-indigo-600 hover:border-indigo-100">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                                <div className="flex items-center gap-6 flex-1">
                                                    <Avatar name={app.employer?.companyName} src={app.employer?.profilePicture} size="lg" />
                                                    <div className="space-y-1">
                                                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-lg">{app.internship?.positionTitle || 'Unknown Position'}</h3>
                                                        <p className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em]">{app.employer?.companyName || 'Unknown Company'}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 lg:gap-12 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-50 md:border-0">
                                                    <div className="hidden sm:flex flex-col items-center min-w-[90px]">
                                                        <p className="text-[10px] font-black text-slate-300 uppercase underline decoration-indigo-500/30 underline-offset-4 mb-2">Status</p>
                                                        <Badge variant={app.status === 'Applied' ? 'secondary' : app.status === 'Selected' ? 'success' : 'primary'}>{app.status}</Badge>
                                                    </div>
                                                    <div className="hidden lg:flex flex-col items-center min-w-[100px]">
                                                        <p className="text-[10px] font-black text-slate-300 uppercase underline decoration-indigo-500/30 underline-offset-4 mb-2">Applied</p>
                                                        <p className="text-sm font-black text-slate-900 tracking-tighter">{new Date(app.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-6 ml-auto">
                                                        <span onClick={(e) => { e.stopPropagation(); router.push(`/internships/${app.internship?._id}`); }} className="hidden sm:inline-block text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline cursor-pointer whitespace-nowrap">View Spec</span>
                                                        <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-indigo-600 group-hover:scale-110 group-hover:rotate-12 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center">
                                                            <ChevronRight size={18} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
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
                            <Link href="/matches" className="text-sm font-bold text-primary-600 hover:underline">View All Matches</Link>
                        </div>

                        <RecommendedInternships matches={matches} />
                    </div>
                </div>
            </main>
        </div>
    );
}
