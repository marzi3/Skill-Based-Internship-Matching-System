'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, MessageSquare, Send, Loader2, Clock3 } from 'lucide-react';

import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Form from '@/components/common/Form';
import { AlertModal, FormModal } from '@/components/common/Modal';

const STATUS_FLOW = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'ACCEPTED'];

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

export default function ApplicationDetail() {
    const params = useParams();
    const id = params?.id;

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submittingMessage, setSubmittingMessage] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [withdrawReason, setWithdrawReason] = useState('');
    const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    const fetchApplication = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await axios.get(`/api/applications/${id}`);
            setApplication(res.data.data || null);
        } catch (error) {
            setAlert({
                isOpen: true,
                title: 'Load Failed',
                message: error.response?.data?.message || 'Unable to load application details',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplication();
    }, [id]);

    const timeline = useMemo(() => {
        const history = Array.isArray(application?.statusHistory) ? [...application.statusHistory] : [];
        if (history.length === 0 && application?.status) {
            history.push({
                status: application.status,
                changedAt: application.createdAt,
                note: 'Initial status'
            });
        }

        return history.sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));
    }, [application]);

    const currentStatus = normalizeStatus(application?.status || 'SUBMITTED');

    const canWithdraw = !['ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(currentStatus);

    const handleSendMessage = async (values) => {
        try {
            setSubmittingMessage(true);
            await axios.post(`/api/applications/${id}/messages`, { content: values.content });
            await fetchApplication();
            setAlert({
                isOpen: true,
                title: 'Message Sent',
                message: 'Your message was added to the application thread.',
                type: 'success'
            });
        } catch (error) {
            setAlert({
                isOpen: true,
                title: 'Message Failed',
                message: error.response?.data?.message || 'Failed to send message',
                type: 'error'
            });
        } finally {
            setSubmittingMessage(false);
        }
    };

    const handleWithdraw = async () => {
        try {
            setWithdrawing(true);
            await axios.patch(`/api/applications/${id}/withdraw`, { reason: withdrawReason });
            setWithdrawModalOpen(false);
            setWithdrawReason('');
            await fetchApplication();
            setAlert({
                isOpen: true,
                title: 'Application Withdrawn',
                message: 'Your application has been withdrawn successfully.',
                type: 'success'
            });
        } catch (error) {
            setAlert({
                isOpen: true,
                title: 'Withdraw Failed',
                message: error.response?.data?.message || 'Failed to withdraw application',
                type: 'error'
            });
        } finally {
            setWithdrawing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={30} />
            </div>
        );
    }

    if (!application) {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                <Card className="p-12 text-center">
                    <h2 className="text-xl font-bold text-gray-900">Application not found</h2>
                    <div className="mt-6">
                        <Link href="/applications">
                            <Button variant="primary">Back to Applications</Button>
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <Link href="/applications" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={16} /> Back to Applications
                </Link>
                {canWithdraw && (
                    <Button variant="danger" onClick={() => setWithdrawModalOpen(true)}>
                        Withdraw Application
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 border border-slate-100">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Application Detail</p>
                    <h1 className="mt-2 text-2xl font-black text-slate-900">{application.internship?.positionTitle}</h1>
                    <p className="mt-1 text-sm text-slate-500 font-semibold">{application.internship?.company || application.employer?.companyName || 'Company'}</p>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <Badge variant={statusVariant(application.status)}>{STATUS_LABELS[currentStatus] || application.status}</Badge>
                        <Badge variant="info">Match Score: {Math.round(application.matchScore || 0)}%</Badge>
                        <Badge variant="secondary">Tier: {application.matchTier || 'UNKNOWN'}</Badge>
                    </div>

                    {application.coverLetter && (
                        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Cover Letter Snapshot</p>
                            <p className="text-sm text-slate-700 whitespace-pre-line">{application.coverLetter}</p>
                        </div>
                    )}
                </Card>

                <Card className="p-6 border border-slate-100">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Timeline</p>
                    <div className="mt-4 space-y-4">
                        {STATUS_FLOW.map((statusStep) => {
                            const stepIndex = STATUS_FLOW.indexOf(statusStep);
                            const currentIndex = STATUS_FLOW.indexOf(currentStatus);
                            const active = currentIndex >= 0 ? stepIndex <= currentIndex : false;

                            return (
                                <div key={statusStep} className="flex items-center gap-3">
                                    <div className={`w-3.5 h-3.5 rounded-full ${active ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                                    <p className={`text-sm font-semibold ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                                        {STATUS_LABELS[statusStep] || statusStep}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            <Card className="p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-5">
                    <Clock3 size={18} className="text-slate-500" />
                    <h2 className="text-lg font-black text-slate-900">Status History (Immutable)</h2>
                </div>

                <div className="space-y-3">
                    {timeline.map((entry, idx) => (
                        <div key={`${entry.status}-${entry.changedAt}-${idx}`} className="rounded-xl border border-slate-100 p-4 bg-white">
                            <div className="flex flex-wrap justify-between gap-3">
                                <Badge variant={statusVariant(entry.status)}>{STATUS_LABELS[normalizeStatus(entry.status)] || entry.status}</Badge>
                                <p className="text-xs text-slate-500 font-semibold">{new Date(entry.changedAt).toLocaleString()}</p>
                            </div>
                            {entry.note && <p className="text-sm text-slate-600 mt-2">{entry.note}</p>}
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-5">
                    <MessageSquare size={18} className="text-slate-500" />
                    <h2 className="text-lg font-black text-slate-900">Application Messages</h2>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {(application.messages || []).length === 0 ? (
                        <p className="text-sm text-slate-500">No messages yet.</p>
                    ) : (
                        application.messages.map((message, idx) => (
                            <div key={`${message.createdAt}-${idx}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <div className="flex flex-wrap justify-between gap-2 mb-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                                        {message.sender?.name || message.senderRole}
                                    </p>
                                    <p className="text-xs text-slate-400">{new Date(message.createdAt).toLocaleString()}</p>
                                </div>
                                <p className="text-sm text-slate-700 whitespace-pre-line">{message.content}</p>
                            </div>
                        ))
                    )}
                </div>

                {currentStatus !== 'WITHDRAWN' && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <Form
                            fields={[
                                {
                                    name: 'content',
                                    label: 'Send a message',
                                    type: 'textarea',
                                    required: true,
                                    rows: 4,
                                    placeholder: 'Write your message to the employer...'
                                }
                            ]}
                            initialValues={{ content: '' }}
                            onSubmit={handleSendMessage}
                            submitLabel={submittingMessage ? 'Sending...' : 'Send Message'}
                            className="space-y-2"
                        />
                        <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                            <Send size={12} /> Messages are stored in this application thread.
                        </div>
                    </div>
                )}
            </Card>

            <FormModal
                isOpen={withdrawModalOpen}
                onClose={() => setWithdrawModalOpen(false)}
                onSubmit={handleWithdraw}
                title="Withdraw Application"
                submitText={withdrawing ? 'Withdrawing...' : 'Confirm Withdraw'}
                loading={withdrawing}
            >
                <div className="space-y-3">
                    <p className="text-sm text-slate-600">Provide a reason for withdrawing this application.</p>
                    <textarea
                        value={withdrawReason}
                        onChange={(e) => setWithdrawReason(e.target.value)}
                        rows={4}
                        maxLength={1000}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none"
                        placeholder="Optional reason"
                    />
                </div>
            </FormModal>

            <AlertModal
                isOpen={alert.isOpen}
                onClose={() => setAlert((prev) => ({ ...prev, isOpen: false }))}
                title={alert.title}
                message={alert.message}
                type={alert.type}
            />
        </div>
    );
}
