'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FileText,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    Loader,
    ArrowRight
} from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';

export default function StudentApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await axios.get('/api/students/applications');
                setApplications(res.data.data || []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Selected': return 'success';
            case 'Rejected': return 'danger';
            case 'Interview': return 'info';
            default: return 'warning';
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Applied Protocols</h1>
                <p className="text-gray-500 font-medium">Tracking your active synchronization requests across the network</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center"><Loader className="animate-spin mx-auto text-primary-600" size={32} /></div>
                ) : applications.length > 0 ? (
                    applications.map((app) => (
                        <Card key={app._id} className="hover:border-primary-200 transition-all border border-gray-100 p-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 border border-gray-100">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg uppercase tracking-tight">{app.internship?.positionTitle}</h3>
                                        <p className="text-primary-600 font-bold text-sm tracking-widest">{app.internship?.employer?.companyName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12 text-sm">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</span>
                                        <Badge variant={getStatusStyle(app.status)}>{app.status}</Badge>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Applied</span>
                                        <span className="text-gray-900 font-bold">{new Date(app.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button className="px-6 py-2 text-primary-600 font-black uppercase text-[10px] tracking-widest hover:underline transition-all">
                                        View Spec
                                    </button>
                                    <button className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="py-20 text-center space-y-4 border-dashed border-2">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No active applications detected.</p>
                        <button className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:bg-primary-700">
                            Browse Internships
                        </button>
                    </Card>
                )}
            </div>
        </div>
    );
}
