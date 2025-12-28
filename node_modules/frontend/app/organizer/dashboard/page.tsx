'use client';

import Link from 'next/link';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import TextReveal from '@/components/TextReveal';
import Counter from '@/components/Counter';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';

import AnalyticsCharts from '@/components/AnalyticsCharts';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

import { Skeleton } from '@/components/ui/skeleton';
import { DashboardStatsSkeleton } from '@/components/skeletons';

export default function OrganizerDashboard() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalBookings: 0,
        totalVolunteers: 0
    });
    const [organizerName, setOrganizerName] = useState('Organizer');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
            try {
                const [statsRes, userRes, eventsRes] = await Promise.all([
                    api.get('/stats/organizer'),
                    api.get('/auth/me'),
                    api.get('/events/my'),
                    minDelay
                ]);

                setStats({
                    totalEvents: statsRes.data.total_events,
                    totalBookings: statsRes.data.total_bookings,
                    totalVolunteers: statsRes.data.total_volunteers
                });
                setOrganizerName(userRes.data.name || 'Organizer');
                setEvents(eventsRes.data || []);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-8 md:p-12 space-y-12">
                {/* Header Skeleton */}
                <Skeleton className="h-64 w-full rounded-3xl" />

                {/* Stats Grid Skeleton */}
                <DashboardStatsSkeleton />

                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="h-[400px] rounded-3xl" />
                    <Skeleton className="h-[400px] rounded-3xl" />
                </div>
            </div>
        );
    }

    return (
        <MotionWrapper>
            <header className="mb-12 relative p-8 md:p-12 group z-10">
                {/* Background Container with Overflow Hidden */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-white/10">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                </div>

                <div className="relative z-10 flex justify-between items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {organizerName}'s <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dashboard</span>
                        </h1>
                        <TextReveal
                            text="Manage your events, track attendance, and oversee your organization's performance all in one place."
                            className="text-lg text-neutral-300 max-w-2xl"
                            delay={0.2}
                        />
                    </motion.div>

                    <div className="relative z-50">
                        <NotificationCenter>
                            <div className="p-3 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all hover:scale-110 relative group/bell">
                                <Bell size={24} />
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover/bell:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    Notifications
                                </span>
                            </div>
                        </NotificationCenter>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'Total Events', value: stats.totalEvents, icon: '📅', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                    { label: 'Total Attendees', value: stats.totalBookings, icon: '👥', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
                    { label: 'Total Volunteers', value: stats.totalVolunteers, icon: '🤝', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                ].map((stat, i) => (
                    <StaggerItem key={i} className={`p-6 rounded-3xl ${stat.bg} border ${stat.border} relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-neutral-950/30 backdrop-blur-sm`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400 font-medium mb-1">{stat.label}</p>
                                <div className={`text-3xl font-bold ${stat.color}`}>
                                    <Counter value={stat.value} />
                                </div>
                            </div>
                        </div>
                    </StaggerItem>
                ))}
            </StaggerContainer>

            {/* Analytics Charts */}
            <section className="mb-12">
                <AnalyticsCharts events={events} />
            </section>

            {/* Quick Actions */}
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span>⚡</span> Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                        href="/organizer/events/create"
                        className="group p-8 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/20 hover:scale-[1.02] transition-transform relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity text-9xl font-bold leading-none -mr-4 -mt-4">
                            +
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-3xl bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-sm">➕</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Create New Event</h3>
                            <p className="text-white/80 text-lg">Launch a new event, set up tickets, and start accepting registrations in minutes.</p>
                        </div>
                    </Link>

                    <Link
                        href="/organizer/events"
                        className="group p-8 rounded-3xl bg-neutral-900/50 border border-white/10 hover:bg-neutral-800/50 transition-colors relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-3xl bg-neutral-800 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5">📅</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-white">Manage Events</h3>
                            <p className="text-neutral-400 text-lg">View your event calendar, edit details, and manage attendee lists.</p>
                        </div>
                    </Link>

                    <Link
                        href="/organizer/analytics"
                        className="group p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-900/20 hover:scale-[1.02] transition-transform relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity text-9xl font-bold leading-none -mr-4 -mt-4">
                            ↗
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-3xl bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-sm">📊</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">View Analytics</h3>
                            <p className="text-white/80 text-lg">Gain insights into event performance, attendee engagement, and growth trends.</p>
                        </div>
                    </Link>
                </div>
            </section>
        </MotionWrapper>
    );
}
