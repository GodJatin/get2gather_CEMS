'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper from '@/components/MotionWrapper';

interface OrganizerProfile {
    id: number;
    name: string;
    email: string;
    contact: string;
    total_events: number;
    total_attendees: number;
}

export default function OrganizerProfilePage() {
    const [profile, setProfile] = useState<OrganizerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/me');
                setProfile(res.data);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div className="p-8 text-center text-neutral-400">Loading profile...</div>;
    if (!profile) return <div className="p-8 text-center text-neutral-400">Profile not found</div>;

    return (
        <MotionWrapper className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Organizer Profile</h1>
                <p className="text-neutral-400">Manage your organization and view event statistics.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-purple-500/10 to-transparent" />
                        
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-xl shadow-purple-500/20 border-4 border-neutral-900">
                            {profile.name?.[0] || 'O'}
                        </div>
                        
                        <h2 className="text-xl font-bold mb-1">{profile.name}</h2>
                        <span className="mb-2 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 uppercase tracking-wider">
                            Organizer
                        </span>
                        <p className="text-sm text-neutral-400 mb-6">Event Committee</p>

                        <div className="w-full pt-4 border-t border-white/5 space-y-2 text-sm text-left">
                            <div>
                                <span className="text-neutral-500 block text-xs">Email</span>
                                <span className="text-neutral-300 truncate block">{profile.email}</span>
                            </div>
                            <div>
                                <span className="text-neutral-500 block text-xs">Contact</span>
                                <span className="text-neutral-300">{profile.contact}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats & Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
                            <span className="text-3xl mb-2 block">🎪</span>
                            <span className="text-2xl font-bold block">{profile.total_events || 0}</span>
                            <span className="text-sm text-neutral-400">Events Created</span>
                        </div>
                        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
                            <span className="text-3xl mb-2 block">👥</span>
                            <span className="text-2xl font-bold block">{profile.total_attendees || 0}</span>
                            <span className="text-sm text-neutral-400">Total Attendees</span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => window.location.href = '/organizer/events'}
                                className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center group"
                            >
                                <span>📅 Manage Events</span>
                                <span className="text-neutral-500 group-hover:text-white transition-colors">→</span>
                            </button>
                            <button 
                                onClick={() => window.location.href = '/organizer/events/create'}
                                className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center group"
                            >
                                <span>➕ Create New Event</span>
                                <span className="text-neutral-500 group-hover:text-white transition-colors">→</span>
                            </button>
                        </div>
                    </div>

                    {/* Settings */}
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
