'use client';

import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';

export default function OrganizerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/organizer/dashboard', icon: '📊' },
        { name: 'My Events', href: '/organizer/events', icon: '📅' },
        { name: 'Create Event', href: '/organizer/events/create', icon: '➕' },
        { name: 'Scan', href: '/organizer/scan', icon: '📱' },
        { name: 'Leaderboard', href: '/organizer/leaderboard', icon: '🏆' },
        { name: 'Profile', href: '/organizer/profile', icon: '👤' },
    ];

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-neutral-900/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-xl">
                            G
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none">Get2Gather</h1>
                            <p className="text-xs text-neutral-400">Organizer</p>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                                        isActive
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Desktop Logout */}
                    <Link
                        href="/login"
                        className="hidden md:block px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium text-sm transition-colors"
                    >
                        Logout
                    </Link>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-neutral-900 border-b border-white/10 p-4 flex flex-col gap-2 shadow-2xl">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`p-4 rounded-xl text-base font-medium transition-all flex items-center gap-3 ${
                                        isActive
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white/5 text-neutral-400'
                                    }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                        <Link
                            href="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-4 rounded-xl bg-red-500/10 text-red-400 font-medium text-base flex items-center gap-3 mt-2"
                        >
                            <span>🚪</span> Logout
                        </Link>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="pt-24 md:pt-28 px-4 md:px-6 pb-12 w-full max-w-[100vw] overflow-x-hidden mx-auto">
                {children}
            </main>
        </div>
    );
}
