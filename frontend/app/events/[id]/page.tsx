'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import MediaUpload from '@/components/MediaUpload';

interface Event {
    id: number;
    title: string;
    description: string;
    category: string;
    date: string;
    time: string;
    venue: string;
    seats_available: number;
    capacity: number;
    organizer_id: number;
}

interface Media {
    id: number;
    url: string;
    caption: string;
    type: string;
}

export default function EventDetailsPage() {
    const params = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [mediaList, setMediaList] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEvent = async () => {
        try {
            const response = await api.get(`/events/${params.id}`);
            setEvent(response.data);
        } catch (error) {
            console.error('Failed to fetch event:', error);
        }
    };

    const fetchMedia = async () => {
        try {
            const response = await api.get(`/events/${params.id}/media`);
            setMediaList(response.data);
        } catch (error) {
            console.error('Failed to fetch media:', error);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchEvent(), fetchMedia()]);
            setLoading(false);
        };

        if (params.id) init();
    }, [params.id]);

    const handleBooking = async () => {
        if (!event) return;
        try {
            await api.post('/bookings/', { event_id: event.id });
            alert('Booking confirmed!');
            fetchEvent(); // Refresh seats
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Booking failed');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-neutral-400">Loading...</div>;
    if (!event) return <div className="min-h-screen flex items-center justify-center text-red-400">Event not found</div>;

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                {/* Hero Section */}
                <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 mb-8">
                    <div className="h-64 bg-gradient-to-r from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                        <h1 className="text-5xl font-bold text-white/20">{event.category}</h1>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-neutral-950 to-transparent">
                        <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold mb-4 inline-block">
                            {event.category}
                        </span>
                        <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                        <div className="flex items-center gap-6 text-sm text-neutral-300">
                            <span>📅 {event.date}</span>
                            <span>⏰ {event.time}</span>
                            <span>📍 {event.venue}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold mb-4">About Event</h2>
                            <p className="text-neutral-400 leading-relaxed whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </section>

                        {/* Media Gallery Section */}
                        <section>
                            <h2 className="text-xl font-bold mb-6">Event Gallery</h2>

                            {mediaList.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {mediaList.map((media) => (
                                        <div key={media.id} className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                                            <img
                                                src={media.url}
                                                alt={media.caption || 'Event photo'}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                            {media.caption && (
                                                <div className="absolute bottom-0 left-0 w-full p-2 bg-black/60 backdrop-blur-sm">
                                                    <p className="text-xs text-white truncate">{media.caption}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10 border-dashed">
                                    <p className="text-neutral-500">No photos yet. Be the first to share!</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Booking Card */}
                        <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10 backdrop-blur-xl">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-sm text-neutral-400">Available Seats</p>
                                    <p className="text-2xl font-bold text-white">{event.seats_available} <span className="text-sm text-neutral-500 font-normal">/ {event.capacity}</span></p>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${event.seats_available > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>

                            <button
                                onClick={handleBooking}
                                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={event.seats_available === 0}
                            >
                                {event.seats_available > 0 ? 'Book Seat Now' : 'Sold Out'}
                            </button>

                            <p className="text-xs text-center text-neutral-500 mt-4">
                                Instant confirmation • No payment required
                            </p>
                        </div>

                        {/* Upload Widget */}
                        <MediaUpload eventId={event.id} onUploadSuccess={fetchMedia} />
                    </div>
                </div>
            </div>
        </div>
    );
}
