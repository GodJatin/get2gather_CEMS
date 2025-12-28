'use client';

import { useEffect, useState, Fragment } from 'react';
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
    qr_code?: string;
    qr_data?: string;
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

import { StudentDashboardSkeleton } from '@/components/skeletons';
import Loader from '@/components/Loader'; // Keep Loader if needed elsewhere, but mostly replacing usage here.
import { Bell } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';
import TicketModal from '@/components/TicketModal';

export default function StudentDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
    const [showTicketModal, setShowTicketModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const minDelay = new Promise(resolve => setTimeout(resolve, 1500));

            try {
                const [userRes, bookingsRes, statsRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get('/bookings/my'),
                    api.get('/stats/student'),
                    minDelay
                ]);

                setUser(userRes.data);
                setBookings(bookingsRes.data);
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

    if (loading) return <StudentDashboardSkeleton />;

    return (
        <MotionWrapper className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <header className="mb-8 relative p-8 md:p-12 group">
                {/* Background Container with Overflow Hidden */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-primary/20 to-secondary/20">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                </div>

                <div className="relative z-10 flex justify-between items-start">
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

                    <div className="relative z-50">
                        <NotificationCenter>
                            <div className="p-3 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all hover:scale-110 relative group/bell">
                                <Bell size={24} />
                                {/* Red Dot handled by NotificationCenter */}
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover/bell:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    Notifications
                                </span>
                            </div>
                        </NotificationCenter>
                    </div>
                </div>
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

            {/* Ticket Modal */}
            <TicketModal
                isOpen={showTicketModal}
                onClose={() => setShowTicketModal(false)}
                ticket={selectedTicket}
            />

            {/* My Bookings Section */}

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

                {bookings.filter(b => {
                    if (b.status === 'Completed' || b.status === 'Cancelled') return false;
                    try {
                        const dateTimeStr = `${b.event_date} ${b.event_time}`;
                        const eventDate = new Date(dateTimeStr);
                        if (isNaN(eventDate.getTime())) {
                            // Fallback to simple date check if time parse fails
                            const eventDay = new Date(b.event_date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return eventDay >= today;
                        }
                        return eventDate > new Date();
                    } catch (e) { return true; }
                }).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bookings.filter(b => {
                            if (b.status === 'Completed' || b.status === 'Cancelled') return false;
                            try {
                                const dateTimeStr = `${b.event_date} ${b.event_time}`;
                                const eventDate = new Date(dateTimeStr);
                                if (isNaN(eventDate.getTime())) {
                                    const eventDay = new Date(b.event_date);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return eventDay >= today;
                                }
                                return eventDate > new Date();
                            } catch (e) { return true; }
                        })
                            .sort((a, b) => new Date(`${a.event_date} ${a.event_time}`).getTime() - new Date(`${b.event_date} ${b.event_time}`).getTime())
                            .map((booking) => (
                                <div key={`${booking.id}-${booking.event_title}`} className="p-6 rounded-3xl bg-gradient-to-br from-secondary/20 to-primary/20 border border-secondary/30 shadow-lg shadow-secondary/10 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                    <Link href={`/events/${booking.event_id}`} className="absolute inset-0 z-0" />

                                    <div className="relative z-10 pointer-events-none">
                                        <div className="absolute top-0 right-0">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${booking.status === 'Confirmed'
                                                ? 'bg-green-500/20 text-green-400 border-green-500/20'
                                                : booking.status === 'Completed'
                                                    ? 'bg-neutral-500/20 text-neutral-400 border-neutral-500/20'
                                                    : 'bg-red-500/20 text-red-400 border-red-500/20'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 pr-20">{booking.event_title}</h3>
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
                                    </div>

                                    <div className="relative z-20 flex gap-3">
                                        <Link
                                            href={`/events/${booking.event_id}`}
                                            className="flex-1 text-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors font-medium text-sm text-white flex items-center justify-center"
                                        >
                                            View Event Details
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedTicket(booking);
                                                setShowTicketModal(true);
                                            }}
                                            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                                        >
                                            <span>🎫</span> View Ticket
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="p-8 rounded-3xl bg-neutral-900/30 border border-white/5 text-center">
                        <p className="text-neutral-400 mb-4">You have no upcoming bookings.</p>
                        <Link href="/student/events" className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/80 transition-colors">
                            Explore Events
                        </Link>
                    </div>
                )}
            </section>
        </MotionWrapper>
    );
}
