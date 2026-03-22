'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Star, SlidersHorizontal, Zap, Loader2, ArrowLeft, X, ChevronDown, GraduationCap } from 'lucide-react';
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
    const [minGpa, setMinGpa] = useState('');
    const [fieldFilter, setFieldFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

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

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/auth/students');
            if (res.data.success) setCandidates(res.data.data || []);
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

    // Apply filters
    const filteredCandidates = candidates.filter(c => {
        const matchSearch = !searchTerm ||
            c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchGpa = !minGpa || (c.gpa && c.gpa >= parseFloat(minGpa));
        const matchField = !fieldFilter || c.fieldOfStudy?.toLowerCase().includes(fieldFilter.toLowerCase());
        const matchLocation = !locationFilter || c.location?.toLowerCase().includes(locationFilter.toLowerCase());
        return matchSearch && matchGpa && matchField && matchLocation;
    });

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-rose-600 bg-rose-50 border-rose-200';
    };

    const displayList = rapidMatchResults || filteredCandidates;

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
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text" placeholder="Search by skill, name, or field…"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium text-sm"
                        />
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
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Min GPA</label>
                                    <input type="number" step="0.1" min="0" max="4" value={minGpa} onChange={e => setMinGpa(e.target.value)}
                                        placeholder="e.g. 3.0"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Field of Study</label>
                                    <input type="text" value={fieldFilter} onChange={e => setFieldFilter(e.target.value)}
                                        placeholder="e.g. Computer Science"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Location</label>
                                    <input type="text" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
                                        placeholder="e.g. San Francisco"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                </div>
                            </div>
                            <div className="flex justify-end mt-3">
                                <button onClick={() => { setMinGpa(''); setFieldFilter(''); setLocationFilter(''); }}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                    Clear All Filters
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
            ) : displayList.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Search size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No candidates found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {displayList.map((candidate, idx) => {
                        const isMatchResult = rapidMatchResults !== null;
                        const name = isMatchResult ? candidate.studentName : candidate.name;
                        const id = isMatchResult ? candidate.studentId : candidate._id;
                        const skills = isMatchResult ? (candidate.matchedSkills || []) : (candidate.skills || []);
                        const score = isMatchResult ? Math.round(candidate.finalScore || 0) : (candidate.score || 0);
                        const location = isMatchResult ? '' : (candidate.location || '');
                        const field = isMatchResult ? (candidate.fieldOfStudy || '') : (candidate.fieldOfStudy || '');

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
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'user'}`}
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
                                                    className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all mb-2"
                                                    title="Report Candidate"
                                                >
                                                    <Flag size={14} />
                                                </button>
                                                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-black border ${getScoreColor(score)}`}>
                                                    <Star size={14} fill="currentColor" /> {score}%
                                                </span>
                                                {isMatchResult && candidate.tier && (
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{candidate.tier}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-black text-gray-900">{name}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                {location && (
                                                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium"><MapPin size={12} /> {location}</span>
                                                )}
                                                {field && (
                                                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium"><GraduationCap size={12} /> {field}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                            {skills.slice(0, 5).map(skill => (
                                                <span key={skill} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md border border-indigo-100">{skill}</span>
                                            ))}
                                            {skills.length > 5 && <span className="px-2 py-0.5 text-xs text-gray-400 font-bold">+{skills.length - 5}</span>}
                                        </div>

                                        <div className="pt-4 border-t border-gray-100">
                                            <Link href={`/students/${id}`} className="block w-full text-center bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md">
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
