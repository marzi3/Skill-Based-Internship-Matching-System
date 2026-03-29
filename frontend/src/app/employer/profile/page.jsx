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

const ProfilePage = () => {
    const router = useRouter();
    const { user, checkUserLoggedIn } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [previewImage, setPreviewImage] = useState(null);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        companyName: user?.companyName || '',
        website: user?.website || '',
        location: user?.location || '',
        industry: user?.industry || '',
        companySize: user?.companySize || '',
        foundedYear: user?.foundedYear || '',
        businessRegistrationNumber: user?.businessRegistrationNumber || '',
        companyDescription: user?.companyDescription || '',
        profilePicture: user?.profilePicture || '',
        positionInCompany: user?.positionInCompany || ''
    });

    useEffect(() => {
        // Update form when user data loads
        if (user) {
            setFormData({
                name: user.name || '',
                companyName: user.companyName || '',
                website: user.website || '',
                location: user.location || '',
                industry: user.industry || '',
                companySize: user.companySize || '',
                foundedYear: user.foundedYear || '',
                businessRegistrationNumber: user.businessRegistrationNumber || '',
                companyDescription: user.companyDescription || '',
                profilePicture: user.profilePicture || '',
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
        if (formData.companyDescription && formData.companyDescription.length && formData.companyDescription.length < 30) {
            setMessage({ type: 'error', text: 'Company description is too brief. Please provide at least 30 characters.' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'profilePicture') {
                    if (formData[key] instanceof File) {
                        data.append('profilePicture', formData[key]);
                    }
                    // If it's a string, we don't need to append it as a file
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
                location: user.location || '',
                industry: user.industry || '',
                companySize: user.companySize || '',
                foundedYear: user.foundedYear || '',
                businessRegistrationNumber: user.businessRegistrationNumber || '',
                companyDescription: user.companyDescription || '',
                profilePicture: user.profilePicture || '',
                positionInCompany: user.positionInCompany || ''
            });
        }
        setIsEditing(false);
        setPreviewImage(null);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="px-6 md:px-12 lg:px-20 py-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/employer/dashboard')} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md text-gray-600 transition-all group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Building className="text-primary-600 w-5 h-5" />
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Profile Status: Verified</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Corporate Profile</h1>
                    </div>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 font-bold"
                    >
                        <Edit3 size={18} /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-white text-gray-700 px-8 py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all font-bold"
                        >
                            <X size={18} /> Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 font-bold disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {message.text && (
                <div className={`p-5 rounded-[1.5rem] text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Visual Identity Card */}
                <Card shadow="none" rounded="xl" padding="none" className="lg:col-span-3 lg:col-start-2 bg-white/50 backdrop-blur-xl border border-gray-100/50 p-10 flex flex-col items-center text-center space-y-8">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary-500/10 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-44 h-44 rounded-[3.5rem] p-1 bg-gradient-to-br from-primary-500 via-indigo-500 to-purple-500 shadow-2xl relative z-10">
                            <div className="w-full h-full bg-white rounded-[3.1rem] overflow-hidden flex items-center justify-center border-4 border-white">
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Avatar 
                                        src={user?.profilePicture} 
                                        name={user?.companyName} 
                                        size="full" 
                                        className="w-full h-full rounded-none"
                                    />
                                )}
                            </div>
                        </div>
                        {isEditing && (
                            <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-4 rounded-3xl shadow-xl hover:bg-indigo-700 cursor-pointer transition-all hover:scale-110 z-20 border-4 border-white">
                                <Edit3 size={20} />
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>

                    <div className="space-y-4 w-full">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                            {isEditing ? (
                                <input
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full text-center border-b-2 border-primary-200 focus:border-primary-500 outline-none text-2xl font-black bg-transparent py-2 transition-all placeholder:text-gray-200"
                                    placeholder="Company Legal Name"
                                />
                            ) : (
                                user?.companyName || 'Establish Identity'
                            )}
                        </h2>
                        
                        {isEditing ? (
                            <textarea
                                name="companyDescription"
                                value={formData.companyDescription}
                                onChange={handleChange}
                                className="w-full mt-6 text-center border-2 border-gray-100 rounded-3xl p-6 focus:border-primary-500 outline-none text-sm bg-gray-50/50 font-medium leading-relaxed transition-all resize-none h-40"
                                placeholder="Describe your company's mission, values, and the opportunities..."
                            />
                        ) : (
                            <p className="text-gray-500 text-base font-medium leading-[1.8] px-2 italic">
                                {user?.companyDescription || 'No description provided. Add a compelling company overview to attract top talent.'}
                            </p>
                        )}

                        <div className="flex flex-col items-center gap-3 pt-6">
                            <div className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${user?.verificationStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                {user?.verificationStatus === 'approved' ? 'Verified Entity' : 'Pending Validation'}
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="w-full pt-8 border-t border-gray-100 space-y-6">
                            <div className="text-left space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <Info size={12} className="text-primary-500" /> Business Registration Number
                                </label>
                                <input
                                    name="businessRegistrationNumber"
                                    value={formData.businessRegistrationNumber}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                    placeholder="BRN-990-221"
                                />
                            </div>
                        </div>
                    )}
                </Card>

                {/* Technical Specifications Card */}
                <Card shadow="none" rounded="xl" padding="none" className="lg:col-span-7 bg-white border border-gray-100/50 overflow-hidden flex flex-col">
                    <div className="p-10 lg:p-12 space-y-12 flex-1">
                        {/* Core Profiles Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {/* Contact Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                    <UserIcon size={14} /> Key Contact Personnel
                                </label>
                                <div className="space-y-4">
                                    {isEditing ? (
                                        <>
                                            <input
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Primary Representative"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none"
                                            />
                                            <input
                                                name="positionInCompany"
                                                value={formData.positionInCompany}
                                                onChange={handleChange}
                                                placeholder="Designation (e.g. Hiring Manager)"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none"
                                            />
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                                                <UserIcon size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xl font-black text-gray-900 leading-none">{user?.name || 'Authorized Contact'}</p>
                                                <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest">{user?.positionInCompany || 'Company Executive'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Online Presence Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                    < Globe size={14} /> Online Presence
                                </label>
                                <div className="space-y-4">
                                    {isEditing ? (
                                        <input
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            placeholder="https://www.company.com"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 shadow-inner group-hover:scale-110 transition-transform">
                                                <Globe size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Official Website</p>
                                                <a href={user?.website} target="_blank" rel="noreferrer" className="text-lg font-black text-primary-600 hover:text-primary-700 underline underline-offset-8 mt-2 inline-block">
                                                    {user?.website ? user.website.replace(/^https?:\/\//, '') : 'No website linked'}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                    <MapPin size={14} /> Primary Headquarters
                                </label>
                                <div className="space-y-4">
                                    {isEditing ? (
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="City, Country"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner group-hover:scale-110 transition-transform">
                                                <MapPin size={24} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-gray-900 leading-none">{user?.location || 'Location not specified'}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{user?.location ? 'Operational HQ' : 'Update headquarters'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Industry Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                    <Briefcase size={14} /> Industry Sector
                                </label>
                                <div className="space-y-4">
                                    {isEditing ? (
                                        <input
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleChange}
                                            placeholder="Industry (e.g. Technology, AI)"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
                                                <Briefcase size={24} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-gray-900 leading-none">{user?.industry || 'Select Industry'}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Core Specialization</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Extended Metadata */}
                        <div className="pt-12 border-t border-gray-100">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-3">
                                <div className="w-10 h-0.5 bg-gray-100" /> Company Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Company Size</label>
                                    {isEditing ? (
                                        <select
                                            name="companySize"
                                            value={formData.companySize}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none appearance-none"
                                        >
                                            <option value="">Select Size</option>
                                            <option value="1-10">1-10 Employees</option>
                                            <option value="11-50">11-50 Employees</option>
                                            <option value="51-200">51-200 Employees</option>
                                            <option value="201-500">201-500 Employees</option>
                                            <option value="500+">500+ Global Team</option>
                                        </select>
                                    ) : (
                                        <div className="flex items-center gap-3 font-black text-gray-900">
                                            <Users size={16} className="text-gray-400" />
                                            {user?.companySize ? `${user.companySize} Employees` : 'Undisclosed'}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Founding Year</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="foundedYear"
                                            value={formData.foundedYear}
                                            onChange={handleChange}
                                            placeholder="Year"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 font-black text-gray-900">
                                            <Calendar size={16} className="text-gray-400" />
                                            {user?.foundedYear || 'Not provided'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Clearance Footer */}
                    <div className="bg-gray-50/50 p-8 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profile Integrity Verified</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-500">{user?.email}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
