'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Star, SlidersHorizontal, Zap, Loader2, ArrowLeft, X, ChevronDown, GraduationCap, Users } from 'lucide-react';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReportModal from '@/components/modals/ReportModal';
import { Flag } from 'lucide-react';

/**
 * Candidate Search — browse students, run Rapid Match against active postings,
 * and apply advanced filters (skills, GPA, location, field).
 */
const CandidateSearchPage = () => {
    const router = useRouter();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Advanced filters
    const [showFilters, setShowFilters] = useState(false);
    const [fieldFilter, setFieldFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState(null);

    // Rapid Match
    const [rapidMatchLoading, setRapidMatchLoading] = useState(false);
    const [rapidMatchResults, setRapidMatchResults] = useState(null);
    const [internships, setInternships] = useState([]);
    const [selectedInternship, setSelectedInternship] = useState('');
    const [reportTarget, setReportTarget] = useState(null);

    useEffect(() => {
        fetchStudents();
        fetchMyInternships();
    }, []);

    /** Auto-trigger Rapid Match when arriving from dashboard View All link. */
    const searchParams = useSearchParams();
    useEffect(() => {
        if (searchParams.get('rapidMatch') === 'true' && internships.length > 0 && !rapidMatchResults) {
            handleRapidMatch();
        }
    }, [searchParams, internships]);

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/auth/students');
            if (res.data.success) {
                const fetched = res.data.data || [];
                setCandidates(fetched);
                // Initialize results with all candidates so they show up immediately
                setResults(fetched);
            }
        } catch (err) {
            console.error('Failed to fetch students:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyInternships = async () => {
        try {
            const res = await axios.get('/internships/my-postings');
            setInternships(res.data.data || []);
        } catch { /* silent */ }
    };

    const handleRapidMatch = async () => {
        const internshipId = selectedInternship || (internships.length > 0 ? internships[0]._id : null);
        if (!internshipId) {
            alert('No internships found. Post an internship to use Rapid Match.');
            return;
        }
        setRapidMatchLoading(true);
        try {
            const res = await axios.post('/matching/students', {
                internshipId,
                limit: 20,
            });
            if (res.data.success) {
                setRapidMatchResults(res.data.candidates || []);
            }
        } catch (err) {
            console.error('Rapid Match failed:', err);
            alert('Rapid Match failed. Please try again.');
        } finally {
            setRapidMatchLoading(false);
        }
    };

    const clearRapidMatch = () => {
        setRapidMatchResults(null);
        setSelectedInternship('');
    };

    const handleSearchExecution = () => {
        setIsSearching(true);
        // Simulate a brief delay for premium feel
        setTimeout(() => {
            const filtered = candidates.filter(c => {
                const matchesSearch = !searchTerm ||
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

                const matchesField = !fieldFilter || (c.fieldOfStudy && c.fieldOfStudy.toLowerCase().includes(fieldFilter.toLowerCase()));
                const matchesLocation = !locationFilter || (c.location && c.location.toLowerCase().includes(locationFilter.toLowerCase()));

                return matchesSearch && matchesField && matchesLocation;
            });
            setResults(filtered);
            setIsSearching(false);
        }, 600);
    };

    const displayCandidates = rapidMatchResults || results || [];

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-rose-600 bg-rose-50 border-rose-200';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/employer/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Candidate Search</h1>
                        <p className="text-sm text-gray-500">Browse talent and run skill-based matching</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {internships.length > 1 && (
                        <select
                            value={selectedInternship}
                            onChange={e => setSelectedInternship(e.target.value)}
                            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                        >
                            <option value="">Default Internship</option>
                            {internships.map(i => <option key={i._id} value={i._id}>{i.positionTitle}</option>)}
                        </select>
                    )}
                    <button
                        onClick={rapidMatchResults ? clearRapidMatch : handleRapidMatch}
                        disabled={rapidMatchLoading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${rapidMatchResults
                                ? 'bg-gray-800 text-white hover:bg-gray-900'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl'
                            }`}
                    >
                        {rapidMatchLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : rapidMatchResults ? (
                            <><X className="w-4 h-4" /> Clear Results</>
                        ) : (
                            <><Zap className="w-4 h-4" /> Rapid Match</>
                        )}
                    </button>
                </div>
            </div>

            {rapidMatchResults && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-800">
                        Showing {rapidMatchResults.length} candidates ranked by matching engine score
                    </span>
                </div>
            )}

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find talent by name or skills (e.g. React, UX Design)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchExecution()}
                            className="w-full pl-12 pr-32 py-5 bg-white border border-gray-100 rounded-3xl text-sm font-bold text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                        />
                        <button
                            onClick={handleSearchExecution}
                            disabled={isSearching}
                            className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                        </button>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all border ${showFilters ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" /> Advanced Filters
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5 shadow-inner">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Field of Study</label>
                                        <input type="text" value={fieldFilter} onChange={e => setFieldFilter(e.target.value)}
                                            placeholder="e.g. Computer Science"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Location</label>
                                        <input type="text" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
                                            placeholder="e.g. San Francisco"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button onClick={() => { setFieldFilter(''); setLocationFilter(''); }}
                                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-4 py-2 rounded-lg">
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Results */}
            {loading || isSearching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 h-64 animate-pulse">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gray-200"></div>
                                <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="w-3/4 h-6 bg-gray-200 rounded-md mb-3"></div>
                            <div className="w-1/2 h-4 bg-gray-100 rounded-md mb-6"></div>
                            <div className="flex gap-2 mb-6">
                                <div className="w-16 h-6 bg-gray-100 rounded-md"></div>
                                <div className="w-16 h-6 bg-gray-100 rounded-md"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !loading && !isSearching && displayCandidates.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-indigo-300" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No Candidates Found</h3>
                    <p className="text-gray-500 font-bold max-w-sm mx-auto">Try adjusting your search protocol or filters to expand your talent pool.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayCandidates.map((candidate, idx) => {
                        const isMatchResult = rapidMatchResults !== null;
                        const name = isMatchResult ? candidate.studentName : candidate.name;
                        const id = isMatchResult ? candidate.studentId : candidate._id;
                        const skills = isMatchResult ? (candidate.matchedSkills || []) : (candidate.skills || []);
                        const score = isMatchResult ? Math.round(candidate.finalScore || 0) : (candidate.score || 0);
                        const location = isMatchResult ? '' : (candidate.location || '');
                        const field = isMatchResult ? (candidate.fieldOfStudy || '') : (candidate.fieldOfStudy || '');
                        const profilePicture = candidate.profilePicture || '';

                        return (
                            <motion.div
                                key={id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all duration-300 group">
                                    <div className="space-y-5">
                                        <div className="flex items-start justify-between">
                                            <Avatar
                                                src={profilePicture}
                                                name={name || 'Candidate'}
                                                size="xl"
                                                className="rounded-2xl shadow-md ring-4 ring-white"
                                            />
                                            <div className="flex flex-col items-end gap-1">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setReportTarget({ id, name });
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all mb-2"
                                                    title="Report Candidate"
                                                >
                                                    <Flag size={14} />
                                                </button>
                                                {isMatchResult && (
                                                    <div className="relative group/score">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black border cursor-help ${getScoreColor(score)}`}>
                                                            <Star size={14} fill="currentColor" /> {score}%
                                                        </span>
                                                        
                                                        {/* Deep Match Insights Popover */}
                                                        <div className="absolute right-0 bottom-full mb-3 w-64 bg-gray-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl p-4 opacity-0 invisible group-hover/score:opacity-100 group-hover/score:visible transition-all z-50 pointer-events-none scale-95 group-hover/score:scale-100 origin-bottom-right border border-gray-700">
                                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-700 pb-2">Match Insights</p>
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-emerald-400 mb-1 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> Matched Skills</p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {skills.length > 0 ? skills.map(s => <span key={s} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">{s}</span>) : <span className="text-[10px] text-gray-500">None</span>}
                                                                    </div>
                                                                </div>
                                                                {candidate.missingSkills && candidate.missingSkills.length > 0 && (
                                                                    <div>
                                                                        <p className="text-[10px] font-bold text-rose-400 mb-1 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"/> Missing Skills</p>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {candidate.missingSkills.map(s => <span key={s} className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">{s}</span>)}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-gray-900/95 border-b border-r border-gray-700 rotate-45"></div>
                                                        </div>
                                                    </div>
                                                )}
                                                {isMatchResult && candidate.tier && (
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{candidate.tier}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-black text-gray-900">{name}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                {location && (
                                                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium"><MapPin size={12} /> {location}</span>
                                                )}
                                                {field && (
                                                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium"><GraduationCap size={12} /> {field}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                            {skills.slice(0, 5).map(skill => (
                                                <span key={skill} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md border border-indigo-100">{skill}</span>
                                            ))}
                                            {skills.length > 5 && <span className="px-2 py-0.5 text-xs text-gray-500 font-bold">+{skills.length - 5}</span>}
                                        </div>

                                        <div className="pt-4 border-t border-gray-100">
                                            <Link href={`/student/${id}`} className="block w-full text-center bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md">
                                                View Profile
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <ReportModal 
                isOpen={!!reportTarget}
                onClose={() => setReportTarget(null)}
                reportedId={reportTarget?.id}
                reportedEntity="User"
                reportedName={reportTarget?.name}
            />
        </div>
    );
};

export default CandidateSearchPage;
