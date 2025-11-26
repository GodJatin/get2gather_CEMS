'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';

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
    image_url?: string;
    is_paid: boolean;
    price: number;
}

export default function StudentEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/events/');
                setEvents(res.data);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <MotionWrapper className="max-w-7xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-bold mb-4">Upcoming Events</h1>
                <p className="text-neutral-400">Discover and book events happening around campus.</p>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-80 rounded-3xl bg-neutral-900/50 animate-pulse" />
                    ))}
                </div>
            ) : (
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <StaggerItem key={event.id} className="group flex flex-col p-5 rounded-3xl bg-neutral-900/50 border border-white/10 hover:border-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5">
                            <div className="h-48 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 mb-5 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                                {event.image_url ? (
                                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 group-hover:opacity-50 transition-opacity">
                                        🎉
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white">
                                        {event.category}
                                    </span>
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 text-white ${event.is_paid ? 'bg-purple-500/80' : 'bg-green-500/80'}`}>
                                        {event.is_paid ? `₹ ${event.price}` : 'Free'}
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
                                        className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-colors transform active:scale-95"
                                    >
                                        Book Now
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
        </MotionWrapper>
    );
}
