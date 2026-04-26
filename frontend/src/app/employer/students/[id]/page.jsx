'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    ChevronLeft,
    Mail,
    MapPin,
    Phone,
    UserCircle2,
    GraduationCap,
    Code2,
    Briefcase,
    ExternalLink,
    FileText,
    Download,
    Award,
    Loader2,
    CircleUserRound,
    BookOpenText,
    Building2,
    ChevronRight,
    X,
    Eye,
    Paperclip,
    CalendarDays
} from 'lucide-react';
import { FaEnvelope, FaPhone, FaLocationDot, FaGithub, FaLinkedin } from 'react-icons/fa6';
import axios from '@/services/apiClient';
import Card from '@/components/common/Card';

const getBaseUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    try {
        return new URL(apiUrl).origin;
    } catch {
        return apiUrl.includes('/api/v1') ? apiUrl.replace('/api/v1', '') : apiUrl;
    }
};

const resolveAssetUrl = (filePath) => {
    if (!filePath) return '';
    const value = String(filePath).trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;

    const normalizedPath = value.replace(/\\/g, '/');
    const uploadsIndex = normalizedPath.toLowerCase().indexOf('/uploads/');

    if (uploadsIndex >= 0) {
        const publicPath = normalizedPath.slice(uploadsIndex).replace(/\/+/g, '/');
        return `${getBaseUrl()}${publicPath.startsWith('/') ? '' : '/'}${publicPath}`;
    }

    return `${getBaseUrl()}/${normalizedPath.replace(/^\/+/, '')}`;
};

