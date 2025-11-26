'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import { motion } from 'framer-motion';

interface Event {
    id: number;
    title: string;
    date: string;
    time: string;
    venue: string;
    status: string;
    seats_available: number;
    capacity: number;
    category: string;
}

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

export default function StudentDashboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user profile
                const userRes = await api.get('/auth/me');
                setUser(userRes.data);

                // Fetch events
                const eventsRes = await api.get('/events/');
                setEvents(eventsRes.data);

                // Fetch bookings
                const bookingsRes = await api.get('/bookings/my');
                setBookings(bookingsRes.data);
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
            <header className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-white/10 p-8 md:p-12">
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {getGreeting()}, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user?.name || 'Student'}</span>! 👋
                        </h1>
                        <p className="text-lg text-neutral-300 max-w-2xl">
                            Ready to explore what's happening on campus? Check out the latest events and secure your spot today.
                        </p>
                    </motion.div>
                </div>
                
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            </header>

            {/* My Bookings Section - Highlighted if exists */}
            {bookings.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span>🎟️</span> Your Upcoming Bookings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/30 shadow-lg shadow-purple-900/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/20">
                                        Confirmed
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
                                <Link 
                                    href={`/events/${booking.event_id}`}
                                    className="inline-block px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors font-medium"
                                >
                                    View Ticket Details
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Quick Stats / Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'Upcoming Events', value: events.length, icon: '📅', color: 'blue', link: '/student/events' },
                    { label: 'My Bookings', value: bookings.length, icon: '🎟️', color: 'purple', link: '/student/bookings' },
                    { label: 'Campus News', value: 'New', icon: '📢', color: 'green', link: '#' },
                ].map((stat, index) => (
                    <Link
                        href={stat.link}
                        key={index}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 hover:border-white/10 transition-colors cursor-pointer h-full"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{stat.icon}</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${stat.color}-500/10 text-${stat.color}-400`}>
                                    View All
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                            <p className="text-sm text-neutral-400">{stat.label}</p>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Upcoming Events Section */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span>🔥</span> Trending Events
                    </h2>
                    <Link href="/student/events" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        View All Events →
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-80 rounded-3xl bg-neutral-900/50 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <StaggerItem key={event.id} className="group flex flex-col p-5 rounded-3xl bg-neutral-900/50 border border-white/10 hover:border-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5">
                                <div className="h-48 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 mb-5 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                                    {/* Placeholder for Event Image - In real app, use next/image */}
                                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 group-hover:opacity-50 transition-opacity">
                                        🎉
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white">
                                            {event.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 text-xs text-blue-400 mb-2 font-medium">
                                        <span>📅 {event.date}</span>
                                        <span>•</span>
                                        <span>⏰ {event.time}</span>
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">{event.title}</h3>
                                    <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{event.venue}</p>

                                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-neutral-500">Availability</span>
                                            <span className="text-sm font-bold text-green-400">
                                                {event.seats_available} / {event.capacity}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/events/${event.id}`}
                                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors transform active:scale-95 ${
                                                bookings.some(b => b.event_id === event.id)
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                                    : 'bg-white text-black hover:bg-neutral-200'
                                            }`}
                                        >
                                            {bookings.some(b => b.event_id === event.id) ? '✅ Booked' : 'Book Now'}
                                        </Link>
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}

                        {events.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-neutral-900/30 rounded-3xl border border-white/5">
                                <span className="text-6xl mb-4">🏜️</span>
                                <h3 className="text-xl font-bold mb-2">No Events Found</h3>
                                <p className="text-neutral-400">Check back later for upcoming events!</p>
                            </div>
                        )}
                    </StaggerContainer>
                )}
            </section>
        </MotionWrapper>
    );
}
