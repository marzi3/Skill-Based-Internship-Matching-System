'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Search,
    Zap,
    Briefcase,
    Settings,
    MessageSquare,
    LogOut,
    Menu,
    ChevronLeft,
    UserCircle
} from 'lucide-react';

export default function StudentLayout({ children }) {
    const { logout } = useAuth();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navLinks = [
        { href: '/student-dashboard', icon: LayoutDashboard, label: 'Dashboard', id: 'nav-dashboard' },
        { href: '/student-profile', icon: Settings, label: 'Profile Settings', id: 'nav-profile' },
        { href: '/account', icon: UserCircle, label: 'Account Settings', id: 'nav-account' },
        { href: '/find-internships', icon: Search, label: 'Browse Jobs', id: 'nav-find' },
        { href: '/applications', icon: Briefcase, label: 'My Applications', id: 'nav-applications' },
        { href: '/matches', icon: Zap, label: 'Best Matches', id: 'nav-matches' },
        { href: '/messages', icon: MessageSquare, label: 'Messages', id: 'nav-messages' },
    ];

    return (
        <ProtectedRoute requiredRole="student">
            <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden relative">
                {/* Desktop Sidebar */}
                <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 hidden md:flex flex-col transition-all duration-300 ease-in-out z-20 shrink-0`}>
                    <div className={`p-6 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                        {isSidebarOpen && <h2 className="text-2xl font-black text-primary-600 tracking-tighter">InternMatch</h2>}
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                    <nav className="flex-1 px-4 space-y-2 mt-2">
                        {navLinks.map((link) => {
                            const isActive = link.href === '/student-profile'
                                ? pathname === '/student-profile' || pathname.startsWith('/student-profile/')
                                : pathname === link.href;
                            return (
                                <Link 
                                    key={link.href}
                                    id={link.id} 
                                    href={link.href} 
                                    className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 rounded-xl font-bold transition-all ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`} 
                                    title={link.label}
                                >
                                    <link.icon size={20} className="flex-shrink-0" />
                                    {isSidebarOpen && <span>{link.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4 border-t border-gray-100 space-y-2">
                        <button onClick={logout} className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-all`} title="Logout">
                            <LogOut size={20} className="flex-shrink-0" />
                            {isSidebarOpen && <span>Logout</span>}
                        </button>
                    </div>
                </aside>

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    {[
                        { href: '/student-dashboard', icon: LayoutDashboard, label: 'Home' },
                        { href: '/find-internships', icon: Search, label: 'Search' },
                        { href: '/matches', icon: Zap, label: 'Matches' },
                        { href: '/account', icon: UserCircle, label: 'Account' },
                        { href: '/student-profile', icon: Settings, label: 'Profile' }
                    ].map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className={`flex flex-col items-center transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}>
                                <item.icon size={24} />
                                <span className="text-[10px] font-bold mt-1">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative flex flex-col h-screen">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
