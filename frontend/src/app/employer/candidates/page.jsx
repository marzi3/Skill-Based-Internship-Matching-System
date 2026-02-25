'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Code, Star, SlidersHorizontal, Briefcase, Zap, Loader2 } from 'lucide-react';
import axios from 'axios';
import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';

const CandidateSearchPage = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get('/api/auth/students');
                if (res.data.success) {
                    setCandidates(res.data.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch students:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const filteredCandidates = candidates.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Candidate Search</h1>
                    <p className="text-gray-600">Universal directory for synchronization-ready talent protocols</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 transition-all">
                    <Zap size={16} fill="currentColor" />
                    Rapid Match
                </button>
            </div>

            <Card shadow="sm" rounded="lg" padding="lg" className="bg-white border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by skill, position, or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-800"
                        />
                    </div>
                    <button className="flex items-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg">
                        <SlidersHorizontal size={18} />
                        Advanced Filters
                    </button>
                </div>
            </Card>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary-600" size={32} />
                </div>
            ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Search size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No candidates found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredCandidates.map((candidate) => (
                        <Card key={candidate._id} shadow="sm" rounded="lg" padding="lg" className="hover:shadow-2xl transition-all duration-500 border border-gray-50 group">
                            <div className="space-y-6">
                                <div className="flex items-start justify-between">
                                    <Avatar
                                        src={candidate.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.name}`}
                                        name={candidate.name}
                                        size="xl"
                                        className="rounded-3xl shadow-lg ring-4 ring-white"
                                    />
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-sm font-black border border-emerald-100">
                                            <Star size={16} fill="currentColor" /> {candidate.score || 0}%
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{candidate.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-400 font-bold text-xs mt-1">
                                        <MapPin size={14} /> {candidate.location || 'Not Specified'}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {(candidate.skills || []).map((skill) => (
                                        <Badge key={skill} variant="primary" size="sm" className="bg-indigo-50 text-indigo-600 border border-indigo-100 font-black uppercase tracking-tighter">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-gray-50">
                                    <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg">
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CandidateSearchPage;
