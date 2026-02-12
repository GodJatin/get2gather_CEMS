'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import { getEventStatus, parseEventDate } from '@/lib/dateUtils';
import TicketModal from '@/components/TicketModal';

interface Booking {
    id: number;
    event_id: number;
    status: string;
    event_title: string;
    event_date: string;
    event_time: string;
    event_end_time?: string;
    event_venue: string;
    qr_code?: string;
}

export default function StudentBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/my');
                setBookings(res.data);
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
        const interval = setInterval(fetchBookings, 5000); // Auto-refresh every 5s
        return () => clearInterval(interval);
    }, []);

    const handleCancelBooking = async (id: number) => {
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
        try {
            await api.delete(`/bookings/${id}`);
            setBookings(prev => prev.filter(b => b.id !== id));
            if (selectedTicket?.id === id) setSelectedTicket(null);
        } catch (error) {
            console.error('Failed to cancel:', error);
            alert('Failed to cancel booking');
        }
    };

    const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

    // Helpers to categorize based on TIME, not just status
    const upcomingBookings = bookings.filter(b => {
        const status = getEventStatus({ date: b.event_date, time: b.event_time, end_time: b.event_end_time });
        return status !== 'Completed';
    }).sort((a, b) => {
        // Sort by date ASC
        const dateA = parseEventDate(a.event_date, a.event_time);
        const dateB = parseEventDate(b.event_date, b.event_time);
        return dateA.getTime() - dateB.getTime();
    });

    const pastBookings = bookings.filter(b => {
        const status = getEventStatus({ date: b.event_date, time: b.event_time, end_time: b.event_end_time });
        return status === 'Completed';
    }).sort((a, b) => {
        // Sort by date DESC
        const dateA = parseEventDate(a.event_date, a.event_time);
        const dateB = parseEventDate(b.event_date, b.event_time);
        return dateB.getTime() - dateA.getTime();
    });

    return (
        <MotionWrapper className="max-w-7xl mx-auto">
            {/* Ticket Modal */}
            <TicketModal
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                ticket={selectedTicket}
            />

            <header className="mb-12 flex items-center gap-4">
                <Link href="/student/dashboard" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    ←
                </Link>
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
                    <p className="text-neutral-400">Manage your event registrations and tickets.</p>
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 rounded-3xl bg-neutral-900/50 animate-pulse" />
                    ))}
                </div>
            ) : (
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Bookings */}
                    <h2 className="col-span-full text-xl font-bold text-white/80 mt-4 mb-2">Upcoming Events</h2>
                    {upcomingBookings.map((booking) => (
                        <StaggerItem key={`${booking.id}-${booking.event_title}`} className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10 hover:border-primary/50 transition-colors shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${booking.status === 'Confirmed'
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    {booking.status}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{booking.event_title}</h3>
                            <div className="space-y-2 text-neutral-400 mb-6">
                                <div className="flex items-center gap-2">
                                    <span>📅</span>
                                    <span>{booking.event_date} • {booking.event_time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>📍</span>
                                    <span>{booking.event_venue}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                                <Link
                                    href={`/events/${booking.event_id}`}
                                    className="flex-1 text-center px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-medium text-sm"
                                >
                                    Event
                                </Link>

                                {booking.status === 'Confirmed' && (
                                    <button
                                        onClick={() => handleCancelBooking(booking.id)}
                                        className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors text-sm font-bold"
                                        title="Cancel Booking"
                                    >
                                        ✕
                                    </button>
                                )}

                                <button
                                    onClick={() => setSelectedTicket(booking)}
                                    className="flex-1 text-center px-4 py-2 rounded-xl bg-primary hover:bg-primary/80 text-white font-bold shadow-lg shadow-primary/20 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    <span>🎟️</span> Ticket
                                </button>
                            </div>
                        </StaggerItem>
                    ))}

                    {/* Completed Bookings */}
                    {pastBookings.length > 0 && (
                        <>
                            <h2 className="col-span-full text-xl font-bold text-white/50 mt-12 mb-2 border-t border-white/10 pt-8">Past Events</h2>
                            {pastBookings.map((booking) => (
                                <StaggerItem key={`${booking.id}-${booking.event_title}`} className="p-6 rounded-3xl bg-neutral-900/30 border border-white/5 relative overflow-hidden group opacity-75 hover:opacity-100 transition-opacity">
                                    <div className="absolute top-0 right-0 p-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold border bg-neutral-500/20 text-neutral-400 border-neutral-500/20">
                                            Completed
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 text-neutral-400">{booking.event_title}</h3>
                                    <div className="space-y-2 text-neutral-500 mb-6">
                                        <div className="flex items-center gap-2">
                                            <span>📅</span>
                                            <span>{booking.event_date} • {booking.event_time}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>📍</span>
                                            <span>{booking.event_venue}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                                        <Link
                                            href={`/events/${booking.event_id}`}
                                            className="flex-1 text-center px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors font-medium text-sm text-neutral-400"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </StaggerItem>
                            ))}
                        </>
                    )}

                    {bookings.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-neutral-900/30 rounded-3xl border border-white/5">
                            <span className="text-6xl mb-4">🎟️</span>
                            <h3 className="text-xl font-bold mb-2">No Bookings Yet</h3>
                            <p className="text-neutral-400 mb-6">You haven't booked any events yet.</p>
                            <Link href="/student/events" className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/80 text-white font-bold transition-colors">
                                Browse Events
                            </Link>
                        </div>
                    )}
                </StaggerContainer>
            )}
        </MotionWrapper>
    );
}
