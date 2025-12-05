'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [role, setRole] = useState<'student' | 'organizer' | 'admin'>('student');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;

            // OAuth2 password flow requires application/x-www-form-urlencoded
            const response = await api.post('/auth/login',
                new URLSearchParams({
                    username: email,
                    password: password,
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            localStorage.setItem('token', response.data.access_token);
            const userRole = response.data.role;
            localStorage.setItem('role', userRole);

            if (userRole === 'student') {
                window.location.href = '/student/dashboard';
            } else if (userRole === 'organizer') {
                window.location.href = '/organizer/dashboard';
            } else if (userRole === 'admin') {
                window.location.href = '/admin/dashboard';
            } else {
                // Fallback
                if (role === 'student') window.location.href = '/student/dashboard';
                else if (role === 'organizer') window.location.href = '/organizer/dashboard';
                else window.location.href = '/admin/dashboard';
            }
        } catch (error: any) {
            console.error('Login failed:', error);
            alert('Login failed: ' + (error.response?.data?.detail || 'Unknown error'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-6 relative overflow-hidden">
            {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px]" />
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-full max-w-md p-8 rounded-3xl bg-neutral-900/50 border border-white/10 backdrop-blur-xl relative z-10"
                >
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <Image src="/logo.png" alt="Get2Gather" width={180} height={50} className="h-12 w-auto" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-neutral-400 text-sm">Sign in to continue to Get2Gather</p>
                    </div>

                    {/* Role Toggle */}
                    <div className="flex p-1 mb-8 rounded-xl bg-neutral-800/50 border border-white/5">
                        <button
                            onClick={() => setRole('student')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'student'
                                ? 'bg-primary text-white shadow-lg'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            Student
                        </button>
                        <button
                            onClick={() => setRole('organizer')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'organizer'
                                ? 'bg-secondary text-white shadow-lg'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            Organizer
                        </button>
                        <button
                            onClick={() => setRole('admin')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'admin'
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            Admin
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                {role === 'student' ? 'College Email ID' : role === 'organizer' ? 'Organizer Email' : 'Admin Email'}
                            </label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={role === 'admin' ? 'admin@get2gather.com' : ''}
                                placeholder={role === 'student' ? '1234567890123@paruluniversity.ac.in' : role === 'organizer' ? 'organizer@college.edu' : 'admin@get2gather.com'}
                                className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
                            <input
                                name="password"
                                type="password"
                                defaultValue={role === 'admin' ? 'admin123' : ''}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] ${role === 'student'
                                ? 'bg-primary hover:bg-primary/80 shadow-primary/20'
                                : role === 'organizer'
                                    ? 'bg-secondary hover:bg-secondary/80 shadow-secondary/20'
                                    : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                                }`}
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-neutral-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-primary hover:underline">
                            Register now
                        </Link>
                    </div>
                </motion.div>
            </div>
    );
}
