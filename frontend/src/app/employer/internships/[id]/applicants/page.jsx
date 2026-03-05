'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from '@/services/apiClient';
import {
    ArrowLeft,
    Users,
    Search,
    Filter,
    Loader,
    AlertTriangle
} from 'lucide-react';
import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';

export default function ApplicantsListPage() {
    const { id } = useParams();
    const router = useRouter();
    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`/api/internships/${id}`);
                setInternship(res.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch applicants');
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader className="animate-spin text-primary-600" size={48} />
        </div>
    );

    return (
        <div className="p-8 space-y-8">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-all">
                <ArrowLeft size={20} /> Back to Details
            </button>

            <div>
                <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
                <p className="text-gray-500">Reviewing submissions for <span className="text-primary-600 font-bold">{internship?.positionTitle}</span></p>
            </div>

            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search candidates by name or skill..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                    />
                </div>
                <button className="px-6 py-3 border border-gray-200 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
                    <Filter size={20} /> Filter
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {internship?.applicants?.length > 0 ? (
                    internship.applicants.map((applicant) => (
                        <Card key={applicant._id} padding="lg" className="hover:shadow-lg transition-all border border-gray-100 group">
                            <div className="flex items-center gap-4 mb-6">
                                <Avatar name={applicant.name} size="lg" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${applicant.name}`} />
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{applicant.name}</h3>
                                    <p className="text-gray-500 text-sm font-medium">{applicant.email}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                    <span className="text-xs font-black uppercase text-gray-400">Match Score</span>
                                    <span className="text-primary-600 font-black">88%</span>
                                </div>

                                <button
                                    onClick={() => router.push(`/employer/candidates/${applicant._id}`)}
                                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md mt-2"
                                >
                                    View Full Profile
                                </button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <Users className="mx-auto text-gray-200" size={64} />
                        <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">No candidates have applied yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
