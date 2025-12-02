'use client';

import Link from 'next/link';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function OrganizerDashboard() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalBookings: 0,
        totalVolunteers: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/stats/organizer');
                setStats({
                    totalEvents: res.data.total_events,
                    totalBookings: res.data.total_bookings,
                    totalVolunteers: res.data.total_volunteers
                });
            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <MotionWrapper>
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
                <p className="text-neutral-400">Manage your events and track performance.</p>
            </header>

            {/* Stats Grid */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'Total Events', value: stats.totalEvents, icon: '📅', color: 'bg-primary/10 text-primary' },
                    { label: 'Total Attendees', value: stats.totalBookings, icon: '👥', color: 'bg-secondary/10 text-secondary' },
                    { label: 'Total Volunteers', value: stats.totalVolunteers, icon: '🤝', color: 'bg-accent/10 text-accent' },
                ].map((stat, i) => (
                    <StaggerItem key={i} className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm text-neutral-400">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </StaggerItem>
                ))}
            </StaggerContainer>

            {/* Quick Actions */}
            <section>
                <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link
                        href="/organizer/events/create"
                        className="group p-6 rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-3xl bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center">➕</span>
                            <span className="text-sm font-medium opacity-80">New Event</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1">Create Event</h3>
                        <p className="text-sm opacity-80">Launch a new event in minutes.</p>
                    </Link>

                    <Link
                        href="/organizer/events"
                        className="group p-6 rounded-3xl bg-neutral-900/50 border border-white/10 hover:bg-neutral-800/50 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-3xl bg-neutral-800 w-12 h-12 rounded-2xl flex items-center justify-center">📅</span>
                            <span className="text-sm font-medium text-neutral-400">Manage</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1">My Events</h3>
                        <p className="text-sm text-neutral-400">View and edit your existing events.</p>
                    </Link>
                </div>
            </section>
        </MotionWrapper>
    );
}