const safeLink = (url) => {
    const raw = String(url || '').trim();
    if (!raw) return '';
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

const getMailtoHref = (email = '') => {
    const trimmed = String(email).trim();
    return trimmed ? `mailto:${trimmed}` : '';
};

const isImageAsset = (url = '', mimeType = '') => {
    const cleanUrl = String(url || '').toLowerCase();
    const cleanMime = String(mimeType || '').toLowerCase();
    return cleanMime.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/.test(cleanUrl);
};

export default function EmployerStudentProfilePage({ params }) {
    const { id } = use(params);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [studentData, setStudentData] = useState(null);
    const [viewerState, setViewerState] = useState({
        open: false,
        images: [],
        index: 0
    });

    const openProjectImageViewer = (images = [], index = 0) => {
        if (!Array.isArray(images) || images.length === 0) return;
        const safeIndex = Math.max(0, Math.min(index, images.length - 1));
        setViewerState({
            open: true,
            images,
            index: safeIndex
        });
    };

    const closeProjectImageViewer = () => {
        setViewerState((prev) => ({ ...prev, open: false }));
    };

    const showNextImage = () => {
        setViewerState((prev) => {
            if (!prev.images.length) return prev;
            return {
                ...prev,
                index: (prev.index + 1) % prev.images.length
            };
        });
    };

    const showPreviousImage = () => {
        setViewerState((prev) => {
            if (!prev.images.length) return prev;
            return {
                ...prev,
                index: (prev.index - 1 + prev.images.length) % prev.images.length
            };
        });
    };

    useEffect(() => {
        if (!viewerState.open) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') closeProjectImageViewer();
            if (event.key === 'ArrowRight') showNextImage();
            if (event.key === 'ArrowLeft') showPreviousImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewerState.open]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await axios.get(`/auth/students/${id}`);
                setStudentData(res?.data?.data || null);
            } catch (err) {
                setError(err?.response?.data?.message || 'Failed to load student profile');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadProfile();
        }
    }, [id]);

    const user = studentData?.user || {};
    const profile = studentData?.profile || {};
    const personal = profile?.personalInfo || {};

    const toArray = (value) => {
        if (Array.isArray(value)) return value.filter(Boolean);
        if (typeof value === 'string' && value.trim()) return [value.trim()];
        return [];
    };

    const profileImage = useMemo(() => {
        return resolveAssetUrl(user?.profilePicture) || resolveAssetUrl(profile?.profileImage?.filePath);
    }, [profile?.profileImage?.filePath, user?.profilePicture]);
    const coverImage = useMemo(() => {
        return resolveAssetUrl(profile?.coverImage?.filePath);
    }, [profile?.coverImage?.filePath]);

    const resumeUrl = resolveAssetUrl(profile?.resume?.filePath);
    const gpaRaw = personal?.gpa;
    const gpaDisplay = (() => {
        if (gpaRaw === undefined || gpaRaw === null || String(gpaRaw).trim() === '') return 'Not provided';
        const normalized = String(gpaRaw).trim();
        return /\/\s*4(\.0)?$/i.test(normalized) ? normalized : `${normalized} / 4.0`;
    })();
    const seniority = (personal?.seniority || profile?.seniority || []).join(', ') || 'Not provided';
    const normalizedWorkMode =
        toArray(profile?.preferences?.workMode).length > 0
            ? toArray(profile?.preferences?.workMode)
            : (toArray(personal?.preferredLocation).length > 0
                ? toArray(personal?.preferredLocation)
                : toArray(profile?.workMode));
    const displayWorkModes = normalizedWorkMode.length > 0 ? normalizedWorkMode : ['Not provided'];

    const onlineCertifications = toArray(profile?.certifications);
    const uploadedCertificateFiles =
        toArray(profile?.uploadedCertificates).length > 0
            ? toArray(profile?.uploadedCertificates)
            : toArray(profile?.uploadedCertificateFiles);

    const displayName = user?.name || personal?.fullName || 'Student';
    const displayEmail = user?.email || personal?.email || 'Not provided';
    const displayEmailHref = getMailtoHref(displayEmail);
    const displayPhone = personal?.phone || 'Not provided';
    const displayLocation = user?.location || personal?.location || 'Not provided';
    const displayAbout = personal?.about || 'Not provided';
    const githubUrl = safeLink(
        personal?.github ||
        profile?.portfolio?.github ||
        profile?.github ||
        ''
    );
    const linkedinUrl = safeLink(
        personal?.linkedin ||
        profile?.portfolio?.linkedin ||
        profile?.linkedin ||
        ''
    );
    const primaryEducation = Array.isArray(profile?.education) && profile.education.length > 0 ? profile.education[0] : null;
    const displayEducation = primaryEducation
        ? `${primaryEducation.degree || 'Degree'}${primaryEducation.field ? ` in ${primaryEducation.field}` : ''}${primaryEducation.institution ? ` • ${primaryEducation.institution}` : ''}`
        : 'Not provided';
    const resumeDisplayName = (() => {
        const explicit = profile?.resume?.fileName;
        if (explicit) return explicit;

        const rawPath = String(profile?.resume?.filePath || '').trim();
        if (!rawPath) return 'resume.pdf';

        const cleanPath = rawPath.split('?')[0];
        const lastSegment = cleanPath.split('/').filter(Boolean).pop();
        return lastSegment || 'resume.pdf';
    })();
    const currentViewerImage = viewerState.images[viewerState.index] || null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#f2f6fb] via-[#edf2f8] to-[#e6edf6] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !studentData) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#f2f6fb] via-[#edf2f8] to-[#e6edf6] flex items-center justify-center p-6">
                <Card rounded="3xl" padding="8" className="max-w-xl w-full text-center">
                    <h1 className="text-2xl font-black text-slate-900">Unable to Load Student Profile</h1>
                    <p className="text-sm text-slate-600 mt-3">{error || 'Profile not found'}</p>
                    <Link
                        href="/employer/applications"
                        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider"
                    >
                        <ArrowLeft size={14} /> Back to Applications
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#dde6f0] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <Link
                    href="/employer/applications"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-slate-100 px-5 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-slate-600 shadow-sm hover:text-slate-900"
                >
                    <ArrowLeft size={14} /> Back to Applications
                </Link>

                <Card rounded="xl" padding="0" className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                    <div className="h-56 sm:h-64 relative group bg-slate-900/5">
                        {coverImage ? (
                            <img
                                src={coverImage}
                                alt={`${displayName} cover`}
                                className="w-full h-full object-cover object-center"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-600" />
                        )}
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute top-2 right-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow-md">
                            <Building2 size={16} />
                        </div>
                    </div>

                    <div className="relative -mt-16 flex justify-center pb-4">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500 overflow-hidden shadow-lg relative group">
                            {profileImage ? (
                                <a
                                    href={profileImage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="block h-full w-full"
                                    title="View profile photo"
                                >
                                    <img src={profileImage} alt={displayName} className="w-full h-full object-cover rounded-full" />
                                </a>
                            ) : (
                                displayName.charAt(0)?.toUpperCase() || 'U'
                            )}
                        </div>
                    </div>

                    <div className="pt-2 pb-6 px-6 sm:px-8">
                        <div className="text-center mb-6">
                            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                                {displayName}
                            </h3>
                            <p className="text-base sm:text-lg text-slate-600 mt-2 font-semibold">{personal?.designation || 'Student Candidate'}</p>
                            <p className="mt-3 text-lg text-slate-700">
                                {displayEmailHref ? (
                                    <a
                                        href={displayEmailHref}
                                        className="break-all font-medium text-slate-600 transition-colors hover:text-indigo-600 hover:underline"
                                    >
                                        {displayEmail}
                                    </a>
                                ) : (
                                    displayEmail
                                )}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
                            <div className="rounded-2xl border border-indigo-100 bg-[#f8faff] p-5">
                                <h4 className="text-sm font-black uppercase tracking-[0.16em] text-slate-600 mb-3">About</h4>
                                <p className="text-base text-slate-800 leading-relaxed whitespace-pre-wrap">
                                    {displayAbout}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-indigo-100 bg-[#f8faff] p-5">
                                <h4 className="text-sm font-black uppercase tracking-[0.16em] text-slate-600 mb-3">Contact Info</h4>
                                <div className="space-y-3 text-base">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <FaEnvelope size={16} className="text-slate-600" />
                                        <span>{displayEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <FaPhone size={16} className="text-slate-600" />
                                        <span>{displayPhone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <FaLocationDot size={16} className="text-slate-600" />
                                        <span>{displayLocation}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-indigo-100 bg-[#f8faff] p-5">
                                <h4 className="text-sm font-black uppercase tracking-[0.16em] text-slate-600 mb-3">Social Links</h4>
                                <div className="flex items-center gap-4 text-base flex-wrap">
                                    {githubUrl ? (
                                        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 hover:text-indigo-700">
                                            <FaGithub size={18} /> GitHub
                                        </a>
                                    ) : (
                                        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500">GitHub: Not provided</span>
                                    )}
                                    {linkedinUrl ? (
                                        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 hover:text-indigo-700">
                                            <FaLinkedin size={18} /> LinkedIn
                                        </a>
                                    ) : (
                                        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500">LinkedIn: Not provided</span>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-indigo-100 bg-[#f8faff] p-5">
                                <h4 className="text-sm font-black uppercase tracking-[0.16em] text-slate-600 mb-3">Education</h4>
                                <p className="text-base font-semibold text-slate-800">{displayEducation}</p>
                            </div>
                        </div>

                    </div>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="space-y-6 lg:col-span-8">
                        {(onlineCertifications.length > 0 || uploadedCertificateFiles.length > 0) && (
                            <Card rounded="3xl" padding="8" className="border border-indigo-100 bg-[#f3f6fb] shadow-none">
                                <h2 className="mb-4 flex items-center gap-2 text-2xl leading-none font-extrabold text-slate-900">
                                    <Award size={22} className="text-slate-700" /> Certificates
                                </h2>
                                <div className="grid grid-cols-1 gap-4 pl-2 pb-3 md:grid-cols-3">
                                    {onlineCertifications.map((cert, idx) => {
                                        const credentialUrl = safeLink(cert?.credentialUrl);
                                        const credentialIsImage = isImageAsset(credentialUrl);
                                        return (
                                            <div key={cert._id || `online-cert-${idx}`} className="min-w-0 overflow-hidden rounded-2xl border border-indigo-100 bg-[#f8faff]">
                                                <div className="p-4">
                                                    <p className="truncate text-lg font-bold text-slate-900">{cert.name || 'Certificate'}</p>
                                                    <p className="text-base text-slate-500 mt-1">
                                                        Issued {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                                {credentialUrl && credentialIsImage && (
                                                    <a
                                                        href={credentialUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block border-t border-slate-200 bg-slate-100"
                                                    >
                                                        <div className="h-44 w-full p-2">
                                                            <img
                                                                src={credentialUrl}
                                                                alt={cert.name || 'Certificate image'}
                                                                className="h-full w-full object-contain"
                                                            />
                                                        </div>
                                                    </a>
                                                )}
                                                {credentialUrl && !credentialIsImage && (
                                                    <a
                                                        href={credentialUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 px-4 pb-4"
                                                    >
                                                        <ExternalLink size={14} /> Open credential link
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {uploadedCertificateFiles.map((file, idx) => {
                                        const certificateUrl = resolveAssetUrl(file?.filePath);
                                        if (!certificateUrl || !isImageAsset(certificateUrl, file?.mimeType)) return null;

                                        return (
                                            <a
                                                key={file._id || `uploaded-cert-${idx}`}
                                                href={certificateUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block min-w-0 overflow-hidden rounded-2xl border border-indigo-100 bg-[#f8faff]"
                                                title={file.title || file.fileName || 'Certificate image'}
                                            >
                                                <div className="p-4">
                                                    <p className="truncate text-lg font-bold text-slate-900">{file.title || file.fileName || 'Certificate image'}</p>
                                                </div>
                                                <div className="border-t border-slate-200 bg-slate-100 h-44 w-full p-2">
                                                    <img
                                                        src={certificateUrl}
                                                        alt={file.title || file.fileName || 'Certificate image'}
                                                        className="h-full w-full object-contain"
                                                    />
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}

                        {Array.isArray(profile?.projects) && profile.projects.length > 0 && (
                            <Card rounded="3xl" padding="8" className="border border-indigo-100 bg-[#f3f6fb] shadow-none">
                                <h2 className="mb-4 flex items-center gap-2 text-2xl leading-none font-extrabold text-slate-900">
                                    <Briefcase size={22} className="text-slate-700" /> Projects
                                </h2>
                                <div className="space-y-5">
                                    {profile.projects.map((project, idx) => (
                                        <div key={project._id || idx} className="space-y-3 rounded-2xl border border-indigo-100 bg-[#f8faff] p-5">
                                            <div>
                                                <p className="text-xl font-bold text-slate-900">{project.title || 'Untitled Project'}</p>
                                                {project.description && <p className="text-base text-slate-700 mt-1 whitespace-pre-wrap">{project.description}</p>}
                                            </div>

                                            {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {project.technologies.map((tech, tIdx) => (
                                                        <span key={`${tech}-${tIdx}`} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-3 text-sm font-bold">
                                                {project.repositoryUrl && (
                                                    <a
                                                        href={safeLink(project.repositoryUrl)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-white"
                                                    >
                                                        <ExternalLink size={14} /> Repository
                                                    </a>
                                                )}
                                                {project.liveUrl && (
                                                    <a
                                                        href={safeLink(project.liveUrl)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-white"
                                                    >
                                                        <ExternalLink size={14} /> Live Demo
                                                    </a>
                                                )}
                                            </div>

                                            {Array.isArray(project.screenshots) && project.screenshots.length > 0 && (
                                                (() => {
                                                    const screenshotImages = project.screenshots
                                                        .map((shot, sIdx) => {
                                                            const shotUrl = resolveAssetUrl(shot?.filePath);
                                                            if (!shotUrl) return null;
                                                            return {
                                                                id: shot._id || sIdx,
                                                                url: shotUrl,
                                                                alt: shot.fileName || `Project screenshot ${sIdx + 1}`
                                                            };
                                                        })
                                                        .filter(Boolean);

                                                    if (screenshotImages.length === 0) return null;

                                                    return (
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                            {screenshotImages.map((shot, sIdx) => (
                                                                <button
                                                                    key={shot.id}
                                                                    type="button"
                                                                    onClick={() => openProjectImageViewer(screenshotImages, sIdx)}
                                                                    className="block overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-left"
                                                                >
                                                                    <img
                                                                        src={shot.url}
                                                                        alt={shot.alt}
                                                                        className="w-full h-28 object-cover"
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    );
                                                })()
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6 lg:col-span-4">
                        <Card rounded="3xl" padding="8" className="border border-indigo-100 bg-[#f3f6fb] shadow-none">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h2 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
                                    <Briefcase size={24} className="text-slate-700" /> Academic & Work Preferences
                                </h2>
                            </div>

                            <div className="divide-y divide-indigo-100 rounded-2xl border border-indigo-100 bg-[#f8faff] text-base">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="font-semibold text-slate-700">GPA</span>
                                    <span className="text-xl font-bold text-slate-900">{gpaDisplay}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="font-semibold text-slate-700">Seniority</span>
                                    <span className="text-lg font-bold text-slate-900 text-right">{seniority}</span>
                                </div>
                                <div className="px-4 py-3">
                                    <span className="font-semibold text-slate-700">Work Mode</span>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {displayWorkModes.map((mode, idx) => (
                                            <span key={`${mode}-${idx}`} className="inline-flex items-center rounded-full border border-indigo-100 bg-white px-3 py-1 text-sm font-semibold text-slate-800">
                                                {mode}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {Array.isArray(profile?.skills) && profile.skills.length > 0 && (
                            <Card rounded="3xl" padding="8" className="border border-indigo-100 bg-[#f3f6fb] shadow-none">
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-slate-900">
                                    <Code2 size={22} className="text-slate-700" /> Technical Skills
                                </h2>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {profile.skills.map((skill, idx) => (
                                        <div key={skill._id || `${skill.name}-${idx}`} className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                            <p className="text-lg font-bold text-blue-800">{skill.name || skill}</p>
                                            {skill?.proficiency && (
                                                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{skill.proficiency}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        <Card rounded="3xl" padding="8" className="border border-indigo-100 bg-[#f3f6fb] shadow-none">
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-slate-900">
                                <FileText size={22} className="text-slate-700" /> Resume
                            </h2>

                            {resumeUrl ? (
                                <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-22 w-22 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                                            <FileText size={32} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xl leading-tight font-black text-slate-900 sm:text-2xl">
                                                {resumeDisplayName}
                                            </p>
                                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Paperclip size={14} /> PDF Document
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="my-5 h-px bg-slate-200" />

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <a
                                            href={resumeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5f7eea] to-[#7a4ea8] px-4 py-3 text-base font-black text-white transition-opacity hover:opacity-95"
                                        >
                                            <Eye size={18} /> Preview Resume
                                        </a>
                                        <a
                                            href={resumeUrl}
                                            download={profile?.resume?.fileName || 'resume'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#22b688] to-[#19b57a] px-4 py-3 text-base font-black text-white transition-opacity hover:opacity-95"
                                        >
                                            <Download size={18} /> Download
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No resume uploaded yet.</p>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {viewerState.open && currentViewerImage && (
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 p-4"
                    onClick={closeProjectImageViewer}
                >
                    <div
                        className="relative w-full max-w-5xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={closeProjectImageViewer}
                            className="absolute right-0 top-0 z-10 inline-flex h-10 w-10 -translate-y-12 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow"
                            aria-label="Close image viewer"
                        >
                            <X size={18} />
                        </button>

                        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900/50 p-3 sm:p-5">
                            <img
                                src={currentViewerImage.url}
                                alt={currentViewerImage.alt}
                                className="h-[55vh] w-full rounded-xl object-contain sm:h-[70vh]"
                            />
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={showPreviousImage}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-800"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <p className="text-sm font-semibold text-slate-100">
                                {viewerState.index + 1} / {viewerState.images.length}
                            </p>
                            <button
                                type="button"
                                onClick={showNextImage}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-800"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
