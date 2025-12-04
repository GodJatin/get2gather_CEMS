'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import { parse } from 'date-fns';

interface Event {
    id: number;
    title: string;
    date: string;
    time: string;
    venue: string;
    category: string;
    seats_available: number;
    capacity: number;
    image_url?: string;
    images?: string;
    department?: string;
    open_for?: string;
    hashtags?: string;
    price: number;
    is_paid: boolean;
}

interface UserProfile {
    department?: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [bookings, setBookings] = useState<number[]>([]); // Store booked event IDs
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTag, setSearchTag] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await api.get('/auth/me');
                setUser(userRes.data);

                const eventsRes = await api.get('/events/');
                setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);

                const trendingRes = await api.get('/events/trending');
                setTrendingEvents(Array.isArray(trendingRes.data) ? trendingRes.data : []);

                // Fetch user bookings to check status
                const bookingsRes = await api.get('/bookings/my');
                const bookedEventIds = bookingsRes.data.map((b: any) => b.event_id);
                setBookings(bookedEventIds);

            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filterEvents = (section?: string) => {
        let filtered = events;

        // Apply Category Filter (from Dropdown)
        if (filter !== 'All') {
            if (filter === 'Department') {
                filtered = filtered.filter(e => e.department === user?.department);
            } else {
                filtered = filtered.filter(e => e.category === filter);
            }
        }

        // Apply Search Filter
        if (searchTag) {
            const tag = searchTag.toLowerCase();
            filtered = filtered.filter(e => 
                e.title.toLowerCase().includes(tag) || 
                e.hashtags?.toLowerCase().includes(tag)
            );
        }

        // Apply Section specific filters
        if (section === 'Open') {
            filtered = filtered.filter(e => e.open_for === 'Everyone' || !e.department);
        }

        // Filter out past events for specific sections (Trending, Department, Open)
        // Only show them in "All Events" (when section is undefined AND filter is All)
        if (section || filter !== 'All') {
             filtered = filtered.filter(e => {
                let eventDate = parse(`${e.date} ${e.time}`, 'yyyy-MM-dd h:mm aa', new Date());
                if (isNaN(eventDate.getTime())) {
                     eventDate = parse(`${e.date} ${e.time}`, 'yyyy-MM-dd HH:mm', new Date());
                }
                return !isNaN(eventDate.getTime()) && eventDate >= new Date();
             });
        }

        return filtered;
    };

    const EventCard = ({ event }: { event: Event }) => {
        const image = event.images ? JSON.parse(event.images)[0] : (event.image_url || null);
        const isBooked = bookings.includes(event.id);

        let eventDate = parse(`${event.date} ${event.time}`, 'yyyy-MM-dd h:mm aa', new Date());
        if (isNaN(eventDate.getTime())) {
            eventDate = parse(`${event.date} ${event.time}`, 'yyyy-MM-dd HH:mm', new Date());
        }
        const isCompleted = !isNaN(eventDate.getTime()) && eventDate < new Date();

        return (
            <Link href={`/events/${event.id}`} className="group block">
                <div className="rounded-3xl bg-neutral-900/50 border border-white/10 overflow-hidden hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col">
                    <div className="h-48 bg-neutral-800 relative overflow-hidden">
                        {image ? (
                            <img src={image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">🎉</div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                             <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white">
                                {event.category}
                            </span>
                            {event.is_paid && (
                                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-secondary/80 backdrop-blur-md text-white">
                                    ₹{event.price}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-accent mb-2 font-medium">
                            <span>📅 {event.date}</span>
                            <span>•</span>
                            <span>⏰ {event.time}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                        <p className="text-sm text-neutral-400 mb-4 line-clamp-1">{event.venue}</p>
                        
                        {event.hashtags && (
                            <div className="flex flex-wrap gap-1 mb-4">
                                {event.hashtags.split(',').map((tag, i) => (
                                    <span key={i} className="text-[10px] text-neutral-500 bg-white/5 px-2 py-1 rounded-md">#{tag.trim()}</span>
                                ))}
                            </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-xs text-neutral-500">
                                {isCompleted ? '' : `${event.seats_available} seats left`}
                            </span>
                            {isCompleted ? (
                                <span className="text-xs font-bold bg-neutral-700 text-neutral-400 px-3 py-1.5 rounded-lg">Completed</span>
                            ) : isBooked ? (
                                <span className="text-xs font-bold bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/20">Booked</span>
                            ) : (
                                <span className="text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">Book Now →</span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <MotionWrapper className="max-w-7xl mx-auto p-6 md:p-12">
            <header className="mb-12">
                <h1 className="text-4xl font-bold mb-4">Discover Events</h1>
                <p className="text-neutral-400">Find workshops, seminars, and fun activities happening around you.</p>
                
                {/* Search / Filter Bar */}
                <div className="mt-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search events by title or hashtag..." 
                            value={searchTag}
                            onChange={(e) => setSearchTag(e.target.value)}
                            className="bg-neutral-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 w-full focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 min-w-[200px] focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        <option value="Technical">Technical</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Sports">Sports</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Seminar">Seminar</option>
                        {user?.department && <option value="Department">My Department ({user.department})</option>}
                    </select>
                </div>
            </header>

            {/* Trending Section - Only show when no filter/search is active */}
            {filter === 'All' && !searchTag && (
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span>🔥</span> Trending Now
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {trendingEvents.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </section>
            )}

            {/* Department Section */}
            {user?.department && (
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span>🎓</span> For {user.department} Students
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filterEvents('Department').map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </section>
            )}

            {/* Open For All */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span>🌍</span> Open for All
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filterEvents('Open').map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </section>

             {/* All Events Grid */}
             <section>
                <h2 className="text-2xl font-bold mb-6">All Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filterEvents().map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </section>
        </MotionWrapper>
    );
}
