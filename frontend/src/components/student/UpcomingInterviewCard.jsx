'use client';

import { AlertCircle, CalendarDays, Clock, MapPin } from 'lucide-react';
import Card from '@/components/common/Card';

export default function UpcomingInterviewCard({
    app,
    statusLabel,
    countdownLabel,
    formatDate,
    getLocationText,
    onViewApplication
}) {
    const formatInterviewTime = (value) => {
        if (!value) return 'To be confirmed';

        const raw = String(value).trim();
        if (/\b(am|pm)\b/i.test(raw)) return raw.toUpperCase();

        const match = raw.match(/^(\d{1,2}):(\d{2})$/);
        if (!match) return raw;

        let hours = Number(match[1]);
        const minutes = match[2];
        const suffix = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        return `${hours}:${minutes} ${suffix}`;
    };

    return (
        <Card className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-5">
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-slate-900">
                        {app.employer?.companyName}
                    </p>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-emerald-700">
                            {statusLabel}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                            {countdownLabel}
                        </span>
                    </div>
                </div>

                <h3 className="text-lg font-black uppercase tracking-[0.04em] text-slate-900 md:text-xl">
                    {app.internship?.positionTitle}
                </h3>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            <CalendarDays size={13} /> Date
                        </div>
                        <p className="text-sm font-bold text-slate-900">{formatDate(app.interviewDetails?.date)}</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            <Clock size={13} /> Time
                        </div>
                        <p className="text-sm font-bold text-slate-900">{formatInterviewTime(app.interviewDetails?.time)}</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            <MapPin size={13} /> Location
                        </div>
                        <p className="text-sm font-bold text-slate-900 break-words">{getLocationText(app)}</p>
                    </div>
                </div>

                {app.interviewDetails?.notes?.trim() && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.06em] text-amber-800">
                            <AlertCircle size={14} /> Instructions
                        </p>
                        <p className="text-sm font-medium leading-relaxed text-amber-900 whitespace-pre-wrap">
                            {app.interviewDetails.notes}
                        </p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewApplication();
                    }}
                    className="group/cta inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.06em] text-white transition-all duration-300 hover:scale-[1.01] hover:bg-slate-800"
                >
                    <span>View Application</span>
                    <span className="transition-transform duration-300 group-hover/cta:translate-x-1">-&gt;</span>
                </button>
            </div>
        </Card>
    );
}
