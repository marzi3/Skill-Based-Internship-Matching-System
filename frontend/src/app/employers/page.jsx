'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    Zap,
    ShieldCheck,
    Building2,
    Users,
    CheckCircle,
    BarChart3,
    Sparkles,
    Target,
    TrendingUp,
    Globe,
    Star,
    Clock,
    Award,
} from 'lucide-react';

export default function EmployersPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-white font-sans overflow-hidden">

            {/* ── Navbar ── */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/images/logo.png" alt="InternMatch" className="h-10 w-auto object-contain" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            InternMatch
                        </span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/find-internships" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium">
                            Find Internships
                        </Link>
                        <Link href="/login" className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-32">
                {/* Animated background blobs */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-[-15%] right-[-8%] w-[55%] h-[55%] bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-gradient-to-tr from-violet-200/30 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
                    <div className="absolute top-[30%] left-[40%] w-[25%] h-[25%] bg-indigo-100/30 rounded-full blur-3xl" />
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

                        {/* Left Column */}
                        <div>
                            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/80 text-indigo-600 text-sm font-semibold mb-8 shadow-sm">
                                <Sparkles className="w-4 h-4" />
                                For Forward-Thinking Companies
                            </div>

                            <h1 className="text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.08] mb-6">
                                Hire the top 1% of{' '}
                                <span className="relative">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600">
                                        verified talent.
                                    </span>
                                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                        <path d="M2 8C50 2 150 2 298 8" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round" />
                                        <defs>
                                            <linearGradient id="underline-gradient" x1="0" y1="0" x2="300" y2="0">
                                                <stop stopColor="#6366f1" />
                                                <stop offset="1" stopColor="#8b5cf6" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </span>
                            </h1>

                            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-lg">
                                Stop guessing. Start matching. Our AI-driven platform connects you with pre-vetted students based on proven skills, not just resumes.
                            </p>

                            <div className="flex flex-wrap gap-4 mb-12">
                                <Link
                                    href="/register"
                                    className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold hover:from-indigo-600 hover:to-purple-600 transition-all duration-500 shadow-2xl shadow-gray-900/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                                >
                                    Start Hiring Free
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="#how-it-works"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-indigo-200/80 text-indigo-600 font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300"
                                >
                                    See How It Works
                                </Link>
                            </div>
                        </div>

                        {/* Right Column — Dashboard Preview */}
                        <div className="relative hidden lg:block">
                            {/* Glow behind card */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-purple-400/10 to-transparent rounded-[3rem] blur-3xl translate-x-4 translate-y-4" />

                            <div className="relative space-y-5">
                                {/* Floating badge - top right */}
                                <div className="absolute -top-6 -right-4 z-20 flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 px-5 py-3 animate-bounce" style={{ animationDuration: '3s' }}>
                                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Skill Verified</p>
                                        <p className="text-[11px] text-gray-400 font-medium">React & Node.js</p>
                                    </div>
                                </div>

                                {/* Main Dashboard Card */}
                                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-gray-200/60 shadow-2xl shadow-indigo-100/40 p-8 space-y-6">
                                    {/* Talent Dashboard Preview */}
                                    <div className="bg-gradient-to-br from-indigo-50 via-purple-50/50 to-white rounded-2xl border border-indigo-100/50 p-8 text-center space-y-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30">
                                            <Users className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-extrabold text-gray-900">Talent Dashboard</h3>
                                        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                                            Experience the premium intuitive dashboard tailored for your hiring needs.
                                        </p>
                                    </div>

                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* ── Why Employers Love Us ── */}
            <section id="how-it-works" className="py-28 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/20 to-white -z-10" />
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-6">
                            <Zap className="w-3.5 h-3.5" /> Platform Benefits
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-5">
                            Why Employers Love Us
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
                            We've reimagined the hiring pipeline to save you time and bring you better candidates.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                gradient: 'from-indigo-500 to-blue-600',
                                shadowColor: 'shadow-indigo-500/20',
                                bgHover: 'group-hover:bg-indigo-50',
                                title: 'Instant Matching',
                                desc: 'Post a role and instantly see candidates whose verified skills match your exact requirements.',
                            },
                            {
                                icon: ShieldCheck,
                                gradient: 'from-purple-500 to-violet-600',
                                shadowColor: 'shadow-purple-500/20',
                                bgHover: 'group-hover:bg-purple-50',
                                title: 'No More Resume Screening',
                                desc: 'Every candidate completes skill assessments. You only talk to students who can actually do the work.',
                            },
                            {
                                icon: Building2,
                                gradient: 'from-violet-500 to-pink-600',
                                shadowColor: 'shadow-violet-500/20',
                                bgHover: 'group-hover:bg-violet-50',
                                title: 'Employer Branding',
                                desc: 'Build an attractive company profile that highlights your engineering culture and perks.',
                            },
                        ].map((feature, idx) => (
                            <div
                                key={feature.title}
                                className="group bg-white rounded-3xl border border-gray-100 p-10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                            >
                                {/* Subtle gradient on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                                <div className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-7 shadow-xl ${feature.shadowColor} group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="relative text-xl font-extrabold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="relative text-gray-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="py-28 bg-gray-950 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 border border-white/10">
                            <Globe className="w-3.5 h-3.5" /> How It Works
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5">
                            Three steps to your next{' '}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                perfect hire
                            </span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Post Your Role', desc: 'Define skills, experience level, and culture fit requirements in minutes.', icon: Award },
                            { step: '02', title: 'AI Matches Candidates', desc: 'Our engine scores and ranks students based on verified skill assessments.', icon: Target },
                            { step: '03', title: 'Hire with Confidence', desc: 'Interview pre-qualified candidates and make offers to top talent.', icon: CheckCircle },
                        ].map((item) => (
                            <div key={item.step} className="relative group">
                                <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-10 hover:bg-white/10 transition-all duration-500 h-full">
                                    <div className="text-5xl font-black text-indigo-500/20 mb-6 group-hover:text-indigo-500/40 transition-colors">
                                        {item.step}
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                        <item.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-white mb-3">{item.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* ── CTA Section ── */}
            <section className="py-28 bg-white relative">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white -z-10" />
                <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-8 border border-emerald-100">
                        <Sparkles className="w-3.5 h-3.5" /> Get Started Today
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                        Ready to find your next{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            star intern?
                        </span>
                    </h2>
                    <p className="text-gray-500 mb-12 text-lg max-w-lg mx-auto leading-relaxed">
                        Join hundreds of companies already using InternMatch to build their talent pipeline.
                    </p>
                    <Link
                        href="/register"
                        className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-500 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1"
                    >
                        Get Started for Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-gray-950 text-white py-14 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <span className="text-xl font-extrabold">InternMatch</span>
                        <p className="text-gray-500 text-sm mt-1">© 2026 InternMatch Inc. All rights reserved.</p>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-500">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
