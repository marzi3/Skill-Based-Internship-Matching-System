'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Briefcase, Plus, Search, FileText, Building,
    MessageSquare, Bell, Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * Shared collapsible sidebar for all Employer pages.
 * Shows the InternMatch logo when collapsed, full branding when expanded.
 */
export default function EmployerSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { label: 'Dashboard', path: '/employer/dashboard', icon: LayoutDashboard },
        { label: 'My Postings', path: '/employer/internships', icon: Briefcase },
        { label: 'Post Internship', path: '/employer/internships/create', icon: Plus, id: 'nav-create' },
        { label: 'Search Candidates', path: '/employer/candidates', icon: Search, id: 'nav-candidates' },
        { label: 'Applications', path: '/employer/applications', icon: FileText },
        { label: 'Messages', path: '/employer/messages', icon: MessageSquare },
        { label: 'Company Profile', path: '/employer/profile', icon: Building },
        { label: 'Notifications', path: '/employer/notifications', icon: Bell },
    ];

    return (
        <motion.div
            animate={{ width: isCollapsed ? 80 : 256 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white min-h-screen border-r border-gray-100 flex flex-col p-4 relative hidden md:flex z-20"
        >
            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-indigo-600 hover:shadow-md transition-all z-30"
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Logo Area */}
            <div className={`mb-10 mt-2 flex ${isCollapsed ? 'justify-center' : 'px-2'}`}>
                <Link href="/employer/dashboard">
                    <div className="flex flex-col items-center md:items-start">
                        {isCollapsed ? (
                            <img src="/images/logo.png" alt="IM Logo" className="h-8 w-auto object-contain drop-shadow-sm" />
                        ) : (
                            <>
                                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight whitespace-nowrap">InternMatch</h1>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Employer Portal</span>
                            </>
                        )}
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path || (item.path !== '/employer/dashboard' && pathname?.startsWith(item.path));

                    return (
                        <Link key={item.path} href={item.path} id={item.id}>
                            <div
                                className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 rounded-xl font-bold transition-all duration-200 relative group ${isActive
                                        ? 'text-indigo-600 bg-indigo-50/50'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                title={isCollapsed ? item.label : ''}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="employer-active-sidebar"
                                        className="absolute inset-0 bg-indigo-50 border border-indigo-100/50 rounded-xl"
                                        initial={false}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-3">
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && <span className="whitespace-nowrap text-sm">{item.label}</span>}
                                </span>

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
                                        {item.label}
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Settings & Logout */}
            <div className="mt-auto border-t border-gray-100 pt-6 space-y-2">
                <Link href="/employer/settings">
                    <div
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 rounded-xl font-bold transition-all duration-200 relative group ${pathname === '/employer/settings'
                                ? 'text-indigo-600 bg-indigo-50/50'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        title={isCollapsed ? 'Settings' : ''}
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <Settings className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="text-sm">Settings</span>}
                        </span>
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
                                Settings
                                <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                            </div>
                        )}
                    </div>
                </Link>

                <button
                    onClick={() => {
                        localStorage.removeItem('user');
                        localStorage.removeItem('authToken');
                        document.cookie = 'token=; Max-Age=0; path=/;';
                        window.location.href = '/login';
                    }}
                    title={isCollapsed ? 'Logout' : ''}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-4 gap-3'} py-3 text-gray-500 font-bold hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors relative group`}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm">Logout</span>}
                    {isCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
                            Logout
                            <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-red-600 rotate-45"></div>
                        </div>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
