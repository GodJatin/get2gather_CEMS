'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Event {
    id: number;
    title: string;
    date: string;
    time: string;
    venue: string;
    status: string;
    seats_available: number;
    capacity: number;
}

import { parse } from 'date-fns';

export default function MyEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events/my');
                setEvents(response.data);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
        const interval = setInterval(fetchEvents, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const filteredEvents = events.filter(event => {
        const eventDate = parse(`${event.date} ${event.time}`, 'yyyy-MM-dd h:mm aa', new Date());
        // Fallback for 24h format if needed
        const dateObj = isNaN(eventDate.getTime()) 
            ? parse(`${event.date} ${event.time}`, 'yyyy-MM-dd HH:mm', new Date())
            : eventDate;
            
        if (isNaN(dateObj.getTime())) return false; // Should not happen if data is valid

        if (activeTab === 'upcoming') {
            return dateObj >= new Date();
        } else {
            return dateObj < new Date();
        }
    }).sort((a, b) => {
        const dateA = parse(`${a.date} ${a.time}`, 'yyyy-MM-dd h:mm aa', new Date());
        const dateB = parse(`${b.date} ${b.time}`, 'yyyy-MM-dd h:mm aa', new Date());
        
        // Handle potential parsing errors or fallbacks
        const validDateA = isNaN(dateA.getTime()) ? parse(`${a.date} ${a.time}`, 'yyyy-MM-dd HH:mm', new Date()) : dateA;
        const validDateB = isNaN(dateB.getTime()) ? parse(`${b.date} ${b.time}`, 'yyyy-MM-dd HH:mm', new Date()) : dateB;

        return validDateA.getTime() - validDateB.getTime();
    });

    if (loading) return <div className="p-8 text-center text-neutral-400">Loading events...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">My Events</h1>
                <Link
                    href="/organizer/events/create"
                    className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-900/20 transition-colors"
                >
                    + Create Event
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                        activeTab === 'upcoming' 
                            ? 'bg-white text-black' 
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                        activeTab === 'completed' 
                            ? 'bg-white text-black' 
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    Completed
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                    <div key={event.id} className="group p-6 rounded-3xl bg-neutral-900/50 border border-white/10 hover:border-purple-500/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white">
                                {event.title[0]}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                new Date(`${event.date} ${event.time}`) < new Date() 
                                ? 'bg-neutral-500/20 text-neutral-400' 
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                                {new Date(`${event.date} ${event.time}`) < new Date() ? 'Completed' : 'Upcoming'}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{event.title}</h3>

                        <div className="space-y-2 text-sm text-neutral-400 mb-6">
                            <div className="flex items-center gap-2">
                                <span>📅</span>
                                <span>{event.date} • {event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>📍</span>
                                <span>{event.venue}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>🎟️</span>
                                <span>{event.seats_available} / {event.capacity} seats left</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link 
                                href={`/organizer/events/edit/${event.id}`}
                                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 font-medium transition-colors text-center"
                            >
                                Edit
                            </Link>
                            <Link 
                                href={`/events/${event.id}`}
                                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 font-medium transition-colors text-center"
                            >
                                View
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <Link 
                                href={`/organizer/events/${event.id}/attendees`}
                                className="py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 font-medium transition-colors text-center text-sm"
                            >
                                Attendees
                            </Link>
                            <Link 
                                href={`/organizer/events/${event.id}/volunteers`}
                                className="py-2 rounded-lg bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 font-medium transition-colors text-center text-sm"
                            >
                                Volunteers
                            </Link>
                        </div>
                    </div>
                ))}

                {filteredEvents.length === 0 && (
                    <div className="col-span-full text-center py-20 rounded-3xl border border-dashed border-white/10">
                        <p className="text-neutral-500 mb-4">No {activeTab} events found</p>
                        {activeTab === 'upcoming' && (
                            <Link
                                href="/organizer/events/create"
                                className="text-purple-400 hover:underline"
                            >
                                Create your first event
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
