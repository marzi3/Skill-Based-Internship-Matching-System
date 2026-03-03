'use client';

import { useState } from 'react';
import { User as UserIcon, Building, Mail, Phone, MapPin, Globe, Edit3, Save, X, Loader2 } from 'lucide-react';
import Card from '@/components/common/Card';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: user?.name || '',
        companyName: user?.companyName || '',
        website: user?.website || '',
        businessRegistrationNumber: user?.businessRegistrationNumber || '',
        companyDescription: user?.companyDescription || '',
        profilePicture: user?.profilePicture || '',
        positionInCompany: user?.positionInCompany || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await axios.put('/api/auth/profile', formData);
            setUser({ ...user, ...res.data }); // Update context
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            companyName: user?.companyName || '',
            website: user?.website || '',
            businessRegistrationNumber: user?.businessRegistrationNumber || '',
            companyDescription: user?.companyDescription || '',
            profilePicture: user?.profilePicture || '',
            positionInCompany: user?.positionInCompany || ''
        });
        setIsEditing(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Employer Profile</h1>
                    <p className="text-gray-600">View and manage your company profile information</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 transition-all shadow-md"
                    >
                        <Edit3 size={18} /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-200 transition-all"
                        >
                            <X size={18} /> Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Company Card */}
                <Card shadow="sm" rounded="lg" padding="lg" className="lg:col-span-1 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-32 h-32 bg-gray-100 rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-xl relative overflow-hidden group">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <Building size={48} className="text-gray-400 group-hover:scale-110 transition-transform" />
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            {isEditing ? (
                                <input
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full text-center border-b-2 border-primary-200 focus:border-primary-500 outline-none text-2xl font-black bg-transparent py-1 transition-colors"
                                    placeholder="Company Name"
                                />
                            ) : (
                                user?.companyName || 'Setup Your Company'
                            )}
                        </h2>
                        {isEditing ? (
                            <textarea
                                name="companyDescription"
                                value={formData.companyDescription}
                                onChange={handleChange}
                                className="w-full mt-4 text-center border-b-2 border-primary-200 focus:border-primary-500 outline-none text-sm bg-transparent py-1 transition-colors resize-none h-20"
                                placeholder="Short mission or company description..."
                            />
                        ) : (
                            <p className="text-gray-500 text-sm mt-3 px-4 italic leading-relaxed">
                                {user?.companyDescription || 'No description provided yet.'}
                            </p>
                        )}
                        <p className="text-primary-600 font-bold uppercase tracking-widest text-[10px] mt-4">
                            {user?.verificationStatus === 'approved' ? 'Verified Employer' : 'Pending Verification'}
                        </p>
                    </div>

                    {isEditing && (
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="text-left space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Profile Picture URL</label>
                                <input
                                    name="profilePicture"
                                    value={formData.profilePicture}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                            <div className="text-left space-y-1 mt-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">BRN / TIN</label>
                                <input
                                    name="businessRegistrationNumber"
                                    value={formData.businessRegistrationNumber}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Enter Business Registration Number"
                                />
                                <p className="text-[9px] text-gray-400">Required for verification.</p>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Details Card */}
                <Card shadow="sm" rounded="lg" padding="lg" className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Primary Contact</label>
                            <div className="flex flex-col gap-2 text-gray-900 font-bold">
                                <div className="flex items-center gap-3">
                                    <UserIcon size={20} className={isEditing ? 'text-gray-400' : 'text-primary-500'} />
                                    {isEditing ? (
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Full Name"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-100 outline-none"
                                        />
                                    ) : (
                                        <span>{user?.name || 'Administrator'}</span>
                                    )}
                                </div>
                                {isEditing ? (
                                    <input
                                        name="positionInCompany"
                                        value={formData.positionInCompany}
                                        onChange={handleChange}
                                        placeholder="Position (e.g. HR Manager)"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-100 outline-none ml-[2rem]"
                                    />
                                ) : (
                                    <span className="text-xs text-gray-500 font-medium ml-[2.6rem]">{user?.positionInCompany || 'Position Not Specified'}</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                            <div className="flex items-center gap-3 text-gray-500 font-medium">
                                <Mail size={20} className="text-gray-400" />
                                <span>{user?.email || 'admin@company.com'}</span>
                                <span className="ml-auto text-[9px] uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">Read Only</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Website</label>
                            <div className="flex items-center gap-3 text-gray-900 font-bold">
                                <Globe size={20} className={isEditing ? 'text-gray-400' : 'text-primary-500'} />
                                {isEditing ? (
                                    <input
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-100 outline-none"
                                    />
                                ) : (
                                    <a href={user?.website} target="_blank" rel="noreferrer" className="hover:text-primary-600 hover:underline">{user?.website || 'Not provided'}</a>
                                )}
                            </div>
                        </div>

                        {!isEditing && user?.businessRegistrationNumber && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reg. Number</label>
                                <div className="flex items-center gap-3 text-gray-900 font-bold">
                                    <Building size={20} className="text-primary-500" />
                                    <span>{user.businessRegistrationNumber}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Account Status</h3>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Verification Level</p>
                                    <p className="text-xs text-gray-500 mt-1">Your company has been verified by the administration team.</p>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${user?.verificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {user?.verificationStatus}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
