'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

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

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    🏆 Student Leaderboard
                </h1>
                <p className="text-neutral-400">Top active students based on participation.</p>
            </header>

            <div className="bg-neutral-900/50 rounded-3xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-neutral-400">
                        <tr>
                            <th className="p-6 font-medium">Rank</th>
                            <th className="p-6 font-medium">Student</th>
                            <th className="p-6 font-medium">Department</th>
                            <th className="p-6 font-medium text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {leaderboard.map((entry) => (
                            <tr key={entry.rank} className="hover:bg-white/5 transition-colors">
                                <td className="p-6">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                        entry.rank === 1 ? 'bg-yellow-500 text-black' :
                                        entry.rank === 2 ? 'bg-gray-400 text-black' :
                                        entry.rank === 3 ? 'bg-orange-700 text-white' :
                                        'bg-white/10 text-white'
                                    }`}>
                                        {entry.rank}
                                    </div>
                                </td>
                                <td className="p-6 font-bold text-lg">{entry.student_name}</td>
                                <td className="p-6 text-neutral-400">{entry.department}</td>
                                <td className="p-6 text-right font-mono text-xl text-yellow-500 font-bold">
                                    {entry.score}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
