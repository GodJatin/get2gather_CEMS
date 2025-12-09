'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import Link from 'next/link';

interface Event {
    id: number;
    title: string;
    attended_count: number;
    volunteer_count: number;
    capacity: number;
    date: string;
}

interface LeaderboardEntry {
    rank: number;
    student_name: string;
    score: number;
    department: string;
}

export default function AnalyticsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventsRes, leaderboardRes] = await Promise.all([
                    api.get('/events/my'),
                    api.get('/leaderboard')
                ]);
                setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
                setLeaderboard(Array.isArray(leaderboardRes.data) ? leaderboardRes.data.slice(0, 5) : []);
            } catch (error) {
                console.error("Failed to fetch analytics data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Derived Stats
    const totalAttendees = events.reduce((acc, e) => acc + (e.attended_count || 0), 0);
    const totalVolunteers = events.reduce((acc, e) => acc + (e.volunteer_count || 0), 0);
    const totalEvents = events.length;
    const avgAttendance = totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0;

    // Chart Data Preparation (Last 5 events)
    const chartEvents = [...events].slice(-5);
    const maxCapacity = Math.max(...chartEvents.map(e => e.capacity), 1);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <MotionWrapper className="max-w-7xl mx-auto pb-20">
             {/* Header */}
             <header className="mb-12">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Analytics Dashboard</span>
                    <span className="text-3xl">📊</span>
                </h1>
                <p className="text-neutral-400">Insights into your events' performance and engagement.</p>
            </header>

            {/* Key Metrics */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Events', value: totalEvents, icon: '📅', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Total Attendees', value: totalAttendees, icon: '👥', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Avg Attendance', value: avgAttendance, icon: '📈', color: 'text-green-400', bg: 'bg-green-500/10' },
                    { label: 'Total Volunteers', value: totalVolunteers, icon: '🤝', color: 'text-pink-400', bg: 'bg-pink-500/10' },
                ].map((stat, i) => (
                    <StaggerItem key={i} className={`p-6 rounded-2xl border border-white/5 ${stat.bg} backdrop-blur-sm`}>
                        <div className="flex items-center gap-4">
                            <div className="text-3xl">{stat.icon}</div>
                            <div>
                                <p className="text-sm text-neutral-400 uppercase tracking-wider font-bold mb-1">{stat.label}</p>
                                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                        </div>
                    </StaggerItem>
                ))}
            </StaggerContainer>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart: Event Participation */}
                <div className="lg:col-span-2 bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <span>📉</span> Event Engagement (Last 5 Events)
                    </h2>
                    
                    <div className="space-y-6">
                        {chartEvents.length === 0 ? (
                            <p className="text-center text-neutral-500 py-10">No events data available yet.</p>
                        ) : (
                            chartEvents.map((event) => {
                                const capacity = event.capacity || 1; // Avoid division by zero
                                const percentage = Math.min(Math.round((event.attended_count / capacity) * 100), 100);
                                
                                return (
                                    <div key={event.id} className="group">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-1">{event.title}</span>
                                            <span className="text-neutral-400 whitespace-nowrap ml-2">{event.attended_count} / {event.capacity} ({percentage}%)</span>
                                        </div>
                                        {/* Bar Container */}
                                        <div className="h-4 bg-neutral-800 rounded-full overflow-hidden w-full border border-white/5 relative">
                                            {/* Attendees Bar */}
                                            <div 
                                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full relative group-hover:brightness-110 transition-all duration-1000"
                                                style={{ 
                                                    width: `${Math.max(percentage, event.attended_count > 0 ? 2 : 0)}%`
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between mt-1 text-xs text-neutral-500">
                                            <span>{new Date(event.date).toLocaleDateString()}</span>
                                            <span>{event.volunteer_count} Volunteers</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Top Students / Leaderboard Snippet */}
                <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span>🏆</span> Top Performers
                        </h2>
                        <Link href="/organizer/leaderboard" className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider">
                            View All
                        </Link>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                        {leaderboard.map((student, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                    student.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                    student.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                                    student.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-neutral-700 text-neutral-400'
                                }`}>
                                    #{student.rank}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white truncate">{student.student_name}</p>
                                    <p className="text-xs text-neutral-500 truncate">{student.department}</p>
                                </div>
                                <div className="font-mono font-bold text-yellow-500">
                                    {student.score}
                                </div>
                            </div>
                        ))}
                        
                        {leaderboard.length === 0 && (
                            <p className="text-center text-neutral-500 py-10">No leaderboard data.</p>
                        )}
                    </div>
                </div>
            </div>
        </MotionWrapper>
    );
}
