'use client';

import { useState } from 'react';
import { User, Mail, GraduationCap, MapPin, Edit3, ShieldCheck, Github, Linkedin, Briefcase } from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/context/AuthContext';

export default function StudentProfile() {
    const { user } = useAuth();

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>

                <div className="relative z-10">
                    <Avatar
                        name={user?.name}
                        src={user?.profilePicture}
                        size="xl"
                        className="w-32 h-32 ring-8 ring-indigo-50 rounded-[2rem]"
                    />
                </div>

                <div className="flex-1 space-y-4 relative z-10 text-center md:text-left">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">{user?.name}</h1>
                        <p className="text-indigo-600 font-bold tracking-widest uppercase text-xs flex items-center justify-center md:justify-start gap-2">
                            <ShieldCheck size={16} /> Verified Student Protocol
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-500 font-bold text-sm">
                        <div className="flex items-center gap-1"><MapPin size={16} /> Mumbai, MH</div>
                        <div className="flex items-center gap-1"><GraduationCap size={16} /> VJTI Mumbai</div>
                        <div className="flex items-center gap-1"><Mail size={16} /> {user?.email}</div>
                    </div>
                </div>

                <Link href="/profile/edit">
                    <button className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">
                        Update Profile
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card padding="lg" className="space-y-6">
                        <h2 className="text-xl font-black text-gray-900 border-b pb-4 flex items-center gap-2 tracking-tight">
                            <Edit3 size={20} /> PROFESSIONAL SYNOPSIS
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Highly motivated Computer Engineering candidate with high-probability compatibility in Full Stack Development and Cloud Architecture.
                            Focused on bridging the gap between theoretical algorithms and industrial synchronization.
                        </p>
                    </Card>

                    <Card padding="lg" className="space-y-6">
                        <h2 className="text-xl font-black text-gray-900 border-b pb-4 flex items-center gap-2 tracking-tight">
                            <Briefcase size={20} /> CORE CAPABILITIES
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {['React.js', 'Node.js', 'Python', 'Docker', 'AWS', 'TensorFlow', 'PostgreSQL'].map(skill => (
                                <Badge key={skill} variant="secondary" className="px-6 py-2 bg-slate-50 border-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-widest">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card padding="lg" className="space-y-6 bg-indigo-600 text-white border-none shadow-indigo-200">
                        <h3 className="font-black uppercase text-xs tracking-widest opacity-80 border-b border-white/20 pb-4">Verification Score</h3>
                        <div className="text-center py-4">
                            <span className="text-6xl font-black">850</span>
                            <p className="text-xs font-bold uppercase tracking-widest mt-2">Ranked Top 5%</p>
                        </div>
                    </Card>

                    <Card padding="lg" className="space-y-6">
                        <h3 className="font-black uppercase text-xs tracking-widest text-gray-500 border-b pb-4">Social Protocols</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors font-bold">
                                <Github size={20} /> <span>GitHub / alex-chen</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors font-bold">
                                <Linkedin size={20} /> <span>LinkedIn / alex-chen</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
