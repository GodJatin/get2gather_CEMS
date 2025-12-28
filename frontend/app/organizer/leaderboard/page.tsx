'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import { AnimatePresence, motion } from 'framer-motion';

interface Badge {
    name: string;
    icon: string;
    description: string;
}

interface LeaderboardEntry {
    rank: number;
    student_id: number;
    student_name: string;
    email: string; // Added email
    department: string;
    score: number;
    title?: string;
    badges: Badge[];
}

// Student Profile Modal Component
const StudentProfileModal = ({ student, onClose }: { student: LeaderboardEntry | null, onClose: () => void }) => {
    if (!student) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative z-10 w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative text-center mb-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-700 border-4 border-neutral-900 shadow-xl flex items-center justify-center text-4xl font-bold text-white relative">
                        {student.student_name[0]}
                        {student.rank <= 3 && (
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-lg shadow-lg border-2 border-neutral-900">
                                {['🥇', '🥈', '🥉'][student.rank - 1]}
                            </div>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{student.student_name}</h2>
                    <p className="text-yellow-500 font-bold text-sm tracking-wider uppercase mb-2">{student.title || 'Novice'}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs text-neutral-400">
                        {student.department}
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-neutral-400 text-sm">Total Score</span>
                        <span className="text-2xl font-bold text-yellow-400 font-mono">{student.score.toLocaleString()}</span>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Contact Info</label>
                        <div className="flex items-center gap-2 text-neutral-300">
                            <span>✉️</span>
                            <a href={`mailto:${student.email}`} className="hover:text-yellow-400 transition-colors break-all">{student.email}</a>
                        </div>
                    </div>

                    {student.badges.length > 0 && (
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 block">Earned Badges</label>
                            <div className="flex flex-wrap gap-3">
                                {student.badges.map((badge, i) => (
                                    <div key={i} className="group relative flex items-center justify-center w-10 h-10 bg-black/40 rounded-full border border-yellow-500/20 shadow-sm cursor-help hover:scale-110 transition-transform hover:bg-yellow-500/10 hover:border-yellow-500/50">
                                        <span className="text-xl">{badge.icon}</span>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-900 border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                            {badge.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-colors"
                >
                    Close Profile
                </button>
            </motion.div>
        </div>
    );
};

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<LeaderboardEntry | null>(null);

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
        <MotionWrapper className="max-w-4xl mx-auto relative">
            {/* Unique Background for Leaderboard */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/0 via-neutral-950/50 to-neutral-950" />
            </div>

            <header className="mb-12 text-center relative flex flex-col items-center justify-center min-h-[160px]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl -z-10" />

                {/* Export Button - Moved to Top Right */}
                <button
                    onClick={() => {
                        const headers = ["Rank", "Student Name", "Email", "Department", "Score", "Title"];
                        const csvContent = [
                            headers.join(","),
                            ...leaderboard.map(e => [
                                e.rank,
                                `"${e.student_name}"`,
                                e.email,
                                e.department,
                                e.score,
                                e.title || "Novice"
                            ].join(","))
                        ].join("\n");

                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `leaderboard_${new Date().toISOString().split('T')[0]}.csv`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }}
                    className="absolute top-0 right-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-white/70 hover:text-white"
                >
                    <span>⬇️</span> Export CSV
                </button>

                <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 bg-clip-text text-transparent bg-size-200 animate-gradient">
                    🏆 Student Leaderboard
                </h1>
                <p className="text-neutral-400 text-sm md:text-lg">Top active students based on participation and engagement.</p>
            </header>

            <div className="bg-neutral-900/50 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm shadow-2xl shadow-black/50">
                <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-white/10 bg-white/5 text-neutral-400 font-medium text-sm uppercase tracking-wider">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-5">Student</div>
                    <div className="col-span-3">Department</div>
                    <div className="col-span-2 text-right">Score</div>
                </div>

                <StaggerContainer className="divide-y divide-white/5">
                    {leaderboard.map((entry) => (
                        <StaggerItem
                            key={entry.rank}
                            className="group cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setSelectedStudent(entry)}
                        >
                            {/* Desktop View */}
                            <div className="hidden md:grid grid-cols-12 gap-4 p-6 items-center">
                                <div className="col-span-2 flex justify-center">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg transform group-hover:scale-110 transition-transform ${entry.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black shadow-yellow-500/20' :
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
                                    <div>
                                        <div>{entry.student_name}</div>
                                        <div className="text-xs text-neutral-500 font-normal group-hover:text-yellow-500/70 transition-colors">View Profile</div>
                                    </div>
                                </div>
                                <div className="col-span-3 text-neutral-400">
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-sm">
                                        {entry.department}
                                    </span>
                                </div>
                                <div className="col-span-2 text-right font-mono text-xl text-yellow-500 font-bold group-hover:scale-110 transition-transform origin-right">
                                    {entry.score.toLocaleString()}
                                </div>
                            </div>

                            {/* Mobile View */}
                            <div className="md:hidden flex items-center gap-4 p-4">
                                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg ${entry.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black' :
                                    entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                                        entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-white' :
                                            'bg-neutral-800 text-neutral-400 border border-white/10'
                                    }`}>
                                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white truncate text-base">{entry.student_name}</h3>
                                    <p className="text-xs text-neutral-500 truncate">{entry.department} • {entry.title || 'Novice'}</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-lg font-bold text-yellow-500">{entry.score}</div>
                                    <p className="text-[10px] text-neutral-600">POINTS</p>
                                </div>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>

            <AnimatePresence>
                {selectedStudent && (
                    <StudentProfileModal
                        student={selectedStudent}
                        onClose={() => setSelectedStudent(null)}
                    />
                )}
            </AnimatePresence>
            {/* Mobile Floating Download Button */}
            <button
                onClick={() => {
                    const headers = ["Rank", "Student Name", "Email", "Department", "Score", "Title"];
                    const csvContent = [
                        headers.join(","),
                        ...leaderboard.map(e => [
                            e.rank,
                            `"${e.student_name}"`,
                            e.email,
                            e.department,
                            e.score,
                            e.title || "Novice"
                        ].join(","))
                    ].join("\n");

                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `leaderboard_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }}
                className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-yellow-500 text-black rounded-full shadow-2xl flex items-center justify-center text-2xl border-4 border-black active:scale-95 transition-transform"
                aria-label="Export CSV"
            >
                ⬇️
            </button>
        </MotionWrapper>
    );
}
