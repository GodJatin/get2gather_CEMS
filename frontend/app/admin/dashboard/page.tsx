'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';

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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading stats...</div>;

    const cards = [
        { title: 'Total Users', value: stats?.total_users, icon: '👥', color: 'bg-blue-500' },
        { title: 'Students', value: stats?.total_students, icon: '🎓', color: 'bg-indigo-500' },
        { title: 'Organizers', value: stats?.total_organizers, icon: '🏢', color: 'bg-purple-500' },
        { title: 'Events Created', value: stats?.total_events, icon: '📅', color: 'bg-pink-500' },
        { title: 'Total Bookings', value: stats?.total_bookings, icon: '🎟️', color: 'bg-orange-500' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white ${card.color}`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
