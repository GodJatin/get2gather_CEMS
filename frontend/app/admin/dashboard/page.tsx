'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import Counter from '@/components/Counter';

interface AdminStats {
    total_users: number;
    total_students: number;
    total_organizers: number;
    total_events: number;
    total_bookings: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Users', value: stats?.total_users || 0, icon: '👥', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { title: 'Students', value: stats?.total_students || 0, icon: '🎓', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
        { title: 'Organizers', value: stats?.total_organizers || 0, icon: '🏢', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        { title: 'Events', value: stats?.total_events || 0, icon: '📅', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
        { title: 'Bookings', value: stats?.total_bookings || 0, icon: '🎟️', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    ];

    return (
        <MotionWrapper>
            <header className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 to-neutral-800 border border-white/10 p-8 md:p-12 group">
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Dashboard</span>
                    </h1>
                    <p className="text-lg text-neutral-300 max-w-2xl">
                        Monitor platform activity, user growth, and system health.
                    </p>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors duration-1000" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-colors duration-1000" />
            </header>

            {loading ? (
                <div className="text-center py-20">
                    <div className="w-10 h-10 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-neutral-500">Loading analytics...</p>
                </div>
            ) : (
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((stat, i) => (
                        <StaggerItem key={i} className={`p-6 rounded-3xl ${stat.bg} border ${stat.border} relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-neutral-950/30 backdrop-blur-sm">
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-400 font-medium mb-1">{stat.title}</p>
                                    <div className={`text-3xl font-bold ${stat.color}`}>
                                        <Counter value={stat.value} />
                                    </div>
                                </div>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            )}
        </MotionWrapper>
    );
}
