'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/student/dashboard', icon: '🏠' },
        { name: 'Feeds', href: '/student/feeds', icon: '📰' },
        { name: 'Calendar', href: '/student/calendar', icon: '📅' },
        { name: 'Leaderboard', href: '/student/leaderboard', icon: '🏆' },
        { name: 'Profile', href: '/student/profile', icon: '👤' },
    ];

    return (
        <div className="min-h-screen flex bg-neutral-950 text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-neutral-900/50 backdrop-blur-xl fixed h-full z-20 hidden md:block">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Get2Gather
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">Student Portal</p>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
                    <Link
                        href="/login"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <span>🚪</span>
                        <span className="font-medium">Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
