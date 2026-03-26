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

    const { user, logout } = useAuth();
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
            const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            const user = userStr ? JSON.parse(userStr) : null;

            if (sort === 'Best Matches' && user && user.role === 'student' && !query) {
                // Use GET request with authentication header for personalized matches
                const token = localStorage.getItem('token');
                if (token) {
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
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-bold text-gray-900">{user.name}</span>
                                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{user.role}</span>
                                </div>
                                <Avatar
                                    src={user.profilePicture}
                                    name={user.name}
                                    size="md"
                                    className="rounded-xl shadow-sm"
                                />
                                <button
                                    onClick={logout}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
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
                        onClick={() => router.push('/student-dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Dashboard</span>
                    </button>
                </div>
            </div>

            {/* ── Hero / Search Section ── */}
            <section className="bg-gradient-to-b from-indigo-50/40 to-white pt-16 pb-12">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-4">
                        Find your next{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 italic">
                            big opportunity.
                        </span>
                    </h1>
                    <p className="text-gray-500 text-lg mb-10">
                        Discover thousands of verified internships tailored to your unique skill set.
                    </p>

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
                                className="!border-none !shadow-none !ring-0"
                                showSubmitButton={false}
                            />
                        </div>
                        <div className="hidden sm:flex items-center gap-4 border-l border-gray-100 flex-1 px-6">
                            <MapPin className="w-5 h-5 text-gray-300 shrink-0" />
                            <input
                                type="text"
                                placeholder="Location or Remote"
                                value={locationQuery}
                                onChange={handleLocationChange}
                                className="w-full py-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none font-bold bg-transparent appearance-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-200 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search size={18} /> Search</>}
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
                                <Filter className="w-5 h-5 text-gray-400" />
                            </div>

                            {/* Job Type */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Job Type</h4>
                                <div className="space-y-2.5">
                                    {jobTypeOptions.map((type) => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={filters.jobType.includes(type)}
                                                onChange={() => toggleFilter('jobType', type)}
                                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                                {type}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Industry */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Industry</h4>
                                <div className="space-y-2.5">
                                    {industryOptions.map((ind) => (
                                        <label key={ind} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={filters.industry.includes(ind)}
                                                onChange={() => toggleFilter('industry', ind)}
                                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                                {ind}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Results */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Recommended for you</h2>
                                <span className="text-sm text-gray-400 font-medium">
                                    Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">Sort by:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="bg-white border text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none cursor-pointer font-medium border-gray-200 shadow-sm transition-all"
                                >
                                    {['Newest', 'Best Matches', 'Oldest', 'Salary', 'Deadline Soon'].map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                <p className="text-gray-400 text-sm font-medium">Loading internships…</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-lg font-bold text-gray-900 mb-2">No internships found</p>
                                <p className="text-gray-400 text-sm">Try adjusting your search or filters.</p>
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
                                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        {job.positionTitle}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                                        <Link href={`/employers/${job.employer?._id || job.employerId}`} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                                            <Building2 className="w-3.5 h-3.5" />
                                                            {job.employer?.companyName || job.company || 'Company'}
                                                        </Link>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5" />
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
                                                            <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-xs font-semibold">
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
                                                    className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-all"
                                                >
                                                    Apply <ChevronRight className="w-4 h-4" />
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
