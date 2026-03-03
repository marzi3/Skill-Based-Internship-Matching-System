'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, User, CreditCard, Save, Loader2, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Card from '@/components/common/Card';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const SettingsPage = () => {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Forms State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        companyDescription: user?.companyDescription || '',
        profilePicture: user?.profilePicture || '',
        positionInCompany: user?.positionInCompany || ''
    });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Hydration fix for next-themes
    import('react').then(React => {
        React.useEffect(() => setMounted(true), []);
    });

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.put('/api/auth/profile', profileData);
            setUser({ ...user, ...res.data });
            showMessage('success', 'Profile updated successfully.');
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return showMessage('error', 'New passwords do not match.');
        }
        if (passwordData.newPassword.length < 8) {
            return showMessage('error', 'Password must be at least 8 characters long.');
        }

        setIsLoading(true);
        try {
            await axios.put('/api/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            showMessage('success', 'Password changed successfully. Please use it next time you log in.');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-600">Manage your employer account preferences and configurations</p>
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
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                                            placeholder="Your full name"
                                            required
                                        />
                                        <p className="text-xs text-gray-500">This is how you will appear to potential candidates.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Position in Company</label>
                                        <input
                                            type="text"
                                            value={profileData.positionInCompany}
                                            onChange={(e) => setProfileData({ ...profileData, positionInCompany: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                                            placeholder="e.g. HR Manager"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Profile Picture URL</label>
                                    <input
                                        type="url"
                                        value={profileData.profilePicture}
                                        onChange={(e) => setProfileData({ ...profileData, profilePicture: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                                        placeholder="https://example.com/logo.png"
                                    />
                                    <p className="text-xs text-gray-500">Provide a direct link to your company logo or profile picture.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Company Description</label>
                                    <textarea
                                        value={profileData.companyDescription}
                                        onChange={(e) => setProfileData({ ...profileData, companyDescription: e.target.value })}
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
                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 outline-none"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">New Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 outline-none"
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 outline-none"
                                            required
                                        />
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
