
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
import UpcomingInterviewCard from '@/components/student/UpcomingInterviewCard';

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
    const [nowTick, setNowTick] = useState(Date.now());

    const sortedApplications = [...applications].sort((a, b) => {
        const leftDate = new Date(b.createdAt || b.appliedDate || 0);
        const rightDate = new Date(a.createdAt || a.appliedDate || 0);
        return leftDate - rightDate;
    });

    const buildInterviewDateTime = (app) => {
        const rawDate = app?.interviewDetails?.date;
        if (!rawDate) return null;

        const interviewDate = new Date(rawDate);
        if (Number.isNaN(interviewDate.getTime())) return null;

        const rawTime = app?.interviewDetails?.time;
        if (rawTime) {
            const timeMatch = String(rawTime).match(/^(\d{1,2}):(\d{2})/);
            if (timeMatch) {
                interviewDate.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
            }
        }

        return interviewDate;
    };

    const upcomingInterviews = sortedApplications
        .filter(app => app.status === 'Interviewing')
        .sort((a, b) => {
            const leftDate = buildInterviewDateTime(a);
            const rightDate = buildInterviewDateTime(b);

            if (!leftDate && !rightDate) return 0;
            if (!leftDate) return 1;
            if (!rightDate) return -1;

            return leftDate - rightDate;
        });
    const recentApplications = sortedApplications.filter(app => app.status !== 'Interviewing').slice(0, 3);

    const formatDate = (value) => {
        if (!value) return 'To be confirmed';
        return new Date(value).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getCountdownLabel = (app) => {
        const interviewDate = buildInterviewDateTime(app);
        if (!interviewDate) return 'Starts in date pending';

        const diff = interviewDate.getTime() - nowTick;
        if (diff <= 0) return 'Starts now';

        const totalHours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(totalHours / 24);

        if (days > 0) {
            return `Starts in ${days} ${days === 1 ? 'day' : 'days'}`;
        }

        return 'Starts today';
    };

    const getLocationText = (app) => app?.interviewDetails?.location || app?.internship?.location || 'Location pending';

    const getMapUrl = (location) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;


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
                    setApplications(appsRes.data.data || []);
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

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNowTick(Date.now());
        }, 60000);

        return () => window.clearInterval(timer);
    }, []);

    return (
        <>
            {showTour && <OnboardingTour role="student" onComplete={handleTourComplete} />}

                <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 md:py-6 flex items-center justify-between sticky top-0 z-50 transition-all shadow-sm">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-xs md:text-sm text-gray-500 font-medium">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        {typeof window !== 'undefined' && !localStorage.getItem('hasSeenStudentTour') && (
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
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 md:gap-6">
                        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 md:p-6 relative overflow-hidden group">
                            <div className="relative z-10 space-y-2 md:space-y-4">
                                <div className="p-2 md:p-3 bg-white/20 rounded-xl w-fit"><Briefcase className="w-5 h-5 md:w-6 md:h-6" /></div>
                                <div>
                                    <h3 className="text-indigo-100 font-bold uppercase text-[9px] md:text-[10px] tracking-wider md:tracking-widest line-clamp-1">Active Apps</h3>
                                    <p className="text-2xl md:text-4xl font-black">{stats.applicationsCount}</p>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <Briefcase className="w-20 h-20 md:w-[120px] md:h-[120px]" />
                            </div>
                        </Card>

                        <Card className="p-4 md:p-6 border border-gray-100 space-y-2 md:space-y-4">
                            <div className="p-2 md:p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit"><Zap className="w-5 h-5 md:w-6 md:h-6" /></div>
                            <div>
                                <h3 className="text-gray-500 font-bold uppercase text-[9px] md:text-[10px] tracking-wider md:tracking-widest line-clamp-1">A.I. Matches</h3>
                                <p className="text-2xl md:text-4xl font-black text-gray-900 items-baseline flex flex-wrap gap-1 md:gap-2">
                                    {stats.skillMatches} <span className="text-[10px] md:text-sm text-emerald-500 font-bold flex items-center md:mt-2"><TrendingUp size={12} className="md:w-3.5 md:h-3.5 mr-0.5" /> +0</span>
                                </p>
                            </div>
                        </Card>

                        <Card className="p-4 md:p-6 border border-gray-100 space-y-2 md:space-y-4">
                            <div className="p-2 md:p-3 bg-amber-50 text-amber-600 rounded-xl w-fit"><Star className="w-5 h-5 md:w-6 md:h-6" /></div>
                            <div>
                                <h3 className="text-gray-500 font-bold uppercase text-[9px] md:text-[10px] tracking-wider md:tracking-widest line-clamp-1">Verifications</h3>
                                <p className="text-2xl md:text-4xl font-black text-gray-900">{stats.verificationPoints}</p>
                            </div>
                        </Card>
                    </div>

                    {/* Upcoming Interviews Protocol (if any) */}
                    {upcomingInterviews.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 italic">
                                        <Clock className="text-emerald-600" size={20} /> Upcoming Interview
                                    </h2>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                                    {upcomingInterviews.length} scheduled
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {upcomingInterviews.map((app) => (
                                    <UpcomingInterviewCard
                                        key={app._id}
                                        app={app}
                                        statusLabel="Scheduled"
                                        countdownLabel={getCountdownLabel(app)}
                                        formatDate={formatDate}
                                        getLocationText={getLocationText}
                                        onViewApplication={() => router.push(`/applications/${app._id}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

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
                            ) : recentApplications.length > 0 ? (
                                recentApplications.map((app) => (
                                    <div key={app._id} onClick={() => router.push(`/applications/${app._id}`)} className="cursor-pointer">
                                        <Card className="p-6 border-slate-100 bg-white relative overflow-hidden group hover:shadow-xl transition-all border-l-4 border-l-indigo-600 hover:border-indigo-100">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                                <div className="flex items-center gap-6 flex-1">
                                                    <Avatar name={app.employer?.companyName} src={app.employer?.profilePicture} size="lg" />
                                                    <div className="space-y-1">
                                                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-lg">{app.internship?.positionTitle || 'Unknown Position'}</h3>
                                                        <p className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em]">{app.employer?.companyName || 'Unknown Company'}</p>
                                                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 pt-2">
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <MapPin size={11} className="text-indigo-500" />
                                                                {app.internship?.location || 'Location not listed'}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <Zap size={11} className="text-emerald-500" />
                                                                Match {Math.round(app.matchScore || 0)}%
                                                            </span>
                                                            {app.status === 'Interviewing' && app.interviewDetails?.date && (
                                                                <span className="inline-flex items-center gap-1.5 text-indigo-600">
                                                                    <Clock size={11} />
                                                                    Interview {formatDate(app.interviewDetails.date)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 lg:gap-12 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-50 md:border-0">
                                                    <div className="hidden sm:flex flex-col items-center min-w-[90px]">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase underline decoration-indigo-500/30 underline-offset-4 mb-2">Status</p>
                                                        <Badge variant={app.status === 'Applied' ? 'secondary' : app.status === 'Selected' ? 'success' : 'primary'}>{app.status}</Badge>
                                                    </div>
                                                    <div className="hidden lg:flex flex-col items-center min-w-[100px]">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase underline decoration-indigo-500/30 underline-offset-4 mb-2">Applied</p>
                                                        <p className="text-sm font-black text-slate-900 tracking-tighter">{new Date(app.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-6 ml-auto">
                                                        <span onClick={(e) => { e.stopPropagation(); router.push(`/applications/${app._id}`); }} className="hidden sm:inline-block text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline cursor-pointer whitespace-nowrap">View Application</span>
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
                                    <p className="text-gray-500 font-bold">No applications submitted yet.</p>
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
        </>
    );
}
