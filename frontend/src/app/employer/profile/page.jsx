'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    User as UserIcon, Building, Mail, Phone, MapPin, 
    Globe, Edit3, Save, X, Loader2, ArrowLeft, 
    Briefcase, Users, Calendar, Info
} from 'lucide-react';
import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/context/AuthContext';
import axios from '@/services/apiClient';

const getMailtoHref = (email = '') => {
    const trimmed = String(email).trim();
    return trimmed ? `mailto:${trimmed}` : '';
};

const getWordCount = (value = '') => String(value).trim().split(/\s+/).filter(Boolean).length;

const ProfilePage = () => {
    const MAX_DESCRIPTION_WORDS = 200;
    const router = useRouter();
    const { user, checkUserLoggedIn } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [previewImage, setPreviewImage] = useState(null);
    const [previewCoverImage, setPreviewCoverImage] = useState(null);
    const companyEmail = user?.email || '';
    const companyEmailHref = getMailtoHref(companyEmail);
    const companyProfileImage = previewImage || user?.profilePicture || '';
    const companyCoverImage = previewCoverImage || user?.coverImage || '';
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        companyName: user?.companyName || '',
        website: user?.website || '',
        phone: user?.phone || '',
        location: user?.location || '',
        industry: user?.industry || '',
        companySize: user?.companySize || '',
        foundedYear: user?.foundedYear || '',
        businessRegistrationNumber: user?.businessRegistrationNumber || '',
        companyDescription: user?.companyDescription || '',
        profilePicture: user?.profilePicture || '',
        coverImage: user?.coverImage || '',
        positionInCompany: user?.positionInCompany || ''
    });
    const descriptionWordCount = getWordCount(formData.companyDescription);
    const companyName = formData.companyName || user?.companyName || '';

    useEffect(() => {
        // Update form when user data loads
        if (user) {
            setFormData({
                name: user.name || '',
                companyName: user.companyName || '',
                website: user.website || '',
                phone: user.phone || '',
                location: user.location || '',
                industry: user.industry || '',
                companySize: user.companySize || '',
                foundedYear: user.foundedYear || '',
                businessRegistrationNumber: user.businessRegistrationNumber || '',
                companyDescription: user.companyDescription || '',
                profilePicture: user.profilePicture || '',
                coverImage: user.coverImage || '',
                positionInCompany: user.positionInCompany || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, profilePicture: file });
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, coverImage: file });

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewCoverImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        // Validation for Founding Year
        if (formData.foundedYear) {
            const currentYear = new Date().getFullYear();
            const year = parseInt(formData.foundedYear);
            if (isNaN(year) || year > currentYear || year < 1800) {
                setMessage({ type: 'error', text: `Founded year must be between 1800 and ${currentYear}` });
                return;
            }
        }

        // Validation for Company Description
        if (getWordCount(formData.companyDescription) > MAX_DESCRIPTION_WORDS) {
            setMessage({ type: 'error', text: `Company description must be ${MAX_DESCRIPTION_WORDS} words or less.` });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'profilePicture' || key === 'coverImage') {
                    if (formData[key] instanceof File) {
                        data.append(key, formData[key]);
                    }
                } else if (key === 'foundedYear') {
                    if (String(formData[key]).trim() !== '') {
                        data.append(key, formData[key]);
                    }
                } else if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });

            const res = await axios.put('/auth/profile', data);
            
            // Refresh auth context
            if (typeof checkUserLoggedIn === 'function') {
                await checkUserLoggedIn();
            }
            
            setIsEditing(false);
            setPreviewImage(null);
            setPreviewCoverImage(null);
            setMessage({ type: 'success', text: 'Corporate profile updated successfully!' });

            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Update failed';
            setMessage({ type: 'error', text: `Failed: ${errorMsg}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.name || '',
                companyName: user.companyName || '',
                website: user.website || '',
                phone: user.phone || '',
                location: user.location || '',
                industry: user.industry || '',
                companySize: user.companySize || '',
                foundedYear: user.foundedYear || '',
                businessRegistrationNumber: user.businessRegistrationNumber || '',
                companyDescription: user.companyDescription || '',
                profilePicture: user.profilePicture || '',
                coverImage: user.coverImage || '',
                positionInCompany: user.positionInCompany || ''
            });
        }
        setIsEditing(false);
        setPreviewImage(null);
        setPreviewCoverImage(null);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 md:px-8 lg:px-12">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/employer/dashboard')}
                        className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-slate-900"
                    >
                        <ArrowLeft className="mx-auto h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Company Profile</h1>
                        <p className="mt-1 text-sm font-medium text-slate-500">Company identity, contact information, and overview</p>
                    </div>
                </div>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700"
                    >
                        <Edit3 size={17} /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            <X size={16} /> Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
                        </button>
                    </div>
                )}
            </div>

            {message.text && (
                <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${message.type === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-rose-100 bg-rose-50 text-rose-700'}`}>
                    {message.text}
                </div>
            )}

            <Card rounded="3xl" padding="0" className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div
                    className="relative h-56 sm:h-64 bg-cover bg-center"
                    style={{
                        backgroundImage: companyCoverImage
                            ? `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.18)), url(${companyCoverImage})`
                            : 'linear-gradient(135deg, #dbe4ee 0%, #edf2f7 100%)'
                    }}
                >
                    {isEditing && (
                        <label className="absolute right-5 top-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-slate-800">
                            <Edit3 size={14} /> Edit Cover
                            <input type="file" accept="image/*" className="hidden" onChange={handleCoverFileChange} />
                        </label>
                    )}

                    <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2">
                        <div className="relative h-32 w-32 rounded-full border-[5px] border-white bg-white p-1 shadow-[0_16px_40px_rgba(15,23,42,0.2)] sm:h-36 sm:w-36">
                            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
                                {companyProfileImage ? (
                                    <img src={companyProfileImage} alt={companyName} className="h-full w-full object-cover" />
                                ) : (
                                    <Avatar src={user?.profilePicture} name={companyName} size="full" className="h-full w-full" />
                                )}
                            </div>
                            {isEditing && (
                                <label className="absolute bottom-1 left-1/2 inline-flex -translate-x-1/2 cursor-pointer items-center gap-1 rounded-full bg-slate-800/85 px-3 py-1.5 text-[10px] font-bold text-white shadow-md transition hover:bg-slate-900">
                                    <Edit3 size={12} /> Edit
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-8 pt-20 sm:px-10 sm:pb-10 sm:pt-24">
                    <div className="text-center">
                        {isEditing ? (
                            <input
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                className="w-full border-b border-slate-200 pb-2 text-center text-3xl font-extrabold tracking-tight text-slate-900 outline-none focus:border-indigo-500 sm:text-4xl"
                                placeholder="Company Name"
                            />
                        ) : (
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                                {user?.companyName || 'Company Name'}
                            </h2>
                        )}

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                            <span className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                                {user?.positionInCompany ? user.positionInCompany : 'Add designation'}
                            </span>
                            <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
                                {user?.location || 'Location not set'}
                            </span>
                            {user?.website && (
                                <a
                                    href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700"
                                >
                                    Website
                                </a>
                            )}
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
                            <Mail size={16} className="text-slate-500" />
                            {companyEmailHref ? (
                                <a href={companyEmailHref} className="font-semibold text-slate-600 no-underline hover:no-underline">
                                    {companyEmail}
                                </a>
                            ) : (
                                <span>Not set</span>
                            )}
                        </div>

                        <div className="mt-8 text-right">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                            >
                                <Edit3 size={14} /> Edit About
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="space-y-8 lg:col-span-8">
                    <Card rounded="3xl" padding="0" className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                        <div className="px-6 py-6 sm:px-8">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                                    <Building size={18} className="text-slate-700" /> About / Company Description
                                </h3>
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-700">
                                    Max 200 words
                                </span>
                            </div>

                            {isEditing ? (
                                <div>
                                    <textarea
                                        name="companyDescription"
                                        value={formData.companyDescription}
                                        onChange={handleChange}
                                        placeholder="Describe your company"
                                        className="h-44 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base font-medium leading-7 text-slate-800 outline-none focus:border-indigo-500"
                                    />
                                    <p className={`mt-2 text-right text-xs font-semibold ${descriptionWordCount > MAX_DESCRIPTION_WORDS ? 'text-rose-600' : 'text-slate-500'}`}>
                                        {descriptionWordCount}/{MAX_DESCRIPTION_WORDS} words
                                    </p>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap text-base leading-8 text-slate-700">
                                    {user?.companyDescription || 'Add a short company overview.'}
                                </p>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="space-y-8 lg:col-span-4">
                    <Card rounded="3xl" padding="0" className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                        <div className="px-6 py-6 sm:px-8">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-900">
                                <Mail size={18} className="text-sky-600" /> Contact & Communication
                            </h3>
                            <div className="space-y-3">
                                {isEditing ? (
                                    <>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Name"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-800 outline-none focus:border-indigo-500"
                                        />
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Contact no"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-800 outline-none focus:border-indigo-500"
                                        />
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="Location"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-800 outline-none focus:border-indigo-500"
                                        />
                                        <input
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            placeholder="Website"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-800 outline-none focus:border-indigo-500"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                                                <UserIcon size={18} className="text-slate-700" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Name</p>
                                                <span className="block text-sm font-semibold text-slate-900">{user?.name || 'Not set'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                                                <Mail size={18} className="text-slate-700" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Email</p>
                                                {companyEmailHref ? (
                                                    <a href={companyEmailHref} className="block break-all text-sm font-semibold text-slate-900 no-underline hover:no-underline">
                                                        {companyEmail}
                                                    </a>
                                                ) : (
                                                    <span className="block text-sm font-semibold text-slate-900">Not set</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                                                <Phone size={18} className="text-slate-700" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Contact No</p>
                                                <span className="block text-sm font-semibold text-slate-900">{user?.phone || 'Not set'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                                                <MapPin size={18} className="text-slate-700" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Location</p>
                                                <span className="block text-sm font-semibold text-slate-900">{user?.location || 'Not set'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                                                <Globe size={18} className="text-slate-700" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Website</p>
                                                {user?.website ? (
                                                    <a
                                                        href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block truncate text-sm font-semibold text-slate-900 no-underline hover:no-underline"
                                                    >
                                                        {user.website}
                                                    </a>
                                                ) : (
                                                    <span className="block text-sm font-semibold text-slate-900">Not set</span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card rounded="3xl" padding="0" className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                        <div className="px-6 py-6 sm:px-8">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-900">
                                <Info size={18} className="text-indigo-600" /> Company Details
                            </h3>
                            <div className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold text-slate-600">Industry</label>
                                            <input
                                                name="industry"
                                                value={formData.industry}
                                                onChange={handleChange}
                                                placeholder="e.g., Technology, Finance"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-800 outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold text-slate-600">Company Size</label>
                                            <select
                                                name="companySize"
                                                value={formData.companySize}
                                                onChange={handleChange}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-800 outline-none focus:border-indigo-500"
                                            >
                                                <option value="">Select Size</option>
                                                <option value="1-10">1-10 Employees</option>
                                                <option value="11-50">11-50 Employees</option>
                                                <option value="51-200">51-200 Employees</option>
                                                <option value="201-500">201-500 Employees</option>
                                                <option value="500+">500+ Employees</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold text-slate-600">Founding Year</label>
                                            <input
                                                type="number"
                                                name="foundedYear"
                                                value={formData.foundedYear}
                                                onChange={handleChange}
                                                placeholder="Year"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-800 outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {user?.industry && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Briefcase size={16} className="text-slate-600" />
                                                <span className="text-slate-700">{user.industry}</span>
                                            </div>
                                        )}
                                        {user?.companySize && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users size={16} className="text-slate-600" />
                                                <span className="text-slate-700">{user.companySize}</span>
                                            </div>
                                        )}
                                        {user?.foundedYear && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar size={16} className="text-slate-600" />
                                                <span className="text-slate-700">Founded {user.foundedYear}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
