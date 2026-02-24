'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building, Users, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForEmployers() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900 font-sans selection:bg-purple-100 selection:text-purple-900">

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
                            <Link href="/find-internships" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">Find Internships</Link>
                            <Link href="/login" className="text-sm font-medium text-purple-600 bg-purple-50 px-4 py-2 rounded-full hover:bg-purple-100 transition-colors">Sign In</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden bg-white">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-50 to-white -z-10"></div>
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl"></div>
                <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-100/40 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
                    <motion.div
                        className="w-full lg:w-1/2"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-sm font-bold mb-6">
                            For Forward-Thinking Companies
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                            Hire the top 1% of <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">verified talent.</span>
                        </h1>
                        <p className="text-xl text-gray-500 mb-8 max-w-lg leading-relaxed">
                            Stop guessing. Start matching. Our AI-driven platform connects you with pre-vetted students based on proven skills, not just resumes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/register" className="px-8 py-4 rounded-full bg-gray-900 text-white font-bold text-lg hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center">
                                Start Hiring Free <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <Link href="#how-it-works" className="px-8 py-4 rounded-full bg-purple-50 text-purple-700 font-bold text-lg hover:bg-purple-100 transition-all flex items-center justify-center text-center">
                                See How It Works
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        className="w-full lg:w-1/2 relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        {/* Abstract UI Mockup */}
                        <div className="relative z-10 bg-white/60 backdrop-blur-2xl border border-white shadow-2xl shadow-purple-100 rounded-3xl p-6 aspect-video">
                            <div className="h-full border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 bg-white/50">
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 text-purple-600">
                                    <Users size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Talent Dashboard</h3>
                                <p className="text-center text-gray-500 text-sm">Experience the premium intuitive dashboard tailored for your hiring needs.</p>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-50 flex items-center gap-3 z-20"
                        >
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">Skill Verified</div>
                                <div className="text-xs text-gray-500">React & Node.js</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section id="how-it-works" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Employers Love Us</h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">We've reimagined the hiring pipeline to save you time and bring you better candidates.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: 'Instant Matching',
                                desc: 'Post a role and instantly see candidates whose verified skills match your exact requirements.'
                            },
                            {
                                icon: CheckCircle2,
                                title: 'No More Resume Screening',
                                desc: 'Every candidate completes skill assessments. You only talk to students who can actually do the work.'
                            },
                            {
                                icon: Building,
                                title: 'Employer Branding',
                                desc: 'Build an attractive company profile that highlights your engineering culture and perks.'
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -8 }}
                                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
