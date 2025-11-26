'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';

interface Booking {
    id: number;
    event_id: number;
    status: string;
    event_title: string;
    event_date: string;
    event_time: string;
    event_venue: string;
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
    }, []);

    return (
        <MotionWrapper className="max-w-7xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-bold mb-4">My Bookings</h1>
                <p className="text-neutral-400">Manage your event registrations and tickets.</p>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 rounded-3xl bg-neutral-900/50 animate-pulse" />
                    ))}
                </div>
            ) : (
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookings.map((booking) => (
                        <StaggerItem key={booking.id} className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/30 shadow-lg shadow-purple-900/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    booking.status === 'Confirmed' 
                                        ? 'bg-green-500/20 text-green-400 border-green-500/20' 
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
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                <Link 
                                    href={`/events/${booking.event_id}`}
                                    className="inline-block px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors font-medium"
                                >
                                    View Details
                                </Link>
                                <div className="p-2 bg-white rounded-lg">
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=BOOKING-${booking.id}-EVENT-${booking.event_id}`} 
                                        alt="Ticket QR" 
                                        className="w-16 h-16"
                                    />
                                </div>
                            </div>
                        </StaggerItem>
                    ))}

                    {bookings.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-neutral-900/30 rounded-3xl border border-white/5">
                            <span className="text-6xl mb-4">🎟️</span>
                            <h3 className="text-xl font-bold mb-2">No Bookings Yet</h3>
                            <p className="text-neutral-400 mb-6">You haven't booked any events yet.</p>
                            <Link href="/student/events" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors">
                                Browse Events
                            </Link>
                        </div>
                    )}
                </StaggerContainer>
            )}
        </MotionWrapper>
    );
}
