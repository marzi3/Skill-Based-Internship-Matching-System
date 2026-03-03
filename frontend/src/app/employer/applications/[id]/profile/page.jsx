'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';

import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';

export default function EmployerApplicantProfilePage() {
    const params = useParams();
    const applicationId = params?.id;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!applicationId) return;
            try {
                setLoading(true);
                setError('');
                const res = await axios.get(`/api/applications/${applicationId}/student-profile`);
                setProfileData(res.data.data || null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load applicant profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [applicationId]);

    if (loading) {
        return (
            <div className="p-8 min-h-[50vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    if (error || !profileData?.student) {
        return (
            <div className="p-8 space-y-6">
                <Link href="/employer/applications" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={16} /> Back to Applications
                </Link>
                <Card className="p-8 border border-danger-100 bg-danger-50">
                    <p className="text-danger-700 font-semibold">{error || 'Applicant profile not found'}</p>
                </Card>
            </div>
        );
    }

    const student = profileData.student;
    const user = student.userId || {};
    const personal = student.personalInfo || {};
    const portfolio = student.portfolio || {};
    const application = profileData.application || {};

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <Link href="/employer/applications" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={16} /> Back to Applications
                </Link>
                <div className="flex items-center gap-2">
                    <Badge variant="info">Match Score: {Math.round(application.matchScore || 0)}%</Badge>
                    <Link href={`/employer/applications/${applicationId}`} className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 hover:text-primary-800 transition-colors">
                        Open Messages
                    </Link>
                </div>
            </div>

            <Card shadow="sm" rounded="lg" padding="lg" className="border border-gray-100">
                <div className="flex items-start gap-5">
                    <Avatar
                        src={student.profileImage?.filePath || user.profilePicture}
                        name={personal.fullName || user.name || 'Student'}
                        size="xl"
                    />
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-gray-900">{personal.fullName || user.name || 'Student'}</h1>
                        <p className="text-sm text-gray-500 font-semibold">{personal.designation || 'Student Applicant'}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                            <Badge variant="secondary">
                                <Briefcase size={12} className="inline mr-1" />
                                {application.internship?.positionTitle || 'Applied Position'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 border border-gray-100">
                    <h2 className="text-lg font-black text-gray-900 mb-4">Contact & Background</h2>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={16} />
                            <span>{personal.email || user.email || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Phone size={16} />
                            <span>{personal.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={16} />
                            <span>{personal.location || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={16} />
                            <span>{application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>

                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mt-8 mb-3">Education</h3>
                    {Array.isArray(student.education) && student.education.length > 0 ? (
                        <div className="space-y-3">
                            {student.education.map((item) => (
                                <div key={item._id} className="rounded-xl border border-gray-100 p-4 bg-gray-50/60">
                                    <p className="font-bold text-gray-900">{item.degree} in {item.field}</p>
                                    <p className="text-sm text-gray-600">{item.institution}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No education details provided.</p>
                    )}
                </Card>

                <Card className="p-6 border border-gray-100">
                    <h2 className="text-lg font-black text-gray-900 mb-4">Skills</h2>
                    {Array.isArray(student.skills) && student.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {student.skills.map((skill) => (
                                <Badge key={skill._id || skill.name} variant="primary" size="sm">
                                    {skill.name}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No skills listed.</p>
                    )}

                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mt-8 mb-3">Links</h3>
                    <div className="space-y-2 text-sm">
                        {portfolio.github && <a href={portfolio.github} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-800 font-semibold block">GitHub</a>}
                        {portfolio.linkedin && <a href={portfolio.linkedin} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-800 font-semibold block">LinkedIn</a>}
                        {portfolio.website && <a href={portfolio.website} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-800 font-semibold block">Website</a>}
                        {!portfolio.github && !portfolio.linkedin && !portfolio.website && (
                            <p className="text-sm text-gray-500">No portfolio links available.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
