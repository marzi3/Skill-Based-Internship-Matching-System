'use client';

import { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
import {
    Search,
    MapPin,
    Clock,
    Briefcase,
    Filter,
    Loader,
    SlidersHorizontal,
    ChevronRight,
    TrendingDown,
    Calendar,
    Zap,
    Star
} from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { useRouter } from 'next/navigation';

export default function InternshipSearch() {
    const router = useRouter();
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        domain: '',
        workEnvironment: '',
        duration: ''
    });

    const fetchInternships = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/internships', {
                params: { q: searchQuery, ...filters }
            });
            setInternships(res.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch internships:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInternships();
    }, [filters]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInternships();
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Active Opportunities</h1>
                    <p className="text-gray-500 font-medium">Synchronize your skills with verified industrial protocols</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by position or skill..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all font-bold shadow-sm"
                        />
                    </form>
                    <button className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg">
                        <SlidersHorizontal size={24} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="space-y-6">
                    <Card padding="lg" className="space-y-6 sticky top-28">
                        <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest border-b pb-4">Filter Interface</h3>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Domain</label>
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none"
                                value={filters.domain}
                                onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
                            >
                                <option value="">All Domains</option>
                                <option value="IT">IT & Software</option>
                                <option value="Design">Design</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Finance">Finance</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Environment</label>
                            <div className="space-y-2">
                                {['Remote', 'On-site', 'Hybrid'].map(env => (
                                    <button
                                        key={env}
                                        onClick={() => setFilters({ ...filters, workEnvironment: filters.workEnvironment === env ? '' : env })}
                                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.workEnvironment === env ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {env}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Results Area */}
                <div className="lg:col-span-3 space-y-6">
                    {loading ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <Loader className="animate-spin text-primary-600" size={48} />
                            <p className="text-gray-400 font-bold uppercase tracking-widest animate-pulse">Syncing Opportunities...</p>
                        </div>
                    ) : internships.length > 0 ? (
                        internships.map((job) => (
                            <Card
                                key={job._id}
                                className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-50 group cursor-pointer"
                                onClick={() => router.push(`/internships/${job._id}`)}
                            >
                                <div className="p-8 flex flex-col md:flex-row gap-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0 group-hover:scale-110 transition-transform">
                                        <Briefcase size={32} className="text-gray-400" />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                                            <div>
                                                <h2 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-primary-600 transition-colors uppercase">{job.positionTitle}</h2>
                                                <p className="text-gray-500 font-bold">{job.employer?.companyName || 'Verified Corp'}</p>
                                            </div>
                                            <Badge variant="success">{job.workEnvironment}</Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 font-bold">
                                            <div className="flex items-center gap-1"><MapPin size={16} /> Navi Mumbai</div>
                                            <div className="flex items-center gap-1"><Clock size={16} /> {job.duration} Months</div>
                                            <div className="flex items-center gap-1 text-emerald-500"><Zap size={16} fill="currentColor" /> FAST RESPONSE</div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50 mt-4">
                                            {job.requiredSkills?.slice(0, 4).map(skill => (
                                                <Badge key={skill.name} variant="secondary" size="sm" className="bg-indigo-50 text-indigo-600 border-indigo-100">{skill.name}</Badge>
                                            ))}
                                            {job.requiredSkills?.length > 4 && <span className="text-xs text-gray-400 font-bold pt-1">+{job.requiredSkills.length - 4} more</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 gap-2">
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">A.I. Compatibility</span>
                                        <div className="flex items-center gap-2">
                                            <Star className="text-amber-400" size={18} fill="currentColor" />
                                            <span className="text-2xl font-black text-gray-900">88%</span>
                                        </div>
                                        <button className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg group-hover:bg-primary-700 transition-all">
                                            Open Interface
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="py-20 text-center space-y-4 border-dashed border-2">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">No matching protocols identified.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setFilters({ domain: '', workEnvironment: '', duration: '' }) }}
                                className="text-primary-600 font-black underline uppercase text-xs"
                            >
                                Reset Search Filters
                            </button>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
