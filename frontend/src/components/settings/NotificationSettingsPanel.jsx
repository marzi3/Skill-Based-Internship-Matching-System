'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import { Mail, Bell, MessageSquare, Briefcase, Zap } from 'lucide-react';

export default function NotificationSettingsPanel() {
    const [settings, setSettings] = useState({
        emailEnabled: true,
        preferences: {
            onMatch: true,
            onStatusChange: true,
            onMessage: true
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/settings/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success && res.data.data) {
                setSettings(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (key, isPreference = false) => {
        const newSettings = { ...settings };

        if (isPreference) {
            newSettings.preferences[key] = !newSettings.preferences[key];
        } else {
            newSettings[key] = !newSettings[key];
        }

        setSettings(newSettings);

        // Save to backend immediately
        setSaving(true);
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.put('http://localhost:5001/api/settings/notifications', newSettings, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Failed to update settings', err);
            fetchSettings(); // Revert on fail
        } finally {
            setSaving(false);
        }
    };

    const ToggleSwitch = ({ checked, onChange, disabled }) => (
        <button
            type="button"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={disabled ? undefined : onChange}
            disabled={disabled}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );

    if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-black text-gray-900">Communication Preferences</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage how and when we contact you.</p>
                </div>
                {saving && <div className="text-xs font-bold text-indigo-600 flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>Saving...</div>}
            </div>

            <div className="p-6 space-y-8">
                {/* Global Email Toggle */}
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-700">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Email Notifications</h4>
                            <p className="text-sm text-gray-500 mt-0.5">Receive alerts directly in your inbox.</p>
                        </div>
                    </div>
                    <ToggleSwitch checked={settings.emailEnabled} onChange={() => handleToggle('emailEnabled')} />
                </div>

                {/* Specific Preferences */}
                <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 px-1 border-b border-gray-100 pb-2">Event Triggers</h4>

                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Zap size={18} className="text-orange-500" />
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">New Match Recommendations</p>
                                <p className="text-xs text-gray-500">When our AI finds a perfect internship for you.</p>
                            </div>
                        </div>
                        <ToggleSwitch
                            checked={settings.preferences?.onMatch}
                            onChange={() => handleToggle('onMatch', true)}
                            disabled={!settings.emailEnabled}
                        />
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Briefcase size={18} className="text-blue-500" />
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Application Updates</p>
                                <p className="text-xs text-gray-500">When an employer views or updates your application status.</p>
                            </div>
                        </div>
                        <ToggleSwitch
                            checked={settings.preferences?.onStatusChange}
                            onChange={() => handleToggle('onStatusChange', true)}
                            disabled={!settings.emailEnabled}
                        />
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <MessageSquare size={18} className="text-green-500" />
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Direct Messages</p>
                                <p className="text-xs text-gray-500">When an employer messages you directly.</p>
                            </div>
                        </div>
                        <ToggleSwitch
                            checked={settings.preferences?.onMessage}
                            onChange={() => handleToggle('onMessage', true)}
                            disabled={!settings.emailEnabled}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
