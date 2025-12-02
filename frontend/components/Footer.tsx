'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Footer() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        setIsLoggedIn(!!token);
        setRole(userRole);
    }, []);

    const getLink = (path: string, defaultPath: string = '/login') => {
        if (!isLoggedIn) return defaultPath;
        if (role === 'student') return `/student/${path}`;
        if (role === 'organizer') return `/organizer/${path}`;
        return defaultPath;
    };

    return (
        <footer className="relative bg-neutral-950 border-t border-white/5 py-8 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
                <p>© {new Date().getFullYear()} Get2Gather. All rights reserved.</p>
                <div className="flex gap-8">
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
