'use client';

import { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
import {
    Zap,
    Search,
    MapPin,
    Clock,
    Briefcase,
    Building2,
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
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function BestMatchesPage() {
    const { user, logout } = useAuth();
    const [matches, setMatches] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [expandedMatch, setExpandedMatch] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const matchesRes = await axios.get(`matching/best-matches?limit=20`);

                if (matchesRes.data.success) {
                    setMatches(matchesRes.data.data || []);
                }

            } catch (err) {
                console.error('Failed to fetch matches data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const toggleExpand = (id) => {
        if (expandedMatch === id) {
            setExpandedMatch(null);
        } else {
            setExpandedMatch(id);
        }
    }

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
                    <Link href="/student-dashboard" className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all`} title="Dashboard">
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
                    <Link href="/matches" className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 bg-primary-50 text-primary-700 rounded-xl font-bold transition-all`} title="Best Matches">
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
                        <h1 className="text-2xl font-bold text-gray-900">Your Best Matches</h1>
                        <p className="text-sm text-gray-500 font-medium">Opportunities curated by our AI engine explicitly for your skill profile.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-5xl mx-auto space-y-6">
                    {/* Page specific content */}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 mt-10">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                            <p className="text-gray-500 font-medium">Crunching skill matrices...</p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center mt-10">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Matches Found Yet</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">We could not find any internships aligning with your current profile. Update your skills to improve your chances!</p>
                            <Link href="/student-profile" className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                                Update Skill Profile
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {matches.map((match) => (
                                <div key={match.internship._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 pr-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                        {match.internship.positionTitle}
                                                    </h3>
                                                    <Badge
                                                        variant={
                                                            match.tier === 'EXCELLENT' ? 'success' :
                                                                match.tier === 'GOOD' ? 'primary' :
                                                                    'warning'
                                                        }
                                                        className="font-black text-[10px] tracking-wider uppercase border-0"
                                                    >
                                                        {match.tier} MATCH
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 mt-2 font-medium">
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <Building2 className="w-4 h-4 text-gray-400" />
                                                        <span className="truncate max-w-[150px]">{match.internship.company || match.internship.employer?.companyName || 'Unknown Company'}</span>
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        <span>{match.internship.workEnvironment || 'Remote'}</span>
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        <span>{match.internship.duration || '3 Months'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {match.internship.requiredSkills?.slice(0, 5).map((skill, idx) => (
                                                        <span key={idx} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg border border-gray-100">
                                                            {typeof skill === 'string' ? skill : skill.name}
                                                        </span>
                                                    ))}
                                                    {match.internship.requiredSkills?.length > 5 && (
                                                        <span className="px-2.5 py-1 bg-gray-50 text-gray-500 text-xs font-semibold rounded-lg border border-gray-100">
                                                            +{match.internship.requiredSkills.length - 5}
                                                        </span>
                                                    )}
                                                </div>

                                            </div>

                                            {/* Score Dial */}
                                            <div className="flex flex-col items-center shrink-0 w-24">
                                                <div className="relative w-16 h-16 flex items-center justify-center">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                        <path
                                                            className="text-gray-100"
                                                            strokeWidth="3"
                                                            stroke="currentColor"
                                                            fill="none"
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        />
                                                        <path
                                                            className={match.score >= 80 ? 'text-green-500' : match.score >= 60 ? 'text-blue-500' : 'text-amber-500'}
                                                            strokeDasharray={`${match.score}, 100`}
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                            stroke="currentColor"
                                                            fill="none"
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-lg font-black text-gray-900 leading-none">{Math.round(match.score)}</span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Score</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                                            <button
                                                onClick={() => toggleExpand(match.internship._id)}
                                                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors"
                                            >
                                                <Zap className="w-4 h-4" />
                                                <span>Why am I a match?</span>
                                                {expandedMatch === match.internship._id ? (
                                                    <ChevronUp className="w-4 h-4 ml-1" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 ml-1" />
                                                )}
                                            </button>

                                            {match.status === 'Applied' ? (
                                                <div className="px-5 py-2 bg-green-50 text-green-600 text-sm font-bold rounded-xl flex items-center gap-2 border border-green-100">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Applied
                                                </div>
                                            ) : (
                                                <Link
                                                    href={`/internships/${match.internship._id}`}
                                                    className="px-5 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-md flex items-center gap-2"
                                                >
                                                    Apply Now
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expansion Panel for Engine Traceability */}
                                    {expandedMatch === match.internship._id && (
                                        <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-t border-indigo-100/50 p-6">
                                            <h4 className="text-xs font-black text-indigo-800/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                Engine Traceability Output
                                                <div className="flex-1 h-px bg-indigo-200/50"></div>
                                            </h4>

                                            <div className="space-y-4">
                                                {/* Summary Paragraph */}
                                                <div className="bg-white/80 p-5 rounded-2xl border border-indigo-100 shadow-sm mb-6">
                                                    <p className="text-gray-800 font-bold leading-relaxed">
                                                        {match.summary || "Profile meets baseline internship requirements. Enhance your profile with specific skills to unlock detailed compatibility metrics."}
                                                    </p>
                                                </div>

                                                <div className="space-y-3">
                                                    {match.reasons && match.reasons.length > 0 ? (
                                                        match.reasons.map((reason, idx) => (
                                                            <div key={idx} className="flex items-start gap-3 bg-white/60 p-3 rounded-lg border border-white shadow-sm">
                                                                <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-700 leading-snug">{reason}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="flex items-start gap-3 bg-white/60 p-3 rounded-lg border border-white shadow-sm">
                                                            <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700 leading-snug">No specific rule traces detected. Match based on aggregate profile score.</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
