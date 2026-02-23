'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    MapPin,
    Clock,
    Building,
    IndianRupee,
    Filter,
    ArrowRight,
    Sparkles,
    Zap,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomInput from '@/components/ui/CustomInput';
import { CardLoader } from '@/components/common/Loader';
import Link from 'next/link';

const StudentInternshipsPage = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInternships = async () => {
            try {
                setLoading(true);
                // Protocol: Fetching all active internship records
                const response = await axios.get('/api/internships');
                if (response.data.success) {
                    // Filter for 'Hiring' status strictly
                    const hiringOnly = response.data.data.filter(item => item.status === 'Hiring');
                    setInternships(hiringOnly);
                }
            } catch (err) {
                setError('Database Synchronization Failed: Protocol transmission error.');
                console.error(err);
            } finally {
                setTimeout(() => setLoading(false), 800); // Smooth transition
            }
        };

        fetchInternships();
    }, []);

    const filteredInternships = internships.filter(item =>
        item.positionTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 lg:p-16 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* DASHBOARD HEADER */}
                <header className="mb-16 relative">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#6366F1] p-2 rounded-xl text-white shadow-xl shadow-indigo-500/20">
                                    <Sparkles size={18} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#6366F1]">Protocol Discovery</span>
                            </div>
                            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
                                Find Your <span className="text-[#6366F1] italic font-medium tracking-normal">Mission.</span>
                            </h1>
                            <p className="text-slate-400 font-bold max-w-lg">
                                Connect with verified industrial partners and deploy your talent into real-world software ecosystems.
                            </p>
                        </div>

                        <div className="relative w-full lg:w-[460px] group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] rounded-[2rem] blur opacity-10 group-focus-within:opacity-20 transition duration-1000"></div>
                            <CustomInput
                                icon={Search}
                                placeholder="Search by position, domain or partner..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="relative z-10 shadow-2xl shadow-slate-200/50"
                            />
                        </div>
                    </div>
                </header>

                {/* SEARCH STATUS BOX */}
                <div className="mb-10 flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <div className="h-px w-8 bg-slate-200" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                            {filteredInternships.length} Available Protocols
                        </p>
                    </div>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* MAIN LISTING GRID */}
                {loading ? (
                    <div className="space-y-8">
                        <CardLoader count={6} />
                    </div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-rose-50 border-2 border-rose-100 p-16 rounded-[4rem] text-center"
                    >
                        <p className="text-rose-500 font-black uppercase tracking-widest text-sm leading-relaxed">
                            {error}
                        </p>
                    </motion.div>
                ) : filteredInternships.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border-2 border-slate-100 p-24 rounded-[4rem] text-center shadow-sm"
                    >
                        <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-[2.5rem] mx-auto mb-8">
                            <Filter className="text-slate-200" size={40} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Zero Matches Detected</h3>
                        <p className="text-slate-400 font-bold mt-3 max-w-sm mx-auto">Your search parameters did not synchronize with any available hiring protocols.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <AnimatePresence mode="popLayout">
                            {filteredInternships.map((internship, index) => (
                                <motion.div
                                    key={internship._id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-white rounded-[3.5rem] p-10 border border-slate-100 hover:border-[#6366F1]/30 hover:shadow-[0_50px_100px_rgba(99,102,241,0.12)] transition-all duration-500 relative flex flex-col h-full"
                                >
                                    {/* Status Indicator */}
                                    <div className="absolute top-10 right-10">
                                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            {internship.workEnvironment || 'Remote'}
                                        </div>
                                    </div>

                                    {/* Icon & Company */}
                                    <div className="mb-10">
                                        <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center border border-slate-100 group-hover:bg-[#6366F1]/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                                            <Building size={28} className="text-[#6366F1]" />
                                        </div>
                                        <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.3em] mt-6 ml-1">
                                            {internship.company || 'Industrial Partner'}
                                        </p>
                                    </div>

                                    {/* Title & Info */}
                                    <div className="flex-1 space-y-8">
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-[1.1] group-hover:text-[#6366F1] transition-colors line-clamp-2">
                                                {internship.positionTitle}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-4">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl">
                                                    <Clock size={14} className="text-indigo-400" /> {internship.duration || '6 Mo'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl">
                                                    <IndianRupee size={14} className="text-emerald-500" /> ₹{internship.stipend?.amount || '0'}/mo
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skill Sequence */}
                                        <div>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Required Stack</p>
                                            <div className="flex flex-wrap gap-2.5">
                                                {internship.requiredSkills?.slice(0, 3).map(skill => (
                                                    <span key={skill} className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-indigo-50 group-hover:text-[#6366F1] transition-colors">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {internship.requiredSkills?.length > 3 && (
                                                    <span className="px-3 py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black">
                                                        +{internship.requiredSkills.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="mt-12">
                                        <Link
                                            href={`/internships/${internship._id}`}
                                            className="w-full flex items-center justify-between bg-slate-900 group-hover:bg-[#6366F1] text-white p-7 rounded-[2rem] transition-all duration-500 shadow-2xl shadow-slate-900/10 hover:shadow-[#6366F1]/30 active:scale-[0.98]"
                                        >
                                            <span className="text-[11px] font-black uppercase tracking-[0.4em] ml-2">Examine Protocol</span>
                                            <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20">
                                                <ArrowRight size={20} strokeWidth={2.5} />
                                            </div>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 20px; }
      `}</style>
        </div>
    );
};

export default StudentInternshipsPage;
