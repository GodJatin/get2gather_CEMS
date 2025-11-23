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
}

export default function StudentDashboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events/');
                setEvents(response.data);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <MotionWrapper className="max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Welcome, Student!</h1>
                <p className="text-neutral-400">Explore and book upcoming college events.</p>
            </header>

            {/* Upcoming Events Section */}
            <section>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span>🔥</span> Upcoming Events
                </h2>

                {loading ? (
                    <div className="text-neutral-400">Loading events...</div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <StaggerItem key={event.id} className="group p-5 rounded-3xl bg-neutral-900/50 border border-white/10 hover:border-blue-500/50 transition-all hover:-translate-y-1">
                                <div className="h-32 rounded-2xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 mb-4 flex items-center justify-center">
                                    <span className="text-4xl">🎉</span>
                                </div>

                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                                        {event.category}
                                    </span>
                                    <span className="text-xs text-neutral-400">{event.date}</span>
                                </div>

                                <h3 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition-colors">{event.title}</h3>
                                <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{event.venue}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-sm font-medium text-green-400">
                                        {event.seats_available} seats left
                                    </span>
                                    <Link
                                        href={`/events/${event.id}`}
                                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </StaggerItem>
                        ))}

                        {events.length === 0 && (
                            <div className="col-span-full text-center py-12 text-neutral-500">
                                No upcoming events found.
                            </div>
                        )}
                    </StaggerContainer>
                )}
            </section>
        </MotionWrapper>
    );
}
