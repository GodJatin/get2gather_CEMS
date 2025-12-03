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
}

// Helper for robust date parsing
const parseEventDate = (dateStr: string, timeStr: string): Date | null => {
    try {
        // Handle DD-MM-YYYY or DD/MM/YYYY
        if (dateStr.match(/^\d{2}[-/]\d{2}[-/]\d{4}$/)) {
            const [d, m, y] = dateStr.split(/[-/]/);
            dateStr = `${y}-${m}-${d}`;
        }
        
        // Normalize time to HH:mm (24h) if it has AM/PM
        if (timeStr.match(/PM|AM/i)) {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') hours = '00';
            if (modifier.toUpperCase() === 'PM') hours = (parseInt(hours, 10) + 12).toString();
            timeStr = `${hours}:${minutes}`;
        }

        const dateTimeStr = `${dateStr}T${timeStr}`;
        let eventDate = new Date(dateTimeStr);

        // Fallback
        if (isNaN(eventDate.getTime())) {
            eventDate = new Date(`${dateStr} ${timeStr}`);
        }

        if (isNaN(eventDate.getTime())) return null;
        return eventDate;
    } catch (e) {
        return null;
    }
};

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
        const eventDate = parseEventDate(event.date, event.time);
        if (!eventDate) return false;

        const now = new Date();
        if (activeTab === 'upcoming') {
            return eventDate >= now;
        } else {
            return eventDate < now;
        }
    }).sort((a, b) => {
        const dateA = parseEventDate(a.date, a.time);
        const dateB = parseEventDate(b.date, b.time);
        
        if (!dateA || !dateB) return 0;

        // Ascending for upcoming (soonest first), Descending for completed (most recent first)
        return activeTab === 'upcoming' 
            ? dateA.getTime() - dateB.getTime() 
            : dateB.getTime() - dateA.getTime();
    });

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <MotionWrapper className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Events</h1>
                    <p className="text-neutral-400">Manage and track your organized events</p>
                </div>
                <Link
                    href="/organizer/events/create"
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-900/20 transition-all hover:scale-105 flex items-center gap-2"
                >
                    <span>✨</span> Create Event
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 p-1 bg-neutral-900/50 border border-white/10 rounded-2xl w-fit backdrop-blur-sm">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        activeTab === 'upcoming' 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        activeTab === 'completed' 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    Completed
                </button>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                    <StaggerItem key={event.id} className="group p-6 rounded-3xl bg-neutral-900/50 border border-white/10 hover:border-purple-500/30 transition-all hover:shadow-2xl hover:shadow-purple-900/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/5 flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform">
                                    {event.title[0]}
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                                    (parseEventDate(event.date, event.time) || new Date()) < new Date() 
                                    ? 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20' 
                                    : 'bg-green-500/10 text-green-400 border-green-500/20'
                                }`}>
                                    {(parseEventDate(event.date, event.time) || new Date()) < new Date() ? 'Completed' : 'Upcoming'}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors line-clamp-1">{event.title}</h3>

                            <div className="space-y-3 text-sm text-neutral-400 mb-8">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">📅</span>
                                    <span>{event.date} • {event.time}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">📍</span>
                                    <span className="line-clamp-1">{event.venue}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">🎟️</span>
                                    <span>{event.seats_available} / {event.capacity} seats left</span>
                                </div>
                            </div>

                            <div className="flex gap-3 mb-3">
                                <Link 
                                    href={`/organizer/events/edit/${event.id}`}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 font-medium transition-colors text-center border border-white/5"
                                >
                                    Edit
                                </Link>
                                <Link 
                                    href={`/events/${event.id}`}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 font-medium transition-colors text-center border border-white/5"
                                >
                                    View
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Link 
                                    href={`/organizer/events/${event.id}/attendees`}
                                    className="py-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 font-medium transition-colors text-center text-sm"
                                >
                                    Attendees
                                </Link>
                                <Link 
                                    href={`/organizer/events/${event.id}/volunteers`}
                                    className="py-2.5 rounded-xl bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/20 font-medium transition-colors text-center text-sm"
                                >
                                    Volunteers
                                </Link>
                            </div>
                        </div>
                    </StaggerItem>
                ))}

                {filteredEvents.length === 0 && (
                    <div className="col-span-full text-center py-24 rounded-3xl border border-dashed border-white/10 bg-white/5">
                        <div className="text-6xl mb-4 opacity-50">📅</div>
                        <p className="text-neutral-400 mb-6 text-lg">No {activeTab} events found</p>
                        {activeTab === 'upcoming' && (
                            <Link
                                href="/organizer/events/create"
                                className="px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-colors inline-block"
                            >
                                Create your first event
                            </Link>
                        )}
                    </div>
                )}
            </StaggerContainer>

            {/* DEBUG SECTION - REMOVE BEFORE PRODUCTION */}
            <div className="mt-20 p-6 bg-black/80 text-green-400 font-mono text-xs rounded-xl overflow-auto max-h-96 border border-green-900">
                <h3 className="font-bold text-lg mb-4 border-b border-green-900 pb-2">🔍 Debug Console (Current Time: {new Date().toLocaleString()})</h3>
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-2">ID</th>
                            <th className="p-2">Title</th>
                            <th className="p-2">Raw Date</th>
                            <th className="p-2">Raw Time</th>
                            <th className="p-2">Parsed Date</th>
                            <th className="p-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(e => {
                             const dt = parseEventDate(e.date, e.time);
                             const isCompleted = dt ? dt < new Date() : false;
                             return (
                                 <tr key={e.id} className="border-b border-green-900/30 hover:bg-green-900/10">
                                     <td className="p-2">{e.id}</td>
                                     <td className="p-2">{e.title}</td>
                                     <td className="p-2">{e.date}</td>
                                     <td className="p-2">{e.time}</td>
                                     <td className="p-2">{dt ? dt.toLocaleString() : 'INVALID'}</td>
                                     <td className={`p-2 font-bold ${isCompleted ? 'text-red-400' : 'text-blue-400'}`}>
                                         {isCompleted ? 'COMPLETED' : 'UPCOMING'}
                                     </td>
                                 </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>
        </MotionWrapper>
    );
}
