'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, ShieldAlert, BarChart2, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { label: 'Verifications', path: '/admin/verifications', icon: <ShieldAlert size={20} /> },
        { label: 'Students', path: '/admin/users/students', icon: <Users size={20} /> },
        { label: 'Employers', path: '/admin/employers', icon: <Users size={20} /> },
        { label: 'Moderation', path: '/admin/moderation', icon: <ShieldAlert size={20} /> },
        { label: 'Reports', path: '/admin/reports', icon: <BarChart2 size={20} /> },
    ];

    return (
        <motion.div
            animate={{ width: isCollapsed ? 80 : 256 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white min-h-screen border-r border-gray-100 flex flex-col p-4 relative hidden md:flex z-20"
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-indigo-600 hover:shadow-md transition-all z-30"
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div className={`mb-10 mt-2 flex ${isCollapsed ? 'justify-center' : 'px-2'}`}>
                <Link href="/admin">
                    <div className="flex flex-col items-center md:items-start">
                        {isCollapsed ? (
                            <img src="/images/logo.png" alt="IM Logo" className="h-8 w-auto object-contain drop-shadow-sm" />
                        ) : (
                            <>
                                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight whitespace-nowrap">InternMatch</h1>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Admin Portal</span>
                            </>
                        )}
                    </div>
                </Link>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;

                    return (
                        <Link key={item.path} href={item.path}>
                            <div
                                className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 rounded-xl font-bold transition-all duration-200 relative group ${isActive ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                title={isCollapsed ? item.label : ''}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-sidebar"
                                        className="absolute inset-0 bg-indigo-50 border border-indigo-100/50 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-3">
                                    {item.icon}
                                    {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
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

            <div className="mt-auto border-t border-gray-100 pt-6 space-y-2">
                <button
                    onClick={() => {
                        localStorage.removeItem('user');
                        localStorage.removeItem('authToken');
                        document.cookie = 'token=; Max-Age=0; path=/;';
                        window.location.href = '/login';
                    }}
                    title={isCollapsed ? "Logout" : ""}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-4 gap-3'} py-3 text-gray-500 font-bold hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors relative group`}
                >
                    <LogOut size={20} className={isCollapsed ? "ml-1" : ""} />
                    {!isCollapsed && <span>Logout</span>}

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
