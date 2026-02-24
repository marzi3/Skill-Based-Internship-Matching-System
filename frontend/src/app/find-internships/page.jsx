'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Briefcase, MapPin, Building2, ChevronRight, Filter } from 'lucide-react';

export default function FindInternships() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const mockInternships = [
        { title: 'Frontend Developer Intern', company: 'Tech Innovators', location: 'San Francisco, CA', type: 'Remote', skills: ['React', 'Next.js', 'Tailwind'] },
        { title: 'Data Science Intern', company: 'DataMetrics', location: 'New York, NY', type: 'Hybrid', skills: ['Python', 'SQL', 'Machine Learning'] },
        { title: 'UX/UI Design Intern', company: 'Creative Studio', location: 'London, UK', type: 'On-site', skills: ['Figma', 'Prototyping', 'User Research'] },
        { title: 'Backend Engineering Intern', company: 'CloudSystems', location: 'Austin, TX', type: 'Remote', skills: ['Node.js', 'Express', 'MongoDB'] },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* Navbar Minimal */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 group-hover:opacity-80">
                                InternMatch
                            </span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="/employers" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">For Employers</Link>
                            <Link href="/login" className="text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors">Sign In</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Header Section */}
            <section className="pt-32 pb-16 px-4 bg-white border-b border-gray-100">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                            Find your next <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">big opportunity.</span>
                        </h1>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
                            Discover thousands of verified internships tailored to your unique skill set.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-3xl mx-auto bg-white rounded-full shadow-lg shadow-indigo-100 border border-gray-100 p-2 flex flex-col sm:flex-row items-center gap-2">
                            <div className="flex-1 flex items-center pl-4 w-full border-b sm:border-b-0 sm:border-r border-gray-100 pb-2 sm:pb-0">
                                <Search className="w-5 h-5 text-gray-400 mr-2" />
                                <input type="text" placeholder="Job title, keywords, or company" className="w-full bg-transparent outline-none text-gray-700 placeholder:text-gray-400" />
                            </div>
                            <div className="flex-1 flex items-center pl-4 w-full pb-2 sm:pb-0">
                                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                                <input type="text" placeholder="Location or Remote" className="w-full bg-transparent outline-none text-gray-700 placeholder:text-gray-400" />
                            </div>
                            <button className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center">
                                Search
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

                {/* Filters Sidebar */}
                <aside className="w-full lg:w-1/4">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-gray-900">Filters</h3>
                            <Filter className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="font-medium text-sm text-gray-900 mb-3">Job Type</h4>
                                <div className="space-y-2">
                                    {['Full-time Internship', 'Part-time Internship', 'Remote', 'Hybrid'].map(type => (
                                        <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 w-full"></div>

                            <div>
                                <h4 className="font-medium text-sm text-gray-900 mb-3">Industry</h4>
                                <div className="space-y-2">
                                    {['Technology', 'Finance', 'Design', 'Marketing'].map(ind => (
                                        <label key={ind} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{ind}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Listings */}
                <div className="w-full lg:w-3/4 space-y-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Recommended for you</h2>
                        <span className={"text-sm text-gray-500"}>Showing {mockInternships.length} results</span>
                    </div>

                    {mockInternships.map((job, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                            className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 hover:border-indigo-100 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row justify-between gap-6"
                        >
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                    <Briefcase strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 mb-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {job.company}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                                        <span>•</span>
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-medium">{job.type}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map(skill => (
                                            <span key={skill} className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-indigo-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex sm:flex-col justify-between items-end shrink-0">
                                <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                </button>
                                <div className="flex items-center text-sm font-medium text-indigo-600 group-hover:translate-x-1 transition-transform">
                                    Apply <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
