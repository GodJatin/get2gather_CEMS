'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import MotionWrapper from '@/components/MotionWrapper';
import { motion } from 'framer-motion';
import Counter from '@/components/Counter';
import TextReveal from '@/components/TextReveal';

interface Booking {
    id: number;
    event_id: number;
    status: string;
    event_title: string;
    event_date: string;
    event_time: string;
    event_venue: string;
}

interface UserProfile {
    name: string;
    email: string;
    department?: string;
    enrollment_number?: string;
}

interface StudentStats {
    rank: number;
    total_bookings: number;
    total_volunteer: number;
}

export default function StudentDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await api.get('/auth/me');
                setUser(userRes.data);

                const bookingsRes = await api.get('/bookings/my');
                setBookings(bookingsRes.data);

                const statsRes = await api.get('/stats/student');
                setStats(statsRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <MotionWrapper className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <header className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-white/10 p-8 md:p-12 group">
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 flex flex-wrap gap-x-3">
                            {getGreeting()}, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{user?.name || 'Student'}</span>! 👋
                        </h1>
                        <TextReveal 
                            text="Ready to explore what's happening on campus? Check out the latest events and secure your spot today."
                            className="text-lg text-neutral-300 max-w-2xl"
                            delay={0.2}
                        />
                    </motion.div>
                </div>
                
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Rank Card */}
                <Link href="/student/leaderboard">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 hover:border-accent/40 transition-all cursor-pointer h-full relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity text-6xl group-hover:scale-110 duration-500">
                            🏆
                        </div>
                        <h3 className="text-neutral-400 font-medium mb-2">My Rank</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-accent">
                                #<Counter value={stats?.rank || 0} />
                            </span>
                            <span className="text-sm text-neutral-500">Overall</span>
                        </div>
                        <p className="text-xs text-accent/60 mt-2 group-hover:translate-x-1 transition-transform">View Leaderboard →</p>
                    </motion.div>
                </Link>

                {/* Registered Events */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 h-full relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
                    <h3 className="text-neutral-400 font-medium mb-2">Registered Events</h3>
                    <span className="text-4xl font-bold text-primary">
                        <Counter value={stats?.total_bookings || 0} />
                    </span>
                </motion.div>

                {/* Volunteer Events */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 h-full relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
                    <h3 className="text-neutral-400 font-medium mb-2">Volunteer Events</h3>
                    <span className="text-4xl font-bold text-secondary">
                        <Counter value={stats?.total_volunteer || 0} />
                    </span>
                </motion.div>
            </div>

            {/* My Bookings Section */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span>🎟️</span> Your Upcoming Bookings
                    </h2>
                    <Link href="/student/bookings" className="text-sm text-primary hover:text-primary/80 transition-colors">
                        View All →
                    </Link>
                </div>

                {bookings.filter(b => b.status !== 'Completed').sort((a, b) => {
                    const dateA = new Date(`${a.event_date} ${a.event_time}`);
                    const dateB = new Date(`${b.event_date} ${b.event_time}`);
                    return dateA.getTime() - dateB.getTime();
                }).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bookings.filter(b => b.status !== 'Completed').sort((a, b) => {
                            const dateA = new Date(`${a.event_date} ${a.event_time}`);
                            const dateB = new Date(`${b.event_date} ${b.event_time}`);
                            return dateA.getTime() - dateB.getTime();
                        }).map((booking) => (
                            <Link key={`${booking.id}-${booking.event_title}`} href={`/events/${booking.event_id}`}>
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-secondary/20 to-primary/20 border border-secondary/30 shadow-lg shadow-secondary/10 relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                                    <div className="absolute top-0 right-0 p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                            booking.status === 'Confirmed' 
                                                ? 'bg-green-500/20 text-green-400 border-green-500/20' 
                                                : booking.status === 'Completed'
                                                ? 'bg-neutral-500/20 text-neutral-400 border-neutral-500/20'
                                                : 'bg-red-500/20 text-red-400 border-red-500/20'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{booking.event_title}</h3>
                                    <div className="space-y-2 text-neutral-300 mb-6">
                                        <div className="flex items-center gap-2">
                                            <span>📅</span>
                                            <span>{booking.event_date} • {booking.event_time}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>📍</span>
                                            <span>{booking.event_venue}</span>
                                        </div>
                                    </div>
                                    <span className="inline-block px-6 py-2 rounded-xl bg-white/10 group-hover:bg-white/20 border border-white/10 transition-colors font-medium">
                                        View Ticket Details
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 rounded-3xl bg-neutral-900/30 border border-white/5 text-center">
                        <p className="text-neutral-400 mb-4">You haven't booked any events yet.</p>
                        <Link href="/student/events" className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/80 transition-colors">
                            Explore Events
                        </Link>
                    </div>
                )}
            </section>
        </MotionWrapper>
    );
}
