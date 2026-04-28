'use client';

// Student dashboard Page

import { useState, useEffect, useRef } from 'react';
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
    Sparkles,
    ArrowRight,
    Rocket,
    ShieldCheck,
    Target,
    Sun,
    Moon,
    Sunrise
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
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Returns a time-aware greeting with icon and color, matching the employer dashboard style.
 * @returns {{ text: string, icon: import('lucide-react').LucideIcon, color: string }}
 */
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sunrise, color: 'text-amber-500' };
    if (hour < 18) return { text: 'Good afternoon', icon: Sun, color: 'text-orange-500' };
    return { text: 'Good evening', icon: Moon, color: 'text-indigo-400' };
};

/**
 * Animated counter hook. Counts from 0 to `end` over `duration` ms.
 * Uses requestAnimationFrame for smooth, non-blocking animation.
 */
const useAnimatedCounter = (end, duration = 1200) => {
    const [count, setCount] = useState(0);
    const prevEnd = useRef(end);

    useEffect(() => {
        prevEnd.current = end;
        if (end === 0) { setCount(0); return; }

        let startTime = null;
        let frameId;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out cubic for a satisfying deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) {
                frameId = requestAnimationFrame(animate);
            }
        };
        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [end, duration]);

    return count;
};

/**
 * SVG circular progress ring for the "Profile Strength" widget.
 * Draws an animated arc from 0% to `percentage`.
 */
const ProfileStrengthRing = ({ percentage = 0 }) => {
    const radius = 54;
    const stroke = 8;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const getColor = (pct) => {
        if (pct >= 80) return { stroke: '#10b981', glow: 'rgba(16,185,129,0.35)', label: 'Excellent' };
        if (pct >= 50) return { stroke: '#6366f1', glow: 'rgba(99,102,241,0.35)', label: 'Good' };
        return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.35)', label: 'Needs work' };
    };

    const { stroke: ringColor, glow, label } = getColor(percentage);

    return (
        <div className="relative flex items-center justify-center w-[140px] h-[140px]">
            <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                {/* Background ring */}
                <circle
                    cx="70" cy="70" r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={stroke}
                    className="text-gray-100"
                />
                {/* Progress ring */}
                <motion.circle
                    cx="70" cy="70" r={radius}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                    style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-900">{percentage}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">{label}</span>
            </div>
        </div>
    );
};

/**
 * Framer Motion stagger container and item variants.
 * Why: Creates a cascading "reveal" effect for sections and list items.
 */
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.15 }
    }
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
};

