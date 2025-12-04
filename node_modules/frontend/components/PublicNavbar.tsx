'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PublicNavbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-neutral-900/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                        🎓
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                        Get2Gather
                    </span>
                </Link>

                {/* Auth Buttons */}
                <div className="flex items-center gap-4">
                    <Link 
                        href="/login" 
                        className="text-neutral-300 hover:text-white font-medium transition-colors"
                    >
                        Login
                    </Link>
                    <Link 
                        href="/register" 
                        className="px-5 py-2 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
}
