'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';

interface ProfileData {
    id: number;
    name: string;
    department: string;
    title?: string;
    badges: { name: string; icon: string }[];
    stats: {
        events_attended: number;
        volunteer_count: number;
    };
    is_following: bool;
    followers_count: number;
    following_count: number;
    recent_activity: { type: string; event_title: string; date: string }[];
}

export default function PublicProfilePage() {
    const { id } = useParams();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`/social/profile/${id}`);
                setProfile(response.data);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProfile();
    }, [id]);

    const handleFollow = async () => {
        if (!profile) return;
        setFollowLoading(true);
        try {
            await api.post(`/social/follow/${profile.id}`);
            setProfile(prev => prev ? ({
                ...prev,
                is_following: !prev.is_following,
                followers_count: prev.is_following ? prev.followers_count - 1 : prev.followers_count + 1
            }) : null);
        } catch (error) {
            console.error('Failed to follow user:', error);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!profile) {
        return <div className="text-center py-20 text-neutral-400">User not found.</div>;
    }

    return (
        <MotionWrapper className="max-w-4xl mx-auto p-6">
            {/* Header Card */}
            <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl" />
                
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-5xl font-bold text-white shadow-2xl border-4 border-neutral-900">
                        {profile.name[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                            <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                            {profile.title && (
                                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-500/30 uppercase tracking-wider">
                                    {profile.title}
                                </span>
                            )}
                        </div>
                        <p className="text-neutral-400 mb-4">{profile.department}</p>
                        
                        <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
                            <div className="text-center">
                                <div className="font-bold text-white text-lg">{profile.followers_count}</div>
                                <div className="text-neutral-500">Followers</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-white text-lg">{profile.following_count}</div>
                                <div className="text-neutral-500">Following</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-white text-lg">{profile.stats.events_attended}</div>
                                <div className="text-neutral-500">Events</div>
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <div>
                        <button
                            onClick={handleFollow}
                            disabled={followLoading}
                            className={`px-8 py-3 rounded-xl font-bold transition-all ${
                                profile.is_following
                                    ? 'bg-neutral-800 text-white border border-white/10 hover:bg-neutral-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                            }`}
                        >
                            {followLoading ? '...' : profile.is_following ? 'Unfollow' : 'Follow'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Badges */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span>🏆</span> Badges
                        </h3>
                        {profile.badges.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {profile.badges.map((badge, i) => (
                                    <div key={i} className="aspect-square rounded-xl bg-white/5 flex flex-col items-center justify-center p-2 border border-white/5" title={badge.name}>
                                        <span className="text-2xl">{badge.icon}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-500">No badges yet.</p>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="md:col-span-2">
                    <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
                    <StaggerContainer className="space-y-4">
                        {profile.recent_activity.length > 0 ? (
                            profile.recent_activity.map((activity, i) => (
                                <StaggerItem key={i} className="bg-neutral-900/30 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                        🎫
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">
                                            Booked <span className="text-blue-400">{activity.event_title}</span>
                                        </p>
                                        <p className="text-xs text-neutral-500">{new Date(activity.date).toLocaleDateString()}</p>
                                    </div>
                                </StaggerItem>
                            ))
                        ) : (
                            <div className="text-neutral-500">No recent activity.</div>
                        )}
                    </StaggerContainer>
                </div>
            </div>
        </MotionWrapper>
    );
}
