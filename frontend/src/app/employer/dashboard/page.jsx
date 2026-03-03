'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Plus, Users, FileText, CheckCircle2, MessageSquare,
  ChevronDown, TrendingUp, Briefcase, Eye, Clock, Calendar,
  Download, Activity, Zap, Star, Search, Edit, Trash2,
  Power, Filter, Loader2, AlertTriangle, ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/context/AuthContext';

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
      const token = Cookies.get('token') || localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch postings, skill analytics, and notifications in parallel
      const [postingsRes, skillsRes, notifsRes] = await Promise.allSettled([
        axios.get('/api/internships/my-postings'),
        axios.get('/api/internships/skill-demands'),
        axios.get('http://localhost:5001/api/notifications', config),
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

      // Fetch best matched candidates using matching engine
      if (internships.length > 0) {
        try {
          const matchRes = await axios.post('http://localhost:5001/api/matching/students', {
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

  const toggleStatus = async (id) => {
    try {
      const resp = await axios.patch(`/api/internships/${id}/status`);
      if (resp.data.success) {
        setApiInternships(prev => prev.map(i => i._id === id ? { ...i, status: resp.data.data.status } : i));
      }
    } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently delete this internship?')) {
      try {
        await axios.delete(`/api/internships/${id}`);
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const statCards = [
    { label: 'Internships Posted', value: stats.internships, icon: Briefcase, gradient: 'from-indigo-500 to-violet-600' },
    { label: 'Total Applicants', value: stats.applicants, icon: Users, gradient: 'from-emerald-400 to-teal-500' },
    { label: 'Skill Matches', value: stats.skillMatches, icon: CheckCircle2, gradient: 'from-amber-400 to-orange-500' },
    { label: 'Interviews Scheduled', value: stats.interviews, icon: Calendar, gradient: 'from-sky-400 to-blue-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Loading Dashboard…</p>
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
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Welcome back, {user?.name?.split(' ')[0] || 'Employer'}
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your internship postings today</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-sm text-gray-500">
            <Clock className="w-4 h-4" /> Last Activity: Just now
          </div>
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
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Download className="w-4 h-4" /> Export Report
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
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-gray-900 relative z-10">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Skill Demand vs Supply */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      >
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Skill Demand vs Supply</h2>
          <p className="text-sm text-gray-500 mt-1">Comparison of required skills in your postings vs available candidates</p>
        </div>
        <div className="space-y-5">
          {displaySkillAnalytics.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Post an internship to see skill analytics.</div>
          ) : displaySkillAnalytics.map((skill, idx) => {
            const maxVal = Math.max(...displaySkillAnalytics.map(s => Math.max(s.requested || 0, s.available || 0)), 1);
            const reqPct = ((skill.requested || 0) / maxVal) * 100;
            const avlPct = ((skill.available || 0) / maxVal) * 100;
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{skill.skill}</h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getScoreColor(skill.matchPercent || 0)}`}>
                    {skill.matchPercent || 0}% Match
                  </span>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Required</span><span className="text-xs font-bold">{skill.requested}</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${reqPct}%` }} /></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Available</span><span className="text-xs font-bold">{skill.available}</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${avlPct}%` }} /></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Best Matches + Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Matches */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6"
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1"><Star className="w-5 h-5 text-purple-600" /><h2 className="text-lg font-bold text-gray-900">Best Matches for You</h2></div>
              <p className="text-sm text-gray-500">Top candidates from the matching engine based on skill alignment</p>
            </div>
            <div className="space-y-4">
              {topCandidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">No matched candidates yet. Create a posting to get matches.</div>
              ) : topCandidates.map((c, idx) => (
                <div key={c.studentId || idx} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.studentName || 'user'}`}
                      name={c.studentName || 'Candidate'}
                      size="lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{c.studentName || 'Unknown Student'}</h3>
                          <p className="text-xs text-gray-500">{c.fieldOfStudy || 'Student'} • GPA: {c.gpa || 'N/A'}</p>
                        </div>
                        <span className={`text-sm font-black px-3 py-1.5 rounded-full border ${getScoreColor(c.finalScore || 0)}`}>
                          {Math.round(c.finalScore || 0)}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(c.matchedSkills || []).slice(0, 4).map((skill, si) => (
                          <span key={si} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md border border-indigo-100">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <Link href={`/students/${c.studentId}`} className="flex-1">
                      <button className="w-full py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">View Profile</button>
                    </Link>
                    <Link href="/employer/messages" className="flex-1">
                      <button className="w-full py-2 text-sm font-bold border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">Message</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No recent activity to show.</div>
            ) : recentActivity.map((item, idx) => (
              <div key={item._id || idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-full bg-indigo-50 text-indigo-600">
                    <Activity className="w-4 h-4" />
                  </div>
                  {idx < recentActivity.length - 1 && <div className="w-0.5 h-6 bg-gray-200 mt-2" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <h4 className="text-sm font-bold text-gray-900">{item.type?.replace(/_/g, ' ') || 'Activity'}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.message || 'System event'}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Live Postings Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Live Postings</h2>
              <p className="text-sm text-gray-500 mt-1">{filteredPostings.length} of {livePostings.length} positions</p>
            </div>
            <Link href="/employer/internships/create">
              <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all">
                <Plus className="w-4 h-4" /> Post New Role
              </button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Search positions…" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white cursor-pointer">
                <option>All</option><option>Hiring</option><option>Reviewing</option><option>Closed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {filteredPostings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-6 font-bold text-gray-500 text-xs uppercase tracking-wider">Position</th>
                  <th className="text-left py-3 px-6 font-bold text-gray-500 text-xs uppercase tracking-wider">Candidates</th>
                  <th className="text-left py-3 px-6 font-bold text-gray-500 text-xs uppercase tracking-wider">Views</th>
                  <th className="text-left py-3 px-6 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-6 font-bold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPostings.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{p.position}</p>
                          <p className="text-xs text-indigo-500 font-medium">Expires {p.expiry}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6"><div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /><span className="font-bold">{p.candidates}</span></div></td>
                    <td className="py-3 px-6"><div className="flex items-center gap-2"><Eye className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{p.views}</span></div></td>
                    <td className="py-3 px-6">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${p.status === 'Hiring' ? 'bg-emerald-100 text-emerald-700' : p.status === 'Closed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => toggleStatus(p.id)} className="w-7 h-7 flex items-center justify-center rounded-lg border bg-gray-50 hover:bg-amber-50 text-gray-500 hover:text-amber-600 transition-all" title="Toggle Status"><Power className="w-3.5 h-3.5" /></button>
                        <Link href={`/employer/internships/${p.id}/edit`}><button className="w-7 h-7 flex items-center justify-center rounded-lg border bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-3.5 h-3.5" /></button></Link>
                        <button onClick={() => handleDelete(p.id)} className="w-7 h-7 flex items-center justify-center rounded-lg border bg-gray-50 hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No positions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
