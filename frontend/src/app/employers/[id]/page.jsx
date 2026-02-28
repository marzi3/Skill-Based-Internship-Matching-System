'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Building, MapPin, Globe, Briefcase, Calendar, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/common/Badge';

export default function EmployerPublicProfile() {
    const params = useParams();
    const router = useRouter();
    const [employer, setEmployer] = useState(null);
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/api/auth/employers/${params.id}`);
                setEmployer(res.data.data.employer);
                setInternships(res.data.data.internships);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load employer profile');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProfile();
        }
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

    if (error || !employer) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Employer Not Found</h2>
                    <p className="text-gray-500">{error || 'This employer profile may have been removed.'}</p>
                    <button onClick={() => router.back()} className="text-primary-600 font-medium hover:underline flex items-center gap-2">
                        <ArrowLeft size={16} /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
                {/* Back Button */}
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 font-medium text-sm">
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Logo */}
                        <div className="w-32 h-32 flex-shrink-0 rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm flex items-center justify-center">
                            {employer.profilePicture ? (
                                <img src={employer.profilePicture} alt={employer.companyName} className="w-full h-full object-contain p-2" />
                            ) : (
                                <Building className="w-16 h-16 text-gray-300" />
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{employer.companyName || employer.name}</h1>
                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                    {employer.verificationStatus === 'approved' && (
                                        <Badge variant="success">Verified Employer</Badge>
                                    )}
                                    {employer.website && (
                                        <a href={employer.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
                                            <Globe size={16} /> {employer.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="prose prose-sm text-gray-600 max-w-none">
                                {employer.companyDescription ? (
                                    <p className="leading-relaxed">{employer.companyDescription}</p>
                                ) : (
                                    <p className="italic text-gray-400">No description provided.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Internships Section */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Briefcase className="text-primary-600" size={24} />
                        Active Postings <span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full ml-2">{internships.length}</span>
                    </h2>

                    {internships.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {internships.map(internship => (
                                <Link href={`/internships/${internship._id}`} key={internship._id} className="block group">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer h-full flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors text-lg line-clamp-2">
                                                {internship.positionTitle}
                                            </h3>
                                        </div>

                                        <div className="space-y-2 mt-auto">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="text-gray-400" size={16} />
                                                <span>{internship.locationType === 'Remote' ? 'Remote' : (internship.location || 'Location specified in posting')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="text-gray-400" size={16} />
                                                <span>{internship.duration}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-2">
                                            {internship.requiredSkills?.slice(0, 3).map((skill, i) => (
                                                <span key={i} className="text-xs font-medium px-2.5 py-1 bg-primary-50 text-primary-700 rounded-md">
                                                    {typeof skill === 'string' ? skill : skill.name}
                                                </span>
                                            ))}
                                            {internship.requiredSkills?.length > 3 && (
                                                <span className="text-xs font-medium px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md">
                                                    +{internship.requiredSkills.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center text-gray-500">
                            {employer.companyName} does not have any active internship postings at the moment.
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
