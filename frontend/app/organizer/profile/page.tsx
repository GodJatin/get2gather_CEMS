'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import Counter from '@/components/Counter';
import Link from 'next/link';

interface OrganizerProfile {
    id: number;
    name: string;
    email: string;
    contact: string;
    total_events: number;
    total_attendees: number;
    total_volunteers: number;
}

export default function OrganizerProfilePage() {
    const [profile, setProfile] = useState<OrganizerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, statsRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get('/stats/organizer')
                ]);
                
                setProfile({
                    ...profileRes.data,
                    total_events: statsRes.data.total_events,
                    total_attendees: statsRes.data.total_bookings, // Use total_bookings as attendees
                    total_volunteers: statsRes.data.total_volunteers
                });
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    
    if (!profile) return <div className="p-8 text-center text-neutral-400">Profile not found</div>;

    return (
        <MotionWrapper className="max-w-5xl mx-auto">
            <header className="mb-12 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    Organizer Profile
                </h1>
                <p className="text-neutral-400 text-lg">Manage your organization and view event statistics.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden backdrop-blur-sm shadow-xl group hover:border-purple-500/30 transition-colors">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/20 to-transparent" />
                        
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold text-white mb-6 shadow-2xl shadow-purple-500/30 border-4 border-neutral-900 group-hover:scale-105 transition-transform duration-300">
                            {profile.name?.[0] || 'O'}
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-2 text-white">{profile.name}</h2>
                        <span className="mb-4 px-4 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 uppercase tracking-wider">
                            Organizer
                        </span>
                        <p className="text-sm text-neutral-400 mb-8">Event Committee</p>

                        <div className="w-full pt-6 border-t border-white/5 space-y-4 text-sm text-left">
                            <div className="group/item p-3 rounded-xl hover:bg-white/5 transition-colors">
                                <span className="text-neutral-500 block text-xs uppercase tracking-wider mb-1">Email</span>
                                <span className="text-neutral-200 truncate block font-medium group-hover/item:text-purple-400 transition-colors">{profile.email}</span>
                            </div>
                            <div className="group/item p-3 rounded-xl hover:bg-white/5 transition-colors">
                                <span className="text-neutral-500 block text-xs uppercase tracking-wider mb-1">Contact</span>
                                <span className="text-neutral-200 font-medium group-hover/item:text-purple-400 transition-colors">{profile.contact}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats & Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StaggerItem className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all hover:bg-neutral-800/50">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
                            <span className="text-4xl mb-4 block transform group-hover:scale-110 transition-transform origin-left">👥</span>
                            <span className="text-3xl font-bold block text-white mb-1">
                                <Counter value={profile.total_attendees || 0} />
                            </span>
                            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Attendees</span>
                        </StaggerItem>
                        <StaggerItem className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all hover:bg-neutral-800/50">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
                            <span className="text-4xl mb-4 block transform group-hover:scale-110 transition-transform origin-left">🤝</span>
                            <span className="text-3xl font-bold block text-white mb-1">
                                <Counter value={profile.total_volunteers || 0} />
                            </span>
                            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Volunteers</span>
                        </StaggerItem>
                        <StaggerItem className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-pink-500/30 transition-all hover:bg-neutral-800/50">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-colors" />
                            <span className="text-4xl mb-4 block transform group-hover:scale-110 transition-transform origin-left">✨</span>
                            <span className="text-3xl font-bold block text-white mb-1">
                                <Counter value={(profile.total_attendees || 0) + (profile.total_volunteers || 0)} />
                            </span>
                            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Total Participants</span>
                        </StaggerItem>
                    </StaggerContainer>

                    {/* Quick Actions */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>⚡</span> Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                                onClick={() => window.location.href = '/organizer/events'}
                                className="text-left p-4 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all group"
                            >
                                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform origin-left">📅</span>
                                <span className="font-bold text-white block mb-1">Manage Events</span>
                                <span className="text-xs text-neutral-400 group-hover:text-purple-400 transition-colors">View and edit your events →</span>
                            </button>
                            <button 
                                onClick={() => window.location.href = '/organizer/events/create'}
                                className="text-left p-4 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/10 transition-all group"
                            >
                                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform origin-left">➕</span>
                                <span className="font-bold text-white block mb-1">Create Event</span>
                                <span className="text-xs text-neutral-400 group-hover:text-pink-400 transition-colors">Launch a new event →</span>
                            </button>
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>⚙️</span> Account Settings
                        </h3>
                        <div className="space-y-3">
                            <Link href="/organizer/profile/edit" className="w-full text-left px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all flex justify-between items-center group border border-transparent hover:border-white/10">
                                <span className="font-medium text-neutral-200">Edit Profile</span>
                                <span className="text-neutral-500 group-hover:text-white transition-colors transform group-hover:translate-x-1">→</span>
                            </Link>
                            <button className="w-full text-left px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all flex justify-between items-center group border border-transparent hover:border-white/10">
                                <span className="font-medium text-neutral-200">Change Password</span>
                                <span className="text-neutral-500 group-hover:text-white transition-colors transform group-hover:translate-x-1">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MotionWrapper>
    );
}
