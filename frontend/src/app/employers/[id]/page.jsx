'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/services/apiClient';
import { motion } from 'framer-motion';
import { 
    Building2, MapPin, Globe, Briefcase, 
    ArrowLeft, ExternalLink, ShieldCheck, 
    Calendar, CheckCircle2, ChevronRight, Loader2
} from 'lucide-react';
import Avatar from '@/components/common/Avatar';

export default function EmployerProfilePage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`auth/employers/${id}`);
                if (res.data.success) {
                    setData(res.data.data);
                } else {
                    setError('Failed to load employer profile');
                }
            } catch (err) {
                console.error('Error fetching employer profile:', err);
                setError(err.response?.data?.message || 'Error communicating with server');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Accessing Corporate Node...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                <div className="bg-white p-12 rounded-[3rem] text-center max-w-lg shadow-sm border border-slate-100">
                    <Building2 className="mx-auto w-16 h-16 text-rose-500 mb-6" />
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Entity Not Found</h2>
                    <p className="text-slate-500 font-bold mb-8">{error || "The requested employer profile is unavailable."}</p>
                    <button onClick={() => router.back()} className="inline-flex items-center gap-2 bg-[#6366F1] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#4F46E5] transition-all">
                        <ArrowLeft size={16} /> Return Previous
                    </button>
                </div>
            </div>
        );
    }

    const { employer, internships } = data;
    const profilePic = employer.profilePicture?.startsWith('http') 
        ? employer.profilePicture 
        : employer.profilePicture 
            ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/${employer.profilePicture}` 
            : null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase text-[10px] tracking-widest group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                    <div className="flex items-center gap-2">
                        {employer.verificationStatus === 'approved' && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                                <ShieldCheck size={12} className="text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Verified Industrial Partner</span>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 lg:p-12 space-y-12">
                {/* Profile Header Card */}
                <section className="bg-white rounded-[3.5rem] p-10 lg:p-16 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-70" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start md:items-center">
                        <Avatar
                            src={employer.profilePicture}
                            name={employer.companyName}
                            size="xl"
                            className="rounded-[2.5rem] border border-slate-100 shadow-inner"
                        />

                        <div className="flex-1 space-y-4">
                            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                                {employer.companyName || 'Industrial Partner'}
                            </h1>
                            
                            <div className="flex flex-wrap gap-6 items-center">
                                {employer.website && (
                                    <a href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors group">
                                        <Globe size={16} /> 
                                        <span>Official Repository</span>
                                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                )}
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest">
                                    <MapPin size={16} />
                                    <span>Headquarters: {employer.location || 'Undisclosed'}</span>
                                </div>
                                {employer.industry && (
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest border-l border-slate-200 pl-6">
                                        <Briefcase size={16} />
                                        <span>Sector: {employer.industry}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 pt-16 border-t border-slate-100 grid lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Company Overview</h3>
                            <p className="text-slate-600 font-medium leading-[1.8] text-lg lg:text-xl">
                                {employer.companyDescription || `${employer.companyName} is a leading innovator in its sector, committed to fostering talent and driving technological advancement through professional internship programs.`}
                            </p>
                        </div>
                        <div className="lg:col-span-4 bg-slate-50 rounded-[2.5rem] p-8 space-y-6 self-start border border-slate-100">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Network Stats</h4>
                             <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Open Positions</span>
                                    <span className="text-xl font-black text-slate-900">{internships?.length || 0}</span>
                                </div>
                                {employer.companySize && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Company Size</span>
                                        <span className="text-sm font-black text-slate-900">{employer.companySize} Employees</span>
                                    </div>
                                )}
                                {employer.foundedYear && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Founded</span>
                                        <span className="text-sm font-black text-slate-900">{employer.foundedYear}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Member Since</span>
                                    <span className="text-sm font-black text-slate-900">{new Date(employer.createdAt).getFullYear()}</span>
                                </div>
                             </div>
                        </div>
                    </div>
                </section>

                {/* Active Internships Selection */}
                <section className="space-y-8 pb-20">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                            <Briefcase className="text-indigo-600" size={24} /> 
                            Active Protocols
                            <span className="text-slate-300 text-sm font-bold">/ Opportunities</span>
                        </h2>
                    </div>

                    {internships?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {internships.map((job, idx) => (
                                <motion.div 
                                    key={job._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Link 
                                        href={`/internships/${job._id}`}
                                        className="block group bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                                                <Briefcase size={24} />
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                <CheckCircle2 size={10} /> Active Hiring
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                            {job.positionTitle}
                                        </h3>
                                        
                                        <div className="flex items-center gap-4 text-slate-400 font-bold mb-6 text-xs uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={14} /> {job.location || job.workEnvironment}
                                            </div>
                                            <span>•</span>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} /> {job.duration || '6'} Months
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#6366F1]">Protocol Established: {new Date(job.createdAt).toLocaleDateString()}</span>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:translate-x-1 transition-all">
                                                <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 border-dashed">
                            <Briefcase className="mx-auto w-12 h-12 text-slate-200 mb-6" />
                            <p className="text-slate-400 font-bold">No active internship protocols found at this node.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
