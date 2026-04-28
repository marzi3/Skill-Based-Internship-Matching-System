'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import {
  Plus, Users, FileText, CheckCircle2, MessageSquare,
  ChevronDown, TrendingUp, TrendingDown, Briefcase, Eye, Clock, Calendar,
  Download, Activity, Zap, Star, Search, Edit, Trash2,
  Power, Filter, Loader2, AlertTriangle, ArrowUpRight, Sparkles,
  Sun, Moon, Sunrise
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/context/AuthContext';
import RecommendedCandidates from '@/components/matching/RecommendedCandidates';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend 
} from 'recharts';
import OnboardingTour from '@/components/OnboardingTour';

/**
 * Employer Dashboard — main overview page.
 * Fetches internships, matching engine data, recent activity, and skill demand analytics.
 */
const EmployerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiInternships, setApiInternships] = useState([]);
  const [skillAnalytics, setSkillAnalytics] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [matchStats, setMatchStats] = useState([]);
  const [stats, setStats] = useState({
    internships: 0,
    applicants: 0,
    skillMatches: 0,
    interviews: 0,
  });

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [userDropdown, setUserDropdown] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenEmployerTour');
    if (!hasSeen && user) {
        setShowTour(true);
    }
  }, [user]);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('hasSeenEmployerTour', 'true');
  };

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  /** Fetch all dashboard data concurrently. */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch postings, skill analytics, and notifications in parallel
      const [postingsRes, skillsRes, notifsRes] = await Promise.allSettled([
        axios.get('/internships/my-postings'),
        axios.get('/internships/skill-demands'),
        axios.get('/notifications'),
      ]);

      const internships = postingsRes.status === 'fulfilled' ? (postingsRes.value.data.data || []) : [];
      setApiInternships(internships);
      setSkillAnalytics(skillsRes.status === 'fulfilled' ? (skillsRes.value.data.data || []) : []);

      // Build stats
      const totalApplicants = internships.reduce((sum, i) => sum + (i.applicants?.length || 0), 0);
      setStats({
        internships: internships.length,
        applicants: totalApplicants,
        skillMatches: 0,
        interviews: internships.reduce((sum, i) => sum + (i.interviews || 0), 0),
      });

      // Build recent activity from notifications
      if (notifsRes.status === 'fulfilled') {
        const notifs = notifsRes.value.data.data || notifsRes.value.data.notifications || [];
        setRecentActivity(notifs.slice(0, 5));
      }

      // Fetch analytics
      try {
        const analyticsRes = await axios.get('/analytics/employer/matches');
        if (analyticsRes.data.success) {
          setMatchStats(analyticsRes.data.data);
        }
      } catch (e) { console.error('Analytics failed', e); }

      // Fetch best matched candidates using matching engine
      if (internships.length > 0) {
        try {
          const matchRes = await axios.post('/matching/students', {
            internshipId: internships[0]._id,
            limit: 5,
          });
          if (matchRes.data.success) {
            const candidates = matchRes.data.candidates || [];
            setTopCandidates(candidates);
            // Update skill match count from matching results
            const matchedCount = candidates.filter(c => c.finalScore >= 50).length;
            setStats(prev => ({ ...prev, skillMatches: matchedCount }));
          }
        } catch (matchErr) {
          console.error('Matching engine call failed:', matchErr);
        }
      }
    } catch (err) {
      console.error('Dashboard data fetch failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const resp = await axios.patch(`/internships/${id}/status`, { status: newStatus });
      if (resp.data.success) {
        setApiInternships(prev => prev.map(i => i._id === id ? { ...i, status: resp.data.data.status } : i));
      }
    } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently delete this internship?')) {
      try {
        await axios.delete(`/internships/${id}`);
        setApiInternships(prev => prev.filter(i => i._id !== id));
      } catch { /* silent */ }
    }
  };

  // Derived data
  const livePostings = apiInternships.map(i => ({
    id: i._id || i.id,
    position: i.positionTitle || 'Untitled',
    candidates: i.applicants?.length || 0,
    status: i.status || 'Hiring',
    expiry: i.expiryDate ? new Date(i.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not Set',
    views: i.views || 0,
  }));

  const filteredPostings = livePostings.filter(p => {
    const matchSearch = p.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const displaySkillAnalytics = skillAnalytics.length > 0 ? skillAnalytics : [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sunrise, color: 'text-amber-500' };
    if (hour < 18) return { text: 'Good afternoon', icon: Sun, color: 'text-orange-500' };
    return { text: 'Good evening', icon: Moon, color: 'text-indigo-400' };
  };
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const statCards = [
    { label: 'Internships Posted', value: stats.internships, icon: Briefcase, gradient: 'from-indigo-500 to-violet-600', trend: '+12%', trendLabel: 'this week', isPositive: true },
    { label: 'Total Applicants', value: stats.applicants, icon: Users, gradient: 'from-emerald-400 to-teal-500', trend: '+24%', trendLabel: 'this month', isPositive: true },
    { label: 'Skill Matches', value: stats.skillMatches, icon: CheckCircle2, gradient: 'from-amber-400 to-orange-500', trend: '+8%', trendLabel: 'vs last week', isPositive: true },
    { label: 'Interviews Scheduled', value: stats.interviews, icon: Calendar, gradient: 'from-sky-400 to-blue-500', trend: '-2%', trendLabel: 'this week', isPositive: false },
  ];

  if (loading || !hasMounted) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
            <div className="space-y-3">
              <div className="h-10 w-72 bg-slate-200 rounded-xl"></div>
              <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="h-12 w-48 bg-slate-200 rounded-2xl hidden sm:block"></div>
        </div>
        {/* Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-slate-200 rounded-3xl"></div>)}
        </div>
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="h-[320px] bg-slate-200 rounded-3xl"></div>
            <div className="h-[320px] bg-slate-200 rounded-3xl"></div>
        </div>
        {/* Bottom Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[400px] bg-slate-200 rounded-3xl"></div>
            <div className="h-[400px] bg-slate-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-800 mb-2">Failed to Load Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative pb-12">
      {showTour && <OnboardingTour role="employer" onComplete={handleTourComplete} />}
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <GreetingIcon className={`w-8 h-8 ${greeting.color}`} strokeWidth={2.5} />
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              {greeting.text}, {user?.name?.split(' ')[0] || 'Employer'}
            </h1>
          </div>
          <p className="text-gray-500 font-medium">Here's a snapshot of your hiring pipeline today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm text-sm text-gray-500 font-bold">
            <Clock className="w-4 h-4 text-indigo-500" /> Live Data Sync
          </div>
          {typeof window !== 'undefined' && !localStorage.getItem('hasSeenEmployerTour') && (
            <button 
                onClick={() => setShowTour(true)}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors shadow-sm"
            >
                <Sparkles className="w-4 h-4" /> System Tour
            </button>
          )}
          <button
            onClick={() => {
              let csv = "Metric,Value\n";
              csv += `Internships Posted,${stats.internships}\n`;
              csv += `Total Applicants,${stats.applicants}\n`;
              csv += `Skill Matches,${stats.skillMatches}\n`;
              const el = document.createElement('a');
              el.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
              el.setAttribute('download', 'employer-dashboard-report.csv');
              el.style.display = 'none';
              document.body.appendChild(el);
              el.click();
              document.body.removeChild(el);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            title="Downloads a CSV file with your dashboard statistics"
          >
            <Download className="w-4 h-4" /> Export Stats
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-tight">{stat.label}</span>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex justify-between items-end relative z-10 mt-2">
                <p className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${stat.isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                   {stat.isPositive ? <TrendingUp size={12} strokeWidth={3}/> : <TrendingDown size={12} strokeWidth={3}/>}
                   {stat.trend}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics — compact side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Market Alignment</h2>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Skill demand vs talent supply</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm" /><span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Demand</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" /><span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Supply</span></div>
            </div>
          </div>
          <div className="h-[260px] w-full relative">
            {displaySkillAnalytics.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Activity className="w-8 h-8 text-gray-400 mb-2 opacity-50" />
                  <p className="text-xs font-bold text-gray-500">Post an internship to unlock analytics.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" margin={{ top: 10, right: 30, bottom: 10, left: 30 }} data={displaySkillAnalytics.map(s => ({ subject: s.skill, A: s.requested || 0, B: s.available || 0, fullMark: Math.max(s.requested || 0, s.available || 0) + 5 }))}>
                  <PolarGrid stroke="#f3f4f6" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} />
                  <Radar name="Demand" dataKey="A" stroke="#4f46e5" strokeWidth={2} fill="#4f46e5" fillOpacity={0.6} />
                  <Radar name="Supply" dataKey="B" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {matchStats.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-900">Match Quality Distribution</h2>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Candidates across match tiers</p>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matchStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="tier" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                    {matchStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#10b981', '#6366f1'][index % 4]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>

      {/* Best Matches + Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Matches */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1"><Star className="w-5 h-5 text-indigo-600" /><h2 className="text-lg font-black text-gray-900 tracking-tight">Best Matches for You</h2></div>
                <p className="text-sm text-gray-500 font-medium">Top candidates based on skill alignment</p>
              </div>
              {topCandidates.length > 3 && (
                <Link href="/employer/candidates?rapidMatch=true" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-100">
                  View All <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="space-y-4">
              {topCandidates.length > 0 ? (
                <RecommendedCandidates candidates={topCandidates.slice(0, 3)} />
              ) : (
                <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60">
                    <Sparkles className="w-8 h-8 text-indigo-300 mx-auto mb-3" />
                    <p className="text-indigo-900 font-bold">No matches yet. We're scanning the talent pool.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                    <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-500">All caught up.</p>
                <p className="text-xs text-gray-400 mt-1">No new alerts to show right now.</p>
              </div>
            ) : recentActivity.map((item, idx) => (
              <div key={item._id || idx} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <Activity className="w-4 h-4" />
                  </div>
                  {idx < recentActivity.length - 1 && <div className="w-0.5 h-full bg-gray-100 mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <h4 className="text-sm font-bold text-gray-900">{item.type?.replace(/_/g, ' ') || 'Activity'}</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">{item.message || 'System event'}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Live Postings Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Live Postings</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">{Math.min(filteredPostings.length, 5)} of {livePostings.length} positions</p>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Segmented Control */}
                <div className="flex items-center p-1 bg-gray-100/80 rounded-xl">
                    {['All', 'Hiring', 'Reviewing', 'Closed'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setStatusFilter(tab)} 
                            className={`relative px-5 py-2 text-xs font-bold rounded-lg transition-colors z-10 ${statusFilter === tab ? 'text-indigo-700' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {statusFilter === tab && <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200/50 -z-10" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />}
                            {tab}
                        </button>
                    ))}
                </div>

                <Link href="/employer/internships/create">
                <button className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95">
                    <Plus className="w-4 h-4" /> Post New Role
                </button>
                </Link>
            </div>
          </div>
        </div>

        {filteredPostings.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-4 px-6 font-black text-gray-400 text-[10px] uppercase tracking-widest">Position</th>
                    <th className="text-left py-4 px-6 font-black text-gray-400 text-[10px] uppercase tracking-widest">Candidates</th>
                    <th className="text-left py-4 px-6 font-black text-gray-400 text-[10px] uppercase tracking-widest">Views</th>
                    <th className="text-left py-4 px-6 font-black text-gray-400 text-[10px] uppercase tracking-widest">Status</th>
                    <th className="text-right py-4 px-6 font-black text-gray-400 text-[10px] uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPostings.slice(0, 5).map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                            <Briefcase className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-black text-gray-900">{p.position}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">Expires {p.expiry}</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Hover Reveal Candidates */}
                      <td className="py-4 px-6 relative group/tooltip">
                        <div className="flex items-center gap-2 cursor-pointer w-fit border-b border-dashed border-gray-300 pb-0.5">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="font-bold text-gray-900">{p.candidates}</span>
                        </div>
                        {/* Popover */}
                        {p.candidates > 0 && (
                            <div className="absolute left-6 bottom-full mb-3 w-56 bg-gray-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl p-4 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none scale-95 group-hover/tooltip:scale-100 origin-bottom border border-gray-700">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-700 pb-2">Talent Breakdown</p>
                                <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs"><span className="flex items-center gap-1.5 font-bold text-emerald-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> Highly Matched</span><span className="font-mono bg-white/10 px-2 py-0.5 rounded">{Math.floor(p.candidates * 0.4) || 1}</span></div>
                                <div className="flex justify-between items-center text-xs"><span className="flex items-center gap-1.5 font-bold text-amber-400"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"/> Average</span><span className="font-mono bg-white/10 px-2 py-0.5 rounded">{Math.floor(p.candidates * 0.4) || 0}</span></div>
                                <div className="flex justify-between items-center text-xs"><span className="flex items-center gap-1.5 font-bold text-gray-400"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"/> Other</span><span className="font-mono bg-white/10 px-2 py-0.5 rounded">{p.candidates - (Math.floor(p.candidates * 0.4) || 1) - (Math.floor(p.candidates * 0.4) || 0)}</span></div>
                                </div>
                                <div className="absolute -bottom-1.5 left-8 w-3 h-3 bg-gray-900/95 border-b border-r border-gray-700 rotate-45"></div>
                            </div>
                        )}
                      </td>

                      <td className="py-4 px-6"><div className="flex items-center gap-2"><Eye className="w-4 h-4 text-gray-400" /><span className="font-bold text-gray-600">{p.views}</span></div></td>
                      <td className="py-4 px-6">
                        <select
                          value={p.status}
                          onChange={(e) => updateStatus(p.id, e.target.value)}
                          className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-black rounded-lg border cursor-pointer outline-none transition-colors appearance-none pr-6 ${p.status === 'Hiring' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : p.status === 'Closed' ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'}`}
                          style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg stroke="%236b7280" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.4rem center', backgroundSize: '12px' }}
                        >
                          <option value="Hiring">Hiring</option>
                          <option value="Reviewing">Reviewing</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/employer/internships/${p.id}/edit`}><button className="w-8 h-8 flex items-center justify-center rounded-xl border bg-gray-50 hover:bg-indigo-50 border-gray-200 hover:border-indigo-200 text-gray-500 hover:text-indigo-600 transition-all shadow-sm" title="Edit"><Edit className="w-3.5 h-3.5" /></button></Link>
                          <button onClick={() => handleDelete(p.id)} className="w-8 h-8 flex items-center justify-center rounded-xl border bg-gray-50 hover:bg-rose-50 border-gray-200 hover:border-rose-200 text-gray-500 hover:text-rose-600 transition-all shadow-sm" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPostings.length > 5 && (
              <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-center">
                <Link href={`/employer/internships${statusFilter !== 'All' ? `?status=${statusFilter}` : ''}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-200">
                  View All {filteredPostings.length} Postings <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                 <Briefcase className="w-8 h-8 text-gray-300 relative z-10" />
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1">Empty</h3>
            <p className="text-xs text-gray-500 font-medium">No postings found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
