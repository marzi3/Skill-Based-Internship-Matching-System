'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
    Search,
    MapPin,
    Building2,
    Bookmark,
    ChevronRight,
    Filter,
    Loader2,
    Briefcase,
} from 'lucide-react';

export default function FindInternshipsPage() {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [filters, setFilters] = useState({
        jobType: [],
        industry: [],
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    const fetchInternships = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.q = searchQuery;
            if (locationQuery) params.workEnvironment = locationQuery;
            if (filters.industry.length === 1) params.domain = filters.industry[0];

            const res = await axios.get(`${API_URL}/api/internships`, { params });
            setInternships(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch internships:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInternships();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInternships();
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

    // Client-side filtering for multi-select
    const filtered = internships.filter((job) => {
        const matchesType =
            filters.jobType.length === 0 ||
            filters.jobType.some((t) => {
                if (t === 'Remote') return job.workEnvironment === 'Remote';
                if (t === 'On-site') return job.workEnvironment === 'On-site';
                if (t === 'Hybrid') return job.workEnvironment === 'Hybrid';
                return true;
            });
        const matchesIndustry =
            filters.industry.length === 0 ||
            filters.industry.some((i) =>
                (job.domain || '').toLowerCase().includes(i.toLowerCase())
            );
        return matchesType && matchesIndustry;
    });

    const jobTypeOptions = ['Full-time Internship', 'Part-time Internship', 'Remote', 'On-site', 'Hybrid'];
    const industryOptions = ['Technology', 'Finance', 'Design', 'Marketing'];

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/images/logo.png" alt="InternMatch" className="h-10 w-auto object-contain" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            InternMatch
                        </span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/employers" className="text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                            For Employers
                        </Link>
                        <Link href="/login" className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>
            </nav>

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

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-2 flex items-center gap-2">
                        <div className="flex items-center gap-2 flex-1 px-4">
                            <Search className="w-5 h-5 text-gray-300 shrink-0" />
                            <input
                                type="text"
                                placeholder="Job title, keywords, or company"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
                            />
                        </div>
                        <div className="hidden sm:flex items-center gap-2 border-l border-gray-100 flex-1 px-4">
                            <MapPin className="w-5 h-5 text-gray-300 shrink-0" />
                            <input
                                type="text"
                                placeholder="Location or Remote"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                                className="w-full py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 shrink-0"
                        >
                            Search
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
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recommended for you</h2>
                            <span className="text-sm text-gray-400 font-medium">
                                Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                            </span>
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
                                {filtered.map((job) => (
                                    <div
                                        key={job._id}
                                        className="bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 p-6 group"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                {/* Company Icon */}
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                                                    <Building2 className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                                </div>

                                                <div>
                                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        {job.positionTitle}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="w-3.5 h-3.5" />
                                                            {job.employer?.companyName || job.company || 'Company'}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {job.workEnvironment || 'Remote'}
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
                                                <button className="text-gray-300 hover:text-indigo-500 transition-colors">
                                                    <Bookmark className="w-5 h-5" />
                                                </button>
                                                <Link
                                                    href={`/internships/${job._id}`}
                                                    className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                                                >
                                                    Apply <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
