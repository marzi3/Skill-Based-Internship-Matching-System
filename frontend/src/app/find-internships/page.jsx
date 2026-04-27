'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/services/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
    Search,
    MapPin,
    Building2,
    Bookmark,
    ChevronRight,
    Filter,
    Loader2,
    Briefcase,
    SlidersHorizontal,
    ArrowLeft,
    LogOut,
} from 'lucide-react';
import SearchBar from '@/components/internship/SearchBar';
import Avatar from '@/components/common/Avatar';

function FindInternshipsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { user, loading: authLoading, logout, getRoleDashboard } = useAuth();
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');
    const [filters, setFilters] = useState({
        jobType: searchParams.get('jobType') ? searchParams.get('jobType').split(',') : [],
        industry: searchParams.get('industry') ? searchParams.get('industry').split(',') : [],
    });
    const [sort, setSort] = useState(searchParams.get('sort') || 'Newest');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api/v1';

    const fetchInternships = async (query = searchQuery, location = locationQuery) => {
        try {
            setLoading(true);

            if (sort === 'Best Matches' && user && user.role === 'student' && !query) {
                // Use authenticated apiClient for personalized matches
                try {
                    const res = await axios.get(`/matching/best-matches`);
                    if (res.data.success && res.data.data) {
                        const matchedInternships = res.data.data.map(m => ({
                            ...m.internship,
                            matchScore: m.score || m.matchScore
                        }));
                        setInternships(matchedInternships);
                        setLoading(false);
                        return;
                    }
                } catch {
                    // Fall through to generic fetch if auth fails
                }
            }

            const params = {};
            if (query) params.q = query;
            if (location) params.location = location;
            if (filters.jobType.length > 0) params.workEnvironment = filters.jobType.join(',');
            if (filters.industry.length > 0) params.domain = filters.industry.join(',');
            if (sort && sort !== 'Best Matches') params.sort = sort;
            if (sort === 'Best Matches') params.sort = 'Best Matches';

            const res = await axios.get(`/internships`, { params });
            setInternships(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch internships:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateURL = (query = searchQuery, location = locationQuery) => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (location) params.set('location', location);
        if (filters.jobType.length > 0) params.set('jobType', filters.jobType.join(','));
        if (filters.industry.length > 0) params.set('industry', filters.industry.join(','));
        if (sort !== 'Best Matches') params.set('sort', sort);

        router.push(`/find-internships?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        // Only fetch on filters or sort change, manual search handles query and location
        fetchInternships();
    }, [filters, sort]);

    // Keep URL in sync without triggering full re-renders if possible
    useEffect(() => {
        updateURL();
    }, [searchQuery, locationQuery, filters, sort]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleLocationChange = (e) => {
        setLocationQuery(e.target.value);
    };

    const toggleFilter = (category, value) => {
        setFilters((prev) => {
            const current = prev[category];
            const updated = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
    };

    // Filters are now handled server-side
    const filtered = internships;

    const jobTypeOptions = ['Remote', 'On-site', 'Hybrid'];
    const industryOptions = [
        'Software Engineering', 'Data Science', 'Cybersecurity', 'Design', 'Finance'
    ];

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/images/logo.png" alt="InternMatch" className="h-10 w-auto object-contain" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:block">
                            InternMatch
                        </span>
                    </Link>
                    <div className="flex items-center gap-4 sm:gap-6">
                        {authLoading ? (
                            <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse" />
                        ) : user ? (
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-bold text-gray-900">{user.name}</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{user.role}</span>
                                </div>
                                <Avatar
                                    src={user.profilePicture}
                                    name={user.name}
                                    size="md"
                                    className="rounded-xl shadow-sm"
                                />
                                <button
                                    onClick={logout}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 sm:gap-6">
                                <Link href="/employers" className="text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                                    For Employers
                                </Link>
                                <Link href="/login" className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── Back Navigation ── */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
                    <button
                        onClick={() => router.push(user ? getRoleDashboard(user.role) : '/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">{user ? 'Back to Dashboard' : 'Back to Home'}</span>
                    </button>
                </div>
            </div>

            {/* ── Hero / Search Section ── */}
            <section className="bg-gradient-to-b from-indigo-50/40 to-white pt-20 pb-16">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[1.05] mb-6">
                        Find your next{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] italic font-medium tracking-normal">
                            big opportunity.
                        </span>
                    </h1>


                    {/* Search Bar Container */}
                    <form 
                        onSubmit={(e) => { e.preventDefault(); fetchInternships(searchQuery, locationQuery); }}
                        className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-2 flex flex-col sm:flex-row items-center gap-2 max-w-4xl mx-auto"
                    >
                        <div className="flex-[1.5] w-full">
                            <SearchBar 
                                placeholder="Job title, keywords, or company"
                                initialValue={searchQuery}
                                onSearch={handleSearch}
                                isLoading={loading}
                                className="!border-none !shadow-none !ring-0 !text-slate-900 !font-black !uppercase !tracking-widest"
                                showSubmitButton={false}
                            />
                        </div>
                        <div className="hidden sm:flex items-center gap-4 border-l border-gray-100 flex-1 px-6">
                            <MapPin className="w-5 h-5 text-gray-500 shrink-0" />
                            <input
                                type="text"
                                placeholder="Location or Remote"
                                value={locationQuery}
                                onChange={handleLocationChange}
                                className="w-full py-4 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none font-bold bg-transparent appearance-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-200/50 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search size={16} /> Search</>}
                        </button>
                    </form>
                </div>
            </section>

            {/* ── Main Content ── */}
            <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
                <div className="flex gap-10">

                    {/* Filters Sidebar */}
                    <aside className="w-64 shrink-0 hidden lg:block">
                        <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                                <Filter className="w-5 h-5 text-gray-500" />
                            </div>

                            {/* Work Environment Section */}
                            <div className="group/filter">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full"></span>
                                    Work Environment
                                </h4>
                                <div className="space-y-4">
                                    {jobTypeOptions.map((type) => (
                                        <label key={type} className="flex items-center gap-4 cursor-pointer group/label">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.jobType.includes(type)}
                                                    onChange={() => toggleFilter('jobType', type)}
                                                    className="w-5 h-5 rounded-lg border-2 border-slate-300 text-[#6366F1] focus:ring-[#6366F1] transition-all cursor-pointer bg-white checked:border-[#6366F1]"
                                                />
                                            </div>
                                            <span className="text-[12px] font-black uppercase tracking-widest text-slate-500 group-hover/label:text-slate-900 group-data-[checked=true]:text-slate-900 transition-colors">
                                                {type}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Industry Domain Section */}
                            <div className="pt-8 border-t border-slate-200/60">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full"></span>
                                    Industry Domain
                                </h4>
                                <div className="space-y-4">
                                    {industryOptions.map((ind) => (
                                        <label key={ind} className="flex items-center gap-4 cursor-pointer group/label">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.industry.includes(ind)}
                                                    onChange={() => toggleFilter('industry', ind)}
                                                    className="w-5 h-5 rounded-lg border-2 border-slate-300 text-[#6366F1] focus:ring-[#6366F1] transition-all cursor-pointer bg-white checked:border-[#6366F1]"
                                                />
                                            </div>
                                            <span className="text-[12px] font-black uppercase tracking-widest text-slate-500 group-hover/label:text-slate-900 transition-colors">
                                                {ind}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Active Filters count indicator or clear button can go here */}
                        </div>
                    </aside>

                    {/* Results */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Recommended for you</h2>
                                <span className="text-sm text-gray-500 font-medium">
                                    Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                                <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] px-3">Sort by:</span>
                                <div className="relative">
                                    <select
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                        className="bg-white text-slate-900 text-[12px] font-black uppercase tracking-widest pl-4 pr-10 py-2.5 rounded-xl border border-slate-100 shadow-sm cursor-pointer outline-none appearance-none hover:border-[#6366F1] focus:ring-2 focus:ring-indigo-500/20 transition-all min-w-[180px]"
                                    >
                                        {['Newest', 'Best Matches', 'Oldest', 'Salary', 'Deadline Soon'].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <Filter className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                <p className="text-gray-500 text-sm font-medium">Loading internships…</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="w-8 h-8 text-gray-500" />
                                </div>
                                <p className="text-lg font-bold text-gray-900 mb-2">No internships found</p>
                                <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filtered.map((job, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={job._id}
                                        className="bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 p-6 group"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                 {/* Company Icon */}
                                                 <Link href={`/employers/${job.employer?._id || job.employerId}`} className="shrink-0 group">
                                                     <Avatar 
                                                         src={job.employer?.profilePicture} 
                                                         name={job.employer?.companyName} 
                                                         size="lg"
                                                         className="rounded-xl border border-gray-100 group-hover:border-indigo-200 transition-all shadow-sm"
                                                     />
                                                 </Link>

                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                                                        {job.positionTitle}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                        <Link href={`/employers/${job.employer?._id || job.employerId}`} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                                            <Building2 className="w-3.5 h-3.5" />
                                                            {job.employer?.companyName || job.company || 'Company'}
                                                        </Link>
                                                        <span className="text-slate-200">•</span>
                                                        <span className="flex items-center gap-1.5 text-slate-900">
                                                            <MapPin className="w-3.5 h-3.5 text-[#6366F1]" />
                                                            {job.location || job.workEnvironment || 'Remote'}
                                                        </span>
                                                    </div>

                                                    {/* Skills Tags */}
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {job.requiredSkills?.slice(0, 4).map((skill) => {
                                                            const name = typeof skill === 'string' ? skill : skill.name;
                                                            return (
                                                                <span
                                                                    key={name}
                                                                    className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold border border-indigo-100"
                                                                >
                                                                    {name}
                                                                </span>
                                                            );
                                                        })}
                                                        {job.requiredSkills?.length > 4 && (
                                                            <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-semibold">
                                                                +{job.requiredSkills.length - 4}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right actions */}
                                            <div className="flex flex-col items-end gap-3 shrink-0">
                                                <Link
                                                    href={`/internships/${job._id}?from=search`}
                                                    className="flex items-center gap-3 bg-[#6366F1] text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-indigo-200/50 hover:bg-[#4F46E5] hover:shadow-xl hover:shadow-indigo-300/60 transition-all active:scale-95"
                                                >
                                                    Apply <ChevronRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function FindInternshipsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        }>
            <FindInternshipsContent />
        </Suspense>
    );
}
