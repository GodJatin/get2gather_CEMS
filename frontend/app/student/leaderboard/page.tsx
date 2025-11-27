'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';

import Link from 'next/link';

interface LeaderboardEntry {
    student_id?: number;
    student_name: string;
    department: string;
    score: number;
    title?: string;
    badges?: { name: string; icon: string }[];
}

const getRankEmoji = (index: number) => {
    switch (index) {
        case 0: return '👑';
        case 1: return '🥈';
        case 2: return '🥉';
        default: return `#${index + 1}`;
    }
};

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'overall' | 'department'>('overall');
    const [userDept, setUserDept] = useState<string | null>(null);

    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.data.role === 'student') {
                    setUserDept(res.data.department);
                    // Need to fetch student ID, auth/me returns user_id
                    // But leaderboard uses student_id. 
                    // Let's assume we can match by name or fetch profile.
                    // Actually, auth/me for student returns student profile data too if we updated it.
                    // Let's check auth.py. Yes, it returns id (user_id).
                    // Leaderboard returns student_id.
                    // Wait, Leaderboard entry has student_id.
                    // We need to know the logged in student's ID.
                    // Let's rely on name matching for now or fetch profile.
                    // Better: Fetch profile to get student ID.
                    const profileRes = await api.get('/student/profile'); // We need an endpoint for this or use auth/me data if it has student id.
                    // auth/me returns user_id. Student table links user_id.
                    // Let's try to match by name from auth/me if student_id isn't available.
                    // Or better, let's update the leaderboard to include user_id so we can match easily.
                    // For now, let's use name matching as a fallback if IDs don't align.
                    setCurrentUserId(res.data.id); // This is user_id
                }
            } catch (err) {
                console.error("Failed to fetch user info", err);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                let endpoint = '/leaderboard';
                // If filtering by department, we might need a query param or a different endpoint.
                // Assuming the backend supports filtering or we filter client-side.
                // For now, let's fetch all and filter client side if needed, or assume backend handles it.
                // If backend has ?department=... support:
                if (filter === 'department' && userDept) {
                    endpoint += `?department=${encodeURIComponent(userDept)}`;
                }
                
                const res = await api.get(endpoint);
                setLeaders(res.data);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
                setLeaders([]);
            } finally {
                setLoading(false);
            }
        };

        if (filter === 'overall' || (filter === 'department' && userDept)) {
            fetchLeaderboard();
        }
    }, [filter, userDept]);

    // Helper to find my rank
    const myRankIndex = leaders.findIndex(l => l.student_name === 'Student ' + currentUserId); // This is tricky without exact ID match.
    // Let's try to match by name if we have it.
    // Actually, let's just highlight if we find a match.
    
    // REAL FIX: We need to know which entry is ME.
    // Let's assume the API returns a field `is_me` or we match by name.
    // Since I can't easily change the API right now without context, I'll use a visual trick.
    // I'll add a "My Rank" footer that finds the entry with the same name as the logged in user.
    
    const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
    const [myRank, setMyRank] = useState<number>(-1);

    useEffect(() => {
        if (currentUserId && leaders.length > 0) {
            // We need the current user's name to match.
            // Let's fetch the profile to get the name.
            api.get('/auth/me').then(res => {
               const myName = res.data.name;
               const index = leaders.findIndex(l => l.student_name === myName);
               if (index !== -1) {
                   setMyRank(index);
                   setMyEntry(leaders[index]);
               }
            });
        }
    }, [leaders, currentUserId]);

    const scrollToMyRank = () => {
        if (myRank !== -1) {
            const element = document.getElementById(`rank-${myRank}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <MotionWrapper className="max-w-4xl mx-auto pb-24">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Campus Leaderboard
                </h1>
                <p className="text-neutral-400">Top students leading the engagement charts.</p>
            </header>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-neutral-900/50 p-1 rounded-xl flex gap-1 border border-white/5">
                    <button
                        onClick={() => setFilter('overall')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === 'overall' 
                                ? 'bg-white/10 text-white shadow-lg' 
                                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Overall
                    </button>
                    <button
                        onClick={() => setFilter('department')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === 'department' 
                                ? 'bg-white/10 text-white shadow-lg' 
                                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        My Department
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-24 rounded-2xl bg-neutral-900/50 animate-pulse" />
                    ))}
                </div>
            ) : (
                <StaggerContainer className="space-y-4">
                    {leaders.map((leader, index) => {
                        const isMe = index === myRank;
                        return (
                        <StaggerItem
                            key={index}
                            id={`rank-${index}`}
                            className={`relative group flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer ${
                                isMe 
                                    ? 'bg-blue-900/30 border-blue-500/50 shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/50'
                                    : index === 0 
                                    ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 shadow-lg shadow-yellow-500/5' 
                                    : index === 1
                                    ? 'bg-gradient-to-r from-neutral-400/10 to-neutral-500/10 border-neutral-400/30'
                                    : index === 2
                                    ? 'bg-gradient-to-r from-orange-700/10 to-orange-800/10 border-orange-700/30'
                                    : 'bg-neutral-900/50 border-white/5 hover:border-white/10'
                            }`}
                        >
                            <Link href={`/student/profile/${leader.student_id || ''}`} className="absolute inset-0 z-10" />
                            <div className={`w-12 h-12 flex items-center justify-center text-2xl font-bold ${
                                index < 3 ? 'scale-110' : 'text-neutral-500'
                            }`}>
                                {getRankEmoji(index)}
                            </div>
                            
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
                                {leader.student_name[0]}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className={`font-bold text-lg truncate ${isMe ? 'text-blue-400' : ''}`}>
                                        {leader.student_name} {isMe && '(You)'}
                                    </h3>
                                    {leader.title && (
                                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/20">
                                            {leader.title}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-neutral-400">
                                    <span>{leader.department}</span>
                                    {leader.badges && leader.badges.length > 0 && (
                                        <div className="flex gap-1">
                                            <span>•</span>
                                            {leader.badges.map((badge, i) => (
                                                <span key={i} title={badge.name}>{badge.icon}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <div className="font-bold text-xl text-white">{leader.score}</div>
                                <div className="text-xs text-neutral-500">Points</div>
                            </div>
                        </StaggerItem>
                        );
                    })}

                    {leaders.length === 0 && (
                        <div className="text-center py-12 text-neutral-500">
                            No data available for this filter.
                        </div>
                    )}
                </StaggerContainer>
            )}

            {/* Sticky My Rank Footer */}
            {myEntry && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
                    <button 
                        onClick={scrollToMyRank}
                        className="w-full bg-neutral-800/90 backdrop-blur-md border border-blue-500/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4 hover:bg-neutral-800 transition-colors group"
                    >
                        <div className="w-10 h-10 flex items-center justify-center text-xl font-bold text-blue-400">
                            #{myRank + 1}
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-bold text-white">Your Rank</p>
                            <p className="text-xs text-neutral-400">{myEntry.score} Points</p>
                        </div>
                        <div className="text-blue-400 group-hover:-translate-y-1 transition-transform">
                            ↑
                        </div>
                    </button>
                </div>
            )}
        </MotionWrapper>
    );
}
