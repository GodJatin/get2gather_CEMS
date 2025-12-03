'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';

interface LeaderboardEntry {
    rank: number;
    student_name: string;
    department: string;
    score: number;
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/leaderboard');
                setLeaderboard(res.data);
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <MotionWrapper className="max-w-4xl mx-auto">
            <header className="mb-12 text-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl -z-10" />
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 bg-clip-text text-transparent bg-size-200 animate-gradient">
                    🏆 Student Leaderboard
                </h1>
                <p className="text-neutral-400 text-lg">Top active students based on participation and engagement.</p>
            </header>

            <div className="bg-neutral-900/50 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm shadow-2xl shadow-black/50">
                <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/10 bg-white/5 text-neutral-400 font-medium text-sm uppercase tracking-wider">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-5">Student</div>
                    <div className="col-span-3">Department</div>
                    <div className="col-span-2 text-right">Score</div>
                </div>
                
                <StaggerContainer className="divide-y divide-white/5">
                    {leaderboard.map((entry) => (
                        <StaggerItem key={entry.rank} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/5 transition-colors group">
                            <div className="col-span-2 flex justify-center">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg transform group-hover:scale-110 transition-transform ${
                                    entry.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black shadow-yellow-500/20' :
                                    entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black shadow-gray-500/20' :
                                    entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-white shadow-orange-500/20' :
                                    'bg-neutral-800 text-neutral-400 border border-white/10'
                                }`}>
                                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                                </div>
                            </div>
                            <div className="col-span-5 font-bold text-lg text-white group-hover:text-yellow-400 transition-colors flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-700 border border-white/10 flex items-center justify-center text-lg">
                                    {entry.student_name[0]}
                                </div>
                                {entry.student_name}
                            </div>
                            <div className="col-span-3 text-neutral-400">
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-sm">
                                    {entry.department}
                                </span>
                            </div>
                            <div className="col-span-2 text-right font-mono text-xl text-yellow-500 font-bold group-hover:scale-110 transition-transform origin-right">
                                {entry.score.toLocaleString()}
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </MotionWrapper>
    );
}
