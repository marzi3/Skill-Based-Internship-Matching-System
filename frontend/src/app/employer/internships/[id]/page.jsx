'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from '@/services/apiClient';
import {
    ArrowLeft,
    MapPin,
    Clock,
    Users,
    Calendar,
    Briefcase,
    AlertTriangle,
    Loader
} from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';

export default function InternshipDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInternship = async () => {
            try {
                const res = await axios.get(`/api/internships/${id}`);
                setInternship(res.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch internship details');
                setLoading(false);
            }
        };
        if (id) fetchInternship();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader className="animate-spin text-primary-600" size={48} />
        </div>
    );

    if (error) return (
        <div className="p-8">
            <Card className="bg-rose-50 border-rose-100 p-8 text-center">
                <AlertTriangle className="mx-auto text-rose-500 mb-4" size={48} />
                <h2 className="text-xl font-bold text-rose-900 mb-2">Access Denied</h2>
                <p className="text-rose-700">{error}</p>
                <button onClick={() => router.back()} className="mt-4 text-primary-600 font-bold underline">Go Back</button>
            </Card>
        </div>
    );

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-all">
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-4">
                    <Badge variant={internship.status === 'Hiring' ? 'success' : 'warning'}>{internship.status}</Badge>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">{internship.positionTitle}</h1>
                    <div className="flex flex-wrap gap-4 text-gray-500 font-medium">
                        <div className="flex items-center gap-1"><Briefcase size={16} /> {internship.domain}</div>
                        <div className="flex items-center gap-1"><MapPin size={16} /> {internship.workEnvironment}</div>
                        <div className="flex items-center gap-1"><Clock size={16} /> {internship.duration} Months</div>
                        <div className="flex items-center gap-1"><Calendar size={16} /> Expires: {new Date(internship.expiryDate).toLocaleDateString()}</div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push(`/employer/internships/${id}/edit`)}
                        className="px-8 py-3 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                    >
                        Edit Posting
                    </button>
                    <button
                        onClick={() => router.push(`/employer/internships/${id}/applicants`)}
                        className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg"
                    >
                        View Applicants ({internship.applicants?.length || 0})
                    </button>
                </div>
            </div>

            <Card padding="lg" className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Description</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{internship.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {internship.requiredSkills?.map(skill => (
                                <Badge key={skill.name} variant="secondary">{skill.name}{skill.mandatory ? ' *' : ''}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Perks & Benefits</h3>
                        <div className="flex flex-wrap gap-2">
                            {internship.perks?.map(perk => (
                                <Badge key={perk} variant="info">{perk}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
