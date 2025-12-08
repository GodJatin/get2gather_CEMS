'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import { motion } from 'framer-motion';
import { getEventStatus, parseEventDate } from '@/lib/dateUtils';

interface Event {
    id: number;
    title: string;
    date: string;
    time: string;
    end_time?: string;
    venue: string;
    status: string;
    seats_available: number;
    capacity: number;
    images?: string; // JSON string
    image_url?: string;
}

// Helper removed, using dateUtils

const EventCardCarousel = ({ event }: { event: Event }) => {
    // ... (Keep existing Carousel logic, it's fine)
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = (() => {
        try {
            if (event.images) {
                const parsed = JSON.parse(event.images);
                return Array.isArray(parsed) ? parsed : [event.images];
            }
            return event.image_url ? [event.image_url] : [];
        } catch (e) {
            if (event.images) {
                return event.images.split(',').map(s => s.trim()).filter(Boolean);
            }
            return event.image_url ? [event.image_url] : [];
        }
    })();

    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images.length]);

    if (images.length === 0) {
        return (
            <div className="w-full h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center text-4xl font-bold text-white mb-4">
                {event.title[0]}
            </div>
        );
    }

    return (
        <div className="relative w-full h-48 mb-4 overflow-hidden group-hover:scale-105 transition-transform duration-700">
            {images.map((img, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img src={img} alt={event.title} className="w-full h-full object-cover" />
                </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent opacity-80" />
            
            {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {images.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/40'}`} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function MyEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('upcoming');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events/my');
                setEvents(response.data);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
        if (!dateA) return 1;
        if (!dateB) return -1; // Keep invalid at bottom?
        
        // Sort: Active/Upcoming asc (soonest first), Completed desc (latest first)
        return activeTab === 'completed' 
            ? dateB.getTime() - dateA.getTime() // Newest completed first
            : dateA.getTime() - dateB.getTime(); // Soonest upcoming/active first
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
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        activeTab === 'active' 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    Active
                </button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                    <div key={event.id} className="group rounded-3xl bg-neutral-900/50 border border-white/10 hover:border-purple-500/30 transition-all hover:shadow-2xl hover:shadow-purple-900/10 relative overflow-hidden flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative z-10 flex flex-col h-full bg-neutral-900">
                             {/* Carousel Banner */}
                            <EventCardCarousel event={event} />

                            <div className="px-6 pb-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                     <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors line-clamp-1">{event.title}</h3>
                                     <span className={`px-3 py-1 rounded-full text-[10px] font-bold border shrink-0 ml-2 ${
                                        getEventStatus(event) === 'Active'
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                        : getEventStatus(event) === 'Upcoming'
                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
                                    }`}>
                                        {getEventStatus(event)}
                                    </span>
                                </div>

                                <div className="space-y-3 text-sm text-neutral-400 mb-6 flex-1">
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

                                <div className="space-y-3 mt-auto">
                                    <div className="flex gap-3">
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
                                    <div className="grid grid-cols-3 gap-2">
                                        <Link 
                                            href={`/organizer/events/${event.id}/attendees`}
                                            className="py-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 font-medium transition-colors text-center text-xs flex items-center justify-center"
                                        >
                                            Attendees
                                        </Link>
                                        <Link 
                                            href={`/organizer/events/${event.id}/volunteers`}
                                            className="py-2.5 rounded-xl bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/20 font-medium transition-colors text-center text-xs flex items-center justify-center"
                                        >
                                            Volunteers
                                        </Link>
                                        <Link 
                                            href={`/organizer/events/${event.id}/reviews`}
                                            className="py-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 font-medium transition-colors text-center text-xs flex items-center justify-center"
                                        >
                                            Reviews
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
            </div>


        </MotionWrapper>
    );
}