const SkillGapWidget = ({ matches = [] }) => {
    const allRequiredSkills = matches.flatMap(m => m.internship?.requiredSkills || []);
    
    const skillFrequency = {};
    allRequiredSkills.forEach(skill => {
        if (!skill) return;
        skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    });

    const sortedDemandedSkills = Object.entries(skillFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    if (sortedDemandedSkills.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-md bg-white/80 border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/40 space-y-6 relative overflow-hidden"
        >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <Target className="text-indigo-600 w-6 h-6 animate-pulse" />
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider">Interactive Skill Analysis</h2>
                </div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full">Live Demand</span>
            </div>

            <p className="text-xs font-medium text-slate-500 max-w-xl relative z-10">
                Analysis of top internship opportunities indicates heavy concentration around these specific tech capabilities. Master them to maximize your optimization tiers.
            </p>

            <div className="grid gap-4 relative z-10 sm:grid-cols-2 lg:grid-cols-3">
                {sortedDemandedSkills.map(([skill, count], index) => {
                    const demandPercent = Math.min(100, Math.max(30, count * 20 + (5 - index) * 10));
                    
                    return (
                        <motion.div 
                            key={skill}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 relative group transition-all hover:shadow-md hover:bg-white"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-black text-slate-800 uppercase tracking-widest text-xs">{skill}</span>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">High Alignment</span>
                            </div>
                            
                            <div className="w-full bg-slate-200/60 rounded-full h-2 relative overflow-hidden mt-3">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${demandPercent}%` }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 + index * 0.1 }}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full group-hover:from-indigo-600 group-hover:to-purple-600"
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

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

    const animatedApps = useAnimatedCounter(stats.applicationsCount);
    const animatedMatches = useAnimatedCounter(stats.skillMatches);
    const animatedVerifications = useAnimatedCounter(stats.verificationPoints);

    /**
     * Profile strength is derived from verification points.
     * Capped at 100 to prevent overflow in the ring widget.
     */
    const profileStrength = Math.min(100, stats.verificationPoints);

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
                    setMatches(matchesRes.data.data?.slice(0, 6) || []);
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

    /** Smart subtitle based on live data */
    const getSmartSubtitle = () => {
        if (loading) return 'Loading your workspace...';
        const highMatches = matches.filter(m => m.score >= 80).length;
        if (highMatches > 0) return `You have ${highMatches} match${highMatches > 1 ? 'es' : ''} above 80%. Let's secure that interview!`;
        if (stats.applicationsCount > 0) return `${stats.applicationsCount} active application${stats.applicationsCount > 1 ? 's' : ''} in progress. Keep going!`;
        return 'Complete your profile and start discovering opportunities.';
    };

    return (
        <>
            {showTour && <OnboardingTour role="student" onComplete={handleTourComplete} />}

                {/* Header with time-aware greeting — matches employer dashboard style */}
                {(() => {
                    const greeting = getGreeting();
                    const GreetingIcon = greeting.icon;
                    return (
                        <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 md:py-6 flex items-center justify-between sticky top-0 z-50 transition-all shadow-sm">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <GreetingIcon className={`w-7 h-7 md:w-8 md:h-8 ${greeting.color}`} strokeWidth={2.5} />
                                    <h1 className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                                        {greeting.text}, {user?.name?.split(' ')[0] || 'Student'}
                                    </h1>
                                </div>
                                <p className="text-gray-500 font-medium text-xs md:text-sm">{getSmartSubtitle()}</p>
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
                    );
                })()}

                <div className="relative z-0 p-4 md:p-8 space-y-6 md:space-y-8">
                    {/* Stats Grid + Profile Strength */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
                    >
                        {/* Active Applications Card */}
                        <motion.div variants={staggerItem}>
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-5 md:p-6 rounded-2xl relative overflow-hidden group shadow-lg shadow-indigo-500/20 h-full">
                                <div className="relative z-10 space-y-3 md:space-y-4">
                                    <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl w-fit"><Briefcase className="w-5 h-5 md:w-6 md:h-6" /></div>
                                    <div>
                                        <h3 className="text-indigo-100 font-bold uppercase text-[9px] md:text-[10px] tracking-wider md:tracking-widest">Active Apps</h3>
                                        <p className="text-3xl md:text-4xl font-black tabular-nums">{animatedApps}</p>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:scale-110 group-hover:opacity-15 transition-all duration-500">
                                    <Briefcase className="w-20 h-20 md:w-[100px] md:h-[100px]" />
                                </div>
                            </div>
                        </motion.div>

                        {/* AI Matches Card */}
                        <motion.div variants={staggerItem}>
                            <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3 md:space-y-4 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 h-full">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit"><Zap className="w-5 h-5 md:w-6 md:h-6" /></div>
                                <div>
                                    <h3 className="text-gray-500 font-bold uppercase text-[9px] md:text-[10px] tracking-wider md:tracking-widest">A.I. Matches</h3>
                                    <p className="text-3xl md:text-4xl font-black text-gray-900 items-baseline flex flex-wrap gap-1 md:gap-2 tabular-nums">
                                        {animatedMatches}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Verifications Card */}
                        <motion.div variants={staggerItem}>
                            <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3 md:space-y-4 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 h-full">
                                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit"><Star className="w-5 h-5 md:w-6 md:h-6" /></div>
                                <div>
                                    <h3 className="text-gray-500 font-bold uppercase text-[9px] md:text-[10px] tracking-wider md:tracking-widest">Verifications</h3>
                                    <p className="text-3xl md:text-4xl font-black text-gray-900 tabular-nums">{animatedVerifications}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Profile Strength Ring Card */}
                        <motion.div variants={staggerItem}>
                            <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center hover:shadow-lg transition-all duration-300 h-full">
                                <ProfileStrengthRing percentage={profileStrength} />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-3">Match Readiness</p>
                                {profileStrength < 80 && (
                                    <Link
                                        href="/student-profile"
                                        className="mt-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                    >
                                        Boost Profile <ArrowRight size={10} />
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Upcoming Interviews Protocol (if any) */}
                    <AnimatePresence>
                        {upcomingInterviews.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-4"
                            >
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
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                            ) : sortedApplications.length > 0 ? (
                                sortedApplications.slice(0, 5).map((app, idx) => (
                                    <motion.div
                                        key={app._id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 + idx * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
                                        onClick={() => router.push(`/applications/${app._id}`)}
                                        className="cursor-pointer"
                                    >
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
                                    </motion.div>
                                ))
                            ) : (
                                /* Premium empty state */
                                <div className="py-16 bg-white rounded-3xl border border-dashed border-gray-200 text-center shadow-sm">
                                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner border border-indigo-100/50">
                                        <Rocket size={32} className="text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">No applications yet</h3>
                                    <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto mb-6">Start your journey by exploring internships matched to your skills.</p>
                                    <Link
                                        href="/matches"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 group"
                                    >
                                        Explore Matches <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Matches Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Zap className="text-primary-600" size={20} fill="currentColor" /> Recommended for You
                            </h2>
                            <Link href="/matches" className="text-sm font-bold text-primary-600 hover:underline">View All Matches</Link>
                        </div>

                        <RecommendedInternships matches={matches} />
                    </motion.div>

                    {/* Interactive Skill Gap Analysis Widget */}
                    <SkillGapWidget matches={matches} />
                </div>
        </>
    );
}
