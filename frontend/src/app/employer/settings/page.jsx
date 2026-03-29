'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employerProfileSchema, employerPasswordSchema } from '@/lib/validationSchemas';
import { Settings as SettingsIcon, Bell, Shield, User, CreditCard, Save, Loader2, Moon, Sun, ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/common/Card';
import { useAuth } from '@/context/AuthContext';
import axios from '@/services/apiClient';

const SettingsPage = () => {
    const router = useRouter();
    const { user, checkUserLoggedIn } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    
    // Dynamic Image URL Base
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api/v1';
    const imageBaseUrl = apiUrl.includes('/api/v1') ? apiUrl.replace('/api/v1', '') : apiUrl;

    // Profile picture (not part of Zod schema — file uploads handled separately)
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [currentProfilePicture, setCurrentProfilePicture] = useState(user?.profilePicture || '');

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // ─── Profile Form (useForm + Zod) ────────────────────────────────────────
    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
    } = useForm({
        resolver: zodResolver(employerProfileSchema),
        mode: 'onBlur',
        defaultValues: {
            name: user?.name || '',
            positionInCompany: user?.positionInCompany || '',
            companyDescription: user?.companyDescription || '',
        },
    });

    // ─── Password Form (useForm + Zod) ───────────────────────────────────────
    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPasswordForm,
        formState: { errors: passwordErrors },
    } = useForm({
        resolver: zodResolver(employerPasswordSchema),
        mode: 'onBlur',
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfilePictureFile(e.target.files[0]);
        }
    };

    const onProfileSubmit = async (data) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            if (data.positionInCompany) formData.append('positionInCompany', data.positionInCompany);
            if (data.companyDescription) formData.append('companyDescription', data.companyDescription);
            if (profilePictureFile instanceof File) {
                formData.append('profilePicture', profilePictureFile);
            }

            await axios.put('/auth/profile', formData);
            
            if (typeof checkUserLoggedIn === 'function') {
                checkUserLoggedIn();
            }
            
            showMessage('success', 'Profile updated successfully.');
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const onPasswordSubmit = async (data) => {
        setIsLoading(true);
        try {
            await axios.put('/auth/password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            showMessage('success', 'Password changed successfully. Please use it next time you log in.');
            resetPasswordForm();
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to change password.');
        } finally {
            setIsLoading(false);
        }
    };

    const settingSections = [
        { id: 'profile', title: 'Profile Information', description: 'Update your company details and contact info', icon: User },
        { id: 'security', title: 'Security', description: 'Manage your password and account security', icon: Shield },
        { id: 'notifications', title: 'Notifications', description: 'Configure how you receive candidate alerts', icon: Bell },
        { id: 'billing', title: 'Billing & Plans', description: 'Manage your subscription and invoices', icon: CreditCard },
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.push('/employer/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-600">Manage your employer account preferences and configurations</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-bold shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="md:w-64 flex-shrink-0 space-y-2">
                    {settingSections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeTab === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveTab(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${isActive ? 'bg-primary-50 text-primary-700 font-bold shadow-sm ring-1 ring-primary-100' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                                {section.title}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <Card shadow="sm" rounded="lg" padding="lg" className="border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Personal Information</h2>
                            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-bold text-gray-700">Full Name</label>
                                        <input
                                            {...registerProfile('name')}
                                            id="name"
                                            type="text"
                                            aria-invalid={profileErrors.name ? 'true' : undefined}
                                            aria-describedby={profileErrors.name ? 'profile-name-error' : undefined}
                                            className={`w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm focus:ring-2 outline-none transition-all ${profileErrors.name ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-primary-100 focus:border-primary-500'}`}
                                            placeholder="Your full name"
                                        />
                                        <AnimatePresence>
                                            {profileErrors.name && (
                                                <motion.p id="profile-name-error" role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-rose-500 text-xs font-bold">{profileErrors.name.message}</motion.p>
                                            )}
                                        </AnimatePresence>
                                        <p className="text-xs text-gray-500">This is how you will appear to potential candidates.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="positionInCompany" className="text-sm font-bold text-gray-700">Position in Company</label>
                                        <input
                                            {...registerProfile('positionInCompany')}
                                            id="positionInCompany"
                                            type="text"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                                            placeholder="e.g. HR Manager"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Profile Picture</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        name="profilePicture"
                                        onChange={handleFileChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                                    />
                                    {typeof currentProfilePicture === 'string' && currentProfilePicture && (
                                        <p className="text-xs text-gray-400 truncate">Current: {currentProfilePicture}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="companyDescription" className="text-sm font-bold text-gray-700">Company Description</label>
                                    <textarea
                                        {...registerProfile('companyDescription')}
                                        id="companyDescription"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all h-24 resize-none"
                                        placeholder="Briefly describe your company's mission and culture..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-400">Your email address cannot be changed.</p>
                                </div>

                                {mounted && (
                                    <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Interface Theme</h3>
                                            <p className="text-xs text-gray-500">Toggle dark mode on or off to change the workspace aesthetic.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                            className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            {theme === 'dark' ? <Sun className="text-amber-500" size={20} /> : <Moon className="text-indigo-500" size={20} />}
                                        </button>
                                    </div>
                                )}

                                <div className="pt-4 mt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-all shadow-md w-full sm:w-auto font-bold disabled:opacity-70"
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        Save Profile
                                    </button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <Card shadow="sm" rounded="lg" padding="lg" className="border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Change Password</h2>
                            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="currentPassword" className="text-sm font-bold text-gray-700">Current Password</label>
                                    <input
                                        {...registerPassword('currentPassword')}
                                        id="currentPassword"
                                        type="password"
                                        aria-invalid={passwordErrors.currentPassword ? 'true' : undefined}
                                        aria-describedby={passwordErrors.currentPassword ? 'currentPassword-error' : undefined}
                                        className={`w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm focus:ring-2 outline-none ${passwordErrors.currentPassword ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-primary-100'}`}
                                    />
                                    <AnimatePresence>
                                        {passwordErrors.currentPassword && (
                                            <motion.p id="currentPassword-error" role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-rose-500 text-xs font-bold">{passwordErrors.currentPassword.message}</motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="newPassword" className="text-sm font-bold text-gray-700">New Password</label>
                                        <input
                                            {...registerPassword('newPassword')}
                                            id="newPassword"
                                            type="password"
                                            aria-invalid={passwordErrors.newPassword ? 'true' : undefined}
                                            aria-describedby={passwordErrors.newPassword ? 'newPassword-error' : undefined}
                                            className={`w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm focus:ring-2 outline-none ${passwordErrors.newPassword ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-primary-100'}`}
                                        />
                                        <AnimatePresence>
                                            {passwordErrors.newPassword && (
                                                <motion.p id="newPassword-error" role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-rose-500 text-xs font-bold">{passwordErrors.newPassword.message}</motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className="text-sm font-bold text-gray-700">Confirm New Password</label>
                                        <input
                                            {...registerPassword('confirmPassword')}
                                            id="confirmPassword"
                                            type="password"
                                            aria-invalid={passwordErrors.confirmPassword ? 'true' : undefined}
                                            aria-describedby={passwordErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                                            className={`w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm focus:ring-2 outline-none ${passwordErrors.confirmPassword ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-primary-100'}`}
                                        />
                                        <AnimatePresence>
                                            {passwordErrors.confirmPassword && (
                                                <motion.p id="confirmPassword-error" role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-rose-500 text-xs font-bold">{passwordErrors.confirmPassword.message}</motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-all shadow-md w-full sm:w-auto font-bold disabled:opacity-70"
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {(activeTab === 'notifications' || activeTab === 'billing') && (
                        <Card shadow="sm" rounded="lg" padding="xl" className="border border-gray-100 bg-gray-50 flex flex-col items-center justify-center text-center min-h-[300px]">
                            <SettingsIcon className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">Coming Soon</h3>
                            <p className="text-gray-500 max-w-sm mt-2">
                                We are working hard to bring you advanced {activeTab} configurations. Stay tuned for the next update!
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
