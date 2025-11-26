'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';

interface LeaderboardEntry {
    name: string;
    department: string;
    bookings_count: number;
    points: number;
}

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/auth/leaderboard');
                setLeaders(response.data);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankEmoji = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    return (
        <MotionWrapper className="max-w-4xl mx-auto">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Campus Leaderboard
                </h1>
                <p className="text-neutral-400">Top students leading the engagement charts.</p>
            </header>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-20 rounded-2xl bg-neutral-900/50 animate-pulse" />
                    ))}
                </div>
            ) : (
                <StaggerContainer className="space-y-4">
                    {leaders.map((leader, index) => (
                        <StaggerItem
                            key={index}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
                                index === 0 
                                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/10' 
                                    : index === 1
                                    ? 'bg-gradient-to-r from-neutral-400/20 to-neutral-500/20 border-neutral-400/50'
                                    : index === 2
                                    ? 'bg-gradient-to-r from-orange-700/20 to-orange-800/20 border-orange-700/50'
                                    : 'bg-neutral-900/50 border-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className={`w-12 h-12 flex items-center justify-center text-2xl font-bold ${
                                index < 3 ? 'scale-110' : 'text-neutral-500'
                            }`}>
                                {getRankEmoji(index)}
                            </div>
                            
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {leader.name[0]}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    {leader.name}
                                    {index === 0 && <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">Champion</span>}
                                </h3>
                                <p className="text-sm text-neutral-400">{leader.department}</p>
                            </div>

                            <div className="text-right">
                                <div className="font-bold text-xl text-white">{leader.points}</div>
                                <div className="text-xs text-neutral-500">Points</div>
                            </div>
                        </StaggerItem>
                    ))}

                    {leaders.length === 0 && (
                        <div className="text-center py-12 text-neutral-500">
                            No data available yet.
                        </div>
                    )}
                </StaggerContainer>
            )}
        </MotionWrapper>
    );
}
