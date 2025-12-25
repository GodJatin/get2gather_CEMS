'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import Link from 'next/link';
import { triggerConfetti, triggerSchoolPride } from '@/components/Confetti';

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
                    setCurrentUserId(res.data.id);
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
                if (filter === 'department' && userDept) {
                    endpoint += `?department=${encodeURIComponent(userDept)}`;
                }

                const res = await api.get(endpoint);
                setLeaders(res.data);

                if (res.data.length > 0) {
                    triggerSchoolPride();
                }
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

    const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
    const [myRank, setMyRank] = useState<number>(-1);

    useEffect(() => {
        if (currentUserId && leaders.length > 0) {
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
                <h1 className="text-4xl font-bold mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-accent bg-[length:200%_auto] animate-shine">
                        Campus Leaderboard
                    </span>
                </h1>
                <p className="text-neutral-400">Top students leading the engagement charts.</p>
            </header>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-neutral-900/50 p-1 rounded-xl flex gap-1 border border-white/5">
                    <button
                        onClick={() => setFilter('overall')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'overall'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Overall
                    </button>
                    <button
                        onClick={() => setFilter('department')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'department'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
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
                                className={`relative group flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer ${isMe
                                    ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/10 ring-1 ring-primary/50'
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
                                <div className={`w-12 h-12 flex items-center justify-center text-2xl font-bold ${index < 3 ? 'scale-110' : 'text-neutral-500'
                                    }`}>
                                    {getRankEmoji(index)}
                                </div>

                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0 ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-600' :
                                    index === 1 ? 'bg-gradient-to-br from-neutral-300 to-neutral-500' :
                                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700' :
                                            'bg-gradient-to-br from-primary to-secondary'
                                    }`}>
                                    {leader.student_name[0]}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className={`font-bold text-lg truncate ${isMe ? 'text-primary' : ''}`}>
                                            {leader.student_name} {isMe && '(You)'}
                                        </h3>
                                        {leader.title && (
                                            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/20">
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
                                    <div className="font-bold text-xl text-white">{leader.score.toLocaleString()}</div>
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
                        className="w-full bg-neutral-900/90 backdrop-blur-md border border-primary/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4 hover:bg-neutral-800 transition-colors group"
                    >
                        <div className="w-10 h-10 flex items-center justify-center text-xl font-bold text-primary">
                            #{myRank + 1}
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-bold text-white">Your Rank</p>
                            <p className="text-xs text-neutral-400">{myEntry.score.toLocaleString()} Points</p>
                        </div>
                        <div className="text-primary group-hover:-translate-y-1 transition-transform">
                            ↑
                        </div>
                    </button>
                </div>
            )}
        </MotionWrapper>
    );
}
