'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper from '@/components/MotionWrapper';
import { motion } from 'framer-motion';

interface UserProfile {
    name: string;
    email: string;
    department?: string;
    enrollment_number?: string;
    bookings_count?: number;
    posts_count?: number;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div className="p-8 text-center text-neutral-400">Loading profile...</div>;
    if (!user) return <div className="p-8 text-center text-neutral-400">Profile not found</div>;

    return (
        <MotionWrapper className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                <p className="text-neutral-400">Manage your account and view your activity.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-xl shadow-blue-500/20">
                            {user.name?.[0] || 'U'}
                        </div>
                        <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                        <p className="text-sm text-neutral-400 mb-4">{user.department}</p>
                        <div className="w-full pt-4 border-t border-white/5 space-y-2 text-sm text-left">
                            <div>
                                <span className="text-neutral-500 block text-xs">Email</span>
                                <span className="text-neutral-300">{user.email}</span>
                            </div>
                            <div>
                                <span className="text-neutral-500 block text-xs">Enrollment No.</span>
                                <span className="text-neutral-300">{user.enrollment_number}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats & Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
                            <span className="text-3xl mb-2 block">🎟️</span>
                            <span className="text-2xl font-bold block">{user.bookings_count || 0}</span>
                            <span className="text-sm text-neutral-400">Events Booked</span>
                        </div>
                        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
                            <span className="text-3xl mb-2 block">📝</span>
                            <span className="text-2xl font-bold block">{user.posts_count || 0}</span>
                            <span className="text-sm text-neutral-400">Posts Created</span>
                        </div>
                    </div>

                    {/* Settings / Actions (Placeholder) */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-lg font-bold mb-4">Account Settings</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center group">
                                <span>Edit Profile</span>
                                <span className="text-neutral-500 group-hover:text-white transition-colors">→</span>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center group">
                                <span>Change Password</span>
                                <span className="text-neutral-500 group-hover:text-white transition-colors">→</span>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center group">
                                <span>Notification Preferences</span>
                                <span className="text-neutral-500 group-hover:text-white transition-colors">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MotionWrapper>
    );
}
