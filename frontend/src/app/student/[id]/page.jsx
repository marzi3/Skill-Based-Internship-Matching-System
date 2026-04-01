'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/services/apiClient';
import Navbar from '@/components/common/Navbar';
import { Mail, MapPin, Code, Star, Loader2, ArrowLeft, GraduationCap, Briefcase, Award, User, Phone, FileText, Link as LinkIcon } from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';

export default function StudentPublicProfile() {
    const params = useParams();
    const router = useRouter();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/auth/students/${params.id}`);
                setStudentData(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load student profile');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchProfile();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !studentData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Student Not Found</h2>
                    <p className="text-gray-500">{error || 'This profile may be private or deleted.'}</p>
                    <button onClick={() => router.back()} className="text-primary-600 font-medium hover:underline flex items-center gap-2">
                        <ArrowLeft size={16} /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { user, profile } = studentData;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 font-medium text-sm">
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Header Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10"></div>

                    <Avatar
                        src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                        name={user.name}
                        size="2xl"
                        className="rounded-3xl shadow-lg ring-4 ring-white z-10 w-32 h-32"
                    />

                    <div className="flex-1 z-10 space-y-4">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user.name}</h1>
                            <p className="text-lg text-gray-500 font-medium mt-1">
                                {profile?.personalInfo?.designation || 'Student Candidate'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600">
                            {(user.location || profile?.personalInfo?.location) && (
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <MapPin size={16} className="text-gray-500" />
                                    {user.location || profile?.personalInfo?.location}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <Mail size={16} className="text-gray-500" />
                                <a href={`mailto:${user.email}`} className="hover:text-primary-600 transition-colors">{user.email}</a>
                            </div>
                            {profile?.personalInfo?.phone && (
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Phone size={16} className="text-gray-500" />
                                    <a href={`tel:${profile.personalInfo.phone}`} className="hover:text-primary-600 transition-colors">{profile.personalInfo.phone}</a>
                                </div>
                            )}
                            {profile?.resume?.filePath && (
                                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-3 rounded-xl mt-2 w-max">
                                    <FileText size={24} className="text-primary-500" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">{profile.resume.fileName || 'Resume.pdf'}</span>
                                        {(() => {
                                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api/v1';
                                            const baseUrl = apiUrl.includes('/api/v1') ? apiUrl.replace('/api/v1', '') : apiUrl;
                                            return (
                                                <a href={`${baseUrl}/${profile.resume.filePath}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                                                    View / Download
                                                </a>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                            {profile?.portfolio?.portfolio && (
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <LinkIcon size={16} className="text-gray-500" />
                                    <a href={profile.portfolio.portfolio.startsWith('http') ? profile.portfolio.portfolio : `https://${profile.portfolio.portfolio}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">
                                        Portfolio
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="md:col-span-2 space-y-8">
                        {/* About Section */}
                        {(user.bio || profile?.personalInfo?.about) && (
                            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User size={24} className="text-primary-600" /> About
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    {user.bio || profile?.personalInfo?.about}
                                </p>
                            </section>
                        )}

                        {/* Education */}
                        {profile?.education?.length > 0 && (
                            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <GraduationCap size={24} className="text-primary-600" /> Education
                                </h2>
                                <div className="space-y-6">
                                    {profile.education.map((edu, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                                                <GraduationCap size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{edu.degree} in {edu.field}</h3>
                                                <p className="text-gray-600 font-medium">{edu.institution}</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(edu.startDate).getFullYear()} - {edu.isCurrentlyStudying ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Skills */}
                        {profile?.skills?.length > 0 && (
                            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Code size={24} className="text-primary-600" /> Top Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, idx) => (
                                        <Badge key={idx} variant="primary" className="bg-indigo-50 text-indigo-700 border border-indigo-100 font-black uppercase text-xs">
                                            {skill.name}
                                        </Badge>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Certifications (if any) */}
                        {profile?.certifications?.length > 0 && (
                            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Award size={24} className="text-primary-600" /> Certifications
                                </h2>
                                <div className="space-y-4">
                                    {profile.certifications.map((cert, idx) => (
                                        <div key={idx} className="pb-3 border-b last:border-0 border-gray-50">
                                            <h3 className="font-bold text-gray-900">{cert.name}</h3>
                                            <div className="flex flex-col gap-1 mt-1">
                                                <p className="text-xs text-gray-500 font-medium tracking-tight uppercase">Issued: {new Date(cert.issuedDate).toLocaleDateString([], { month: 'long', year: 'numeric' })}</p>
                                                {cert.credentialUrl && (
                                                    <a href={cert.credentialUrl.startsWith('http') ? cert.credentialUrl : `https://${cert.credentialUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1 group">
                                                        <LinkIcon size={12} className="group-hover:rotate-12 transition-transform" /> 
                                                        Verify Credential
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
