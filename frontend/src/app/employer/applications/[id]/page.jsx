'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Loader2, MessageSquare, Send, User } from 'lucide-react';

import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

const STATUS_LABELS = {
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    SHORTLISTED: 'Shortlisted',
    INTERVIEW: 'Interview',
    OFFERED: 'Offered',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
    APPLIED: 'Submitted',
    REVIEWING: 'Under Review',
    INTERVIEWING: 'Interview',
    SELECTED: 'Accepted'
};

const normalizeStatus = (status = '') => {
    const normalized = status.toUpperCase().replace(/\s+/g, '_');
    if (normalized === 'APPLIED') return 'SUBMITTED';
    if (normalized === 'REVIEWING') return 'UNDER_REVIEW';
    if (normalized === 'INTERVIEWING') return 'INTERVIEW';
    if (normalized === 'SELECTED') return 'ACCEPTED';
    return normalized;
};

const statusVariant = (status) => {
    const normalized = normalizeStatus(status);
    if (['ACCEPTED', 'OFFERED'].includes(normalized)) return 'success';
    if (['REJECTED', 'WITHDRAWN'].includes(normalized)) return 'danger';
    if (['INTERVIEW'].includes(normalized)) return 'info';
    if (['UNDER_REVIEW', 'SHORTLISTED', 'SUBMITTED'].includes(normalized)) return 'warning';
    return 'secondary';
};

export default function EmployerApplicationDetail() {
    const params = useParams();
    const id = params?.id;

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const fetchApplication = async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError('');
            const res = await axios.get(`/api/applications/${id}`);
            setApplication(res.data.data || null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplication();
    }, [id]);

    const orderedMessages = useMemo(() => {
        const items = Array.isArray(application?.messages) ? [...application.messages] : [];
        return items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }, [application]);

    const handleSendMessage = async () => {
        const content = message.trim();
        if (!content) return;
        try {
            setSending(true);
            await axios.post(`/api/applications/${id}/messages`, { content });
            setMessage('');
            await fetchApplication();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 min-h-[50vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="p-8 space-y-6">
                <Link href="/employer/applications" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={16} /> Back to Applications
                </Link>
                <Card className="p-8 border border-danger-100 bg-danger-50">
                    <p className="text-danger-700 font-semibold">{error || 'Application not found'}</p>
                </Card>
            </div>
        );
    }

    const currentStatus = normalizeStatus(application.status || 'SUBMITTED');

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <Link href="/employer/applications" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={16} /> Back to Applications
                </Link>
                <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(application.status)}>{STATUS_LABELS[currentStatus] || application.status}</Badge>
                    <Badge variant="info">Match Score: {Math.round(application.matchScore || 0)}%</Badge>
                    <Link href={`/employer/applications/${id}/profile`}>
                        <Button variant="secondary">View Applicant Profile</Button>
                    </Link>
                </div>
            </div>

            <Card className="p-6 border border-slate-100">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Application</p>
                <h1 className="mt-2 text-2xl font-black text-slate-900">{application.internship?.positionTitle || 'Applied Position'}</h1>
                <p className="mt-1 text-sm text-slate-500 font-semibold">{application.student?.name || 'Student'} • {application.internship?.company || 'Company'}</p>
            </Card>

            <Card className="p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-5">
                    <MessageSquare size={18} className="text-slate-500" />
                    <h2 className="text-lg font-black text-slate-900">Application Messages</h2>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {orderedMessages.length === 0 ? (
                        <p className="text-sm text-slate-500">No messages yet.</p>
                    ) : (
                        orderedMessages.map((entry, idx) => (
                            <div key={`${entry.createdAt}-${idx}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <div className="flex flex-wrap justify-between gap-2 mb-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 inline-flex items-center gap-1">
                                        <User size={12} /> {entry.sender?.name || entry.senderRole || 'User'}
                                    </p>
                                    <p className="text-xs text-slate-500 font-semibold">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}</p>
                                </div>
                                <p className="text-sm text-slate-700 whitespace-pre-line">{entry.content}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-5 space-y-3">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        placeholder="Write a message to this applicant..."
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex justify-end">
                        <Button variant="primary" onClick={handleSendMessage} disabled={sending || !message.trim()}>
                            <span className="inline-flex items-center gap-2">
                                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                Send Message
                            </span>
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
