'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper from '@/components/MotionWrapper';
import { motion } from 'framer-motion';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    department?: string;
    enrollment_number?: string;
    title?: string;
    badges?: { name: string; icon: string }[];
    bookings_count?: number;
    posts_count?: number;
    volunteer_count?: number;
    stats?: {
        events_attended: number;
    };
    available_points?: number;
    total_points?: number;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // 1. Get basic auth info to get ID
                const authRes = await api.get('/auth/me');
                setUser(authRes.data);
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

    // Use real points from backend
    const points = user.available_points || 0; 
    const nextUnlock = 1000;
    const progress = Math.min((points / nextUnlock) * 100, 100);

    return (
        <MotionWrapper className="max-w-4xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                    <p className="text-neutral-400">Manage your account and view your activity.</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-500">{points} pts</div>
                    <div className="text-xs text-neutral-500">Available Balance</div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-500/10 to-transparent" />
                        
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-xl shadow-blue-500/20 border-4 border-neutral-900">
                            {user.name?.[0] || 'U'}
                        </div>
                        
                        <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                        {user.title && (
                            <span className="mb-2 px-3 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] font-bold border border-yellow-500/30 uppercase tracking-wider">
                                {user.title}
                            </span>
                        )}
                        <p className="text-sm text-neutral-400 mb-6">{user.department}</p>

                        {/* Gamification Progress */}
                        <div className="w-full bg-neutral-800 rounded-full h-2 mb-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-neutral-500 mb-6">
                            {points} / {nextUnlock} points to unlock <strong>"Campus Celebrity"</strong> Badge
                        </p>

                        <div className="w-full pt-4 border-t border-white/5 space-y-2 text-sm text-left">
                            <div>
                                <span className="text-neutral-500 block text-xs">Email</span>
                                <span className="text-neutral-300 truncate">{user.email}</span>
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
                            <span className="text-3xl mb-2 block">✅</span>
                            <span className="text-2xl font-bold block">{user.stats?.events_attended || 0}</span>
                            <span className="text-sm text-neutral-400">Events Attended</span>
                        </div>
                        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
                            <span className="text-3xl mb-2 block">📝</span>
                            <span className="text-2xl font-bold block">{user.posts_count || 0}</span>
                            <span className="text-sm text-neutral-400">Posts Created</span>
                        </div>
                        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => window.location.href = '/student/points'}>
                            <span className="text-3xl mb-2 block">💎</span>
                            <span className="text-2xl font-bold block text-yellow-500">{points}</span>
                            <span className="text-sm text-neutral-400">Points & Rewards →</span>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span>🏆</span> My Badges
                        </h3>
                        {user.badges && user.badges.length > 0 ? (
                            <div className="flex gap-4 flex-wrap">
                                {user.badges.map((badge, i) => (
                                    <div key={i} className="w-16 h-16 rounded-xl bg-white/5 flex flex-col items-center justify-center p-2 border border-white/5" title={badge.name}>
                                        <span className="text-3xl">{badge.icon}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-500">
                                Participate in events to earn badges!
                            </p>
                        )}
                    </div>

                    {/* Settings / Actions */}
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
                        </div>
                    </div>
                </div>
            </div>
        </MotionWrapper>
    );
}
