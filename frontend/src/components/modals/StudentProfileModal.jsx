'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    X,
    Mail,
    MapPin,
    Phone,
    Github,
    Linkedin,
    GraduationCap,
    Briefcase,
    Code2,
    Sparkles,
    ExternalLink,
    Send,
    AlertCircle,
    CheckCircle,
    UserCircle2
} from 'lucide-react';
import axios from '@/services/apiClient';

export default function StudentProfileModal({ isOpen, student, profile, onClose, isEmployer = false }) {
    const [messageText, setMessageText] = useState('');
    const [messageSending, setMessageSending] = useState(false);
    const [messageStatus, setMessageStatus] = useState(null);
    const [showComposer, setShowComposer] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [fullUser, setFullUser] = useState(null);
    const [fullProfile, setFullProfile] = useState(null);
    const [profileError, setProfileError] = useState('');
    const [showAllSkills, setShowAllSkills] = useState(false);

    useEffect(() => {
        if (!isOpen || !student?._id) return;

        let isMounted = true;
        const loadStudentProfile = async () => {
            setProfileLoading(true);
            setProfileError('');
            try {
                const res = await axios.get(`/auth/students/${student._id}`);
                if (!isMounted) return;

                const data = res?.data?.data || {};
                setFullUser(data.user || null);
                setFullProfile(data.profile || null);
            } catch (err) {
                if (!isMounted) return;
                setProfileError(err?.response?.data?.message || 'Failed to load full profile details');
            } finally {
                if (isMounted) {
                    setProfileLoading(false);
                }
            }
        };

        loadStudentProfile();

        return () => {
            isMounted = false;
        };
    }, [isOpen, student?._id]);

    useEffect(() => {
        if (!isOpen) {
            setShowAllSkills(false);
        }
    }, [isOpen]);

    const profileData = useMemo(() => fullProfile || profile || {}, [fullProfile, profile]);
    const userData = useMemo(() => fullUser || student || {}, [fullUser, student]);

    const githubRaw = profileData?.portfolio?.github || profileData?.socialLinks?.github || '';
    const linkedinRaw = profileData?.portfolio?.linkedin || profileData?.socialLinks?.linkedin || '';

    const githubUrl = githubRaw
        ? (githubRaw.startsWith('http') ? githubRaw : `https://github.com/${githubRaw.replace(/^@/, '')}`)
        : '';
    const linkedinUrl = linkedinRaw
        ? (linkedinRaw.startsWith('http') ? linkedinRaw : `https://linkedin.com/in/${linkedinRaw.replace(/^@/, '')}`)
        : '';

    const skillNames = (profileData?.skills || []).map((skill) => skill?.name || skill).filter(Boolean);
    const visibleSkills = showAllSkills ? skillNames : skillNames.slice(0, 4);
    const hiddenSkillCount = Math.max(skillNames.length - visibleSkills.length, 0);

    const topEducation = profileData?.education?.[0] || null;
    const topProject = profileData?.projects?.[0] || null;

    const email = userData?.email || student?.email || '';
    const location =
        userData?.location ||
        profileData?.personalInfo?.location ||
        student?.location ||
        'Location not provided';
    const phone = profileData?.personalInfo?.phone || student?.phone || '';
    const title = profileData?.personalInfo?.designation || 'Student Candidate';

    const handleSendMessage = async () => {
        if (!messageText.trim()) {
            setMessageStatus({ type: 'error', text: 'Message cannot be empty' });
            return;
        }

        setMessageSending(true);
        setMessageStatus(null);

        try {
            await axios.post(`/messaging/send`, {
                recipientId: student._id,
                subject: `Message from employer to ${userData?.name || student?.name || 'student'}`,
                message: messageText,
                type: 'employer_inquiry'
            });
            setMessageStatus({ type: 'success', text: 'Message sent successfully!' });
            setMessageText('');
            setTimeout(() => setMessageStatus(null), 3000);
        } catch (err) {
            setMessageStatus({
                type: 'error',
                text: err.response?.data?.message || 'Failed to send message'
            });
        } finally {
            setMessageSending(false);
        }
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
            <div className="relative max-h-[92vh] w-full max-w-md overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-20 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
                >
                    <X size={18} />
                </button>

                <div className="max-h-[92vh] overflow-y-auto">
                    <div className="border-b border-slate-100 px-6 pb-5 pt-8 text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.8rem] bg-slate-100 shadow-inner">
                            {userData?.profilePicture ? (
                                <img src={userData.profilePicture} alt={userData?.name} className="h-full w-full object-cover" />
                            ) : (
                                <UserCircle2 size={44} className="text-slate-500" />
                            )}
                        </div>
                        <h2 className="text-[2rem] font-black leading-none text-slate-900">
                            {userData?.name || student?.name}
                        </h2>
                        <p className="mt-1 text-[11px] font-black uppercase tracking-[0.13em] text-indigo-600">
                            {email}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{title}</p>
                    </div>

                    <div className="space-y-7 px-6 py-6">
                        <div className="space-y-3 text-slate-700">
                            {isEmployer ? (
                                <button
                                    type="button"
                                    onClick={() => setShowComposer(true)}
                                    className="flex w-full cursor-pointer items-center gap-3 text-left"
                                    title="Click to send a message"
                                >
                                    <Mail size={18} className="text-slate-500" />
                                    <span className="text-[1.05rem] leading-tight hover:text-indigo-600">{email}</span>
                                </button>
                            ) : (
                                <a href={`mailto:${email}`} className="flex items-center gap-3 text-[1.05rem] leading-tight hover:text-indigo-600">
                                    <Mail size={18} className="text-slate-500" />
                                    {email}
                                </a>
                            )}

                            {phone && (
                                <a href={`tel:${phone}`} className="flex items-center gap-3 text-[1.05rem] leading-tight hover:text-indigo-600">
                                    <Phone size={18} className="text-slate-500" />
                                    {phone}
                                </a>
                            )}

                            <div className="flex items-center gap-3 text-[1.05rem] leading-tight">
                                <MapPin size={18} className="text-slate-500" />
                                {location}
                            </div>
                        </div>

                        {isEmployer && showComposer && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <h3 className="mb-2 text-sm font-black uppercase tracking-[0.08em] text-slate-700">Send Message</h3>

                                {messageStatus && (
                                    <div
                                        className={`mb-3 flex items-center gap-2 rounded-lg border p-2.5 text-sm ${
                                            messageStatus.type === 'success'
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                : 'border-rose-200 bg-rose-50 text-rose-700'
                                        }`}
                                    >
                                        {messageStatus.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                                        {messageStatus.text}
                                    </div>
                                )}

                                <textarea
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder="Write your message..."
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleSendMessage}
                                    disabled={messageSending}
                                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Send size={14} />
                                    {messageSending ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        )}

                        {(githubUrl || linkedinUrl) && (
                            <section>
                                <h3 className="mb-3 text-2xl font-black leading-none text-slate-900">Links</h3>
                                <div className="space-y-2.5">
                                    {githubUrl && (
                                        <a
                                            href={githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between rounded-xl px-1 py-1.5 transition-colors hover:bg-slate-50"
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                                                    <Github size={20} className="text-slate-800" />
                                                </span>
                                                <span className="text-2xl font-semibold leading-none text-slate-800">GitHub</span>
                                            </span>
                                            <ExternalLink size={16} className="text-slate-500" />
                                        </a>
                                    )}

                                    {linkedinUrl && (
                                        <a
                                            href={linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between rounded-xl px-1 py-1.5 transition-colors hover:bg-slate-50"
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                                                    <Linkedin size={20} className="text-[#0A66C2]" />
                                                </span>
                                                <span className="text-2xl font-semibold leading-none text-slate-800">LinkedIn</span>
                                            </span>
                                            <ExternalLink size={16} className="text-slate-500" />
                                        </a>
                                    )}
                                </div>
                            </section>
                        )}

                        {skillNames.length > 0 && (
                            <section>
                                <h3 className="mb-3 text-2xl font-black leading-none text-slate-900">Skills</h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {visibleSkills.map((name, idx) => (
                                        <span
                                            key={`${name}-${idx}`}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-4 py-2 text-[1.12rem] font-semibold leading-none text-indigo-700"
                                        >
                                            <Code2 size={14} />
                                            {name}
                                        </span>
                                    ))}
                                    {hiddenSkillCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllSkills(true)}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-[1.12rem] font-semibold leading-none text-slate-700"
                                        >
                                            <Sparkles size={14} />
                                            +{hiddenSkillCount} more
                                        </button>
                                    )}
                                    {showAllSkills && skillNames.length > 4 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllSkills(false)}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-[1rem] font-semibold leading-none text-slate-700"
                                        >
                                            Show less
                                        </button>
                                    )}
                                </div>
                            </section>
                        )}

                        {topEducation && (
                            <section>
                                <h3 className="mb-3 text-2xl font-black leading-none text-slate-900">Education</h3>
                                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-4">
                                    <div className="flex items-start gap-2.5">
                                        <GraduationCap size={18} className="mt-0.5 text-slate-800" />
                                        <div>
                                            <p className="text-[1.3rem] font-semibold leading-tight text-indigo-900">
                                                {(topEducation.degree || '').toLowerCase() || 'Education'}
                                            </p>
                                            <p className="mt-1 text-[1.35rem] leading-snug text-indigo-700">
                                                {topEducation.institution || 'Institution not specified'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {topProject && (
                            <section>
                                <h3 className="mb-3 text-2xl font-black leading-none text-slate-900">Projects</h3>
                                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-4">
                                    <div className="flex items-center gap-2.5">
                                        <Briefcase size={18} className="text-indigo-700" />
                                        <p className="text-[1.35rem] font-semibold leading-tight text-indigo-900">
                                            {topProject.title || topProject.name || topProject.projectName || 'Project'}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {profileLoading && <p className="text-sm text-slate-500">Loading full profile...</p>}
                        {!profileLoading && profileError && (
                            <p className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-sm text-rose-700">{profileError}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
