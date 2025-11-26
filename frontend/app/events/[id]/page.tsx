'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import BookingSuccessModal from '@/components/BookingSuccessModal';

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
    image_url?: string;
    department?: string;
    open_for?: string;
    outcomes?: string;
    images?: string; // JSON string
    is_paid: boolean;
    price: number;
}

export default function EventDetailsPage() {
    const params = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isBooked, setIsBooked] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [onWaitlist, setOnWaitlist] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const fetchEvent = async () => {
        try {
            const response = await api.get(`/events/${params.id}`);
            setEvent(response.data);
        } catch (error) {
            console.error('Failed to fetch event:', error);
        }
    };

    const checkWaitlistStatus = async () => {
        try {
            const res = await api.get(`/events/${params.id}/waitlist/status`);
            setOnWaitlist(res.data.on_waitlist);
        } catch (error) {
            console.error('Failed to check waitlist status', error);
        }
    };

    const checkBookingStatus = async () => {
        try {
            const res = await api.get('/bookings/my');
            const myBookings = res.data;
            const hasBooked = myBookings.some((b: any) => b.event_id === Number(params.id));
            setIsBooked(hasBooked);
        } catch (error) {
            // Ignore error if not logged in or not student
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchEvent();
            await checkWaitlistStatus();
            await checkBookingStatus();
            setLoading(false);
        };

        if (params.id) init();
    }, [params.id]);

    const handleBooking = async () => {
        if (!event) return;
        try {
            await api.post('/bookings/', { event_id: event.id });
            setShowSuccessModal(true);
            setIsBooked(true);
            fetchEvent(); // Refresh seats
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Booking failed');
        }
    };

    const handleJoinWaitlist = async () => {
        if (!event) return;
        try {
            await api.post(`/events/${event.id}/waitlist`);
            setToastMessage('Joined waitlist successfully!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setOnWaitlist(true);
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to join waitlist');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-neutral-400">Loading...</div>;
    if (!event) return <div className="min-h-screen flex items-center justify-center text-red-400">Event not found</div>;

    const eventImages = event.images ? JSON.parse(event.images) : (event.image_url ? [event.image_url] : []);

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
            <BookingSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />

            <div className="max-w-5xl mx-auto">
                <button 
                    onClick={() => window.history.back()} 
                    className="mb-6 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                >
                    ← Back
                </button>
                {/* Hero Section with Carousel */}
                <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 mb-8 h-96 group">
                    {eventImages.length > 0 ? (
                        <>
                            {eventImages.map((img: string, idx: number) => (
                                <div
                                    key={idx}
                                    className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                                >
                                    <img src={img} alt={event.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
                                </div>
                            ))}
                            
                            {/* Carousel Indicators */}
                            {eventImages.length > 1 && (
                                <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                                    {eventImages.map((_: any, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full bg-gradient-to-r from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                            <h1 className="text-5xl font-bold text-white/20">{event.category}</h1>
                        </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 w-full p-8 z-10">
                        <div className="flex gap-2 mb-4">
                            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold inline-block">
                                {event.category}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-white text-xs font-bold inline-block ${event.is_paid ? 'bg-purple-600' : 'bg-green-600'}`}>
                                {event.is_paid ? `₹ ${event.price}` : 'Free'}
                            </span>
                        </div>
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

                        {/* Additional Details */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {event.department && (
                                <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/10">
                                    <h3 className="text-sm text-neutral-500 mb-1">Organized By</h3>
                                    <p className="font-bold">{event.department}</p>
                                </div>
                            )}
                            {event.open_for && (
                                <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/10">
                                    <h3 className="text-sm text-neutral-500 mb-1">Open For</h3>
                                    <p className="font-bold">{event.open_for}</p>
                                </div>
                            )}
                        </section>

                        {event.outcomes && (
                            <section>
                                <h2 className="text-xl font-bold mb-4">Event Outcomes</h2>
                                <div className="p-6 rounded-2xl bg-blue-900/10 border border-blue-500/20 text-blue-200">
                                    <p className="whitespace-pre-wrap">{event.outcomes}</p>
                                </div>
                            </section>
                        )}
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

                            {event.seats_available > 0 ? (
                                isBooked ? (
                                    <button
                                        disabled
                                        className="w-full py-4 rounded-xl bg-green-600/20 text-green-400 font-bold border border-green-500/50 cursor-not-allowed"
                                    >
                                        ✅ Booked
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleBooking}
                                        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20 transition-all"
                                    >
                                        Book Seat Now
                                    </button>
                                )
                            ) : (
                                <button
                                    onClick={handleJoinWaitlist}
                                    disabled={onWaitlist}
                                    className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all ${
                                        onWaitlist 
                                            ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' 
                                            : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20'
                                    }`}
                                >
                                    {onWaitlist ? 'Joined Waitlist' : 'Join Waitlist'}
                                </button>
                            )}

                            <button
                                onClick={async () => {
                                    try {
                                        await api.post(`/events/${event.id}/volunteer`);
                                        setToastMessage('Applied for volunteer!');
                                        setShowToast(true);
                                        setTimeout(() => setShowToast(false), 3000);
                                    } catch (error: any) {
                                        alert(error.response?.data?.detail || 'Failed to apply');
                                    }
                                }}
                                className="w-full mt-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-medium transition-colors border border-white/10"
                            >
                                ✋ Apply as Volunteer
                            </button>

                            <p className="text-xs text-center text-neutral-500 mt-4">
                                Instant confirmation • No payment required
                            </p>
                        </div>
                        {/* Social Sharing */}
                        <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10">
                            <h3 className="text-sm font-bold text-neutral-400 mb-4 uppercase tracking-wider">Share Event</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => window.open(`https://wa.me/?text=Check out this event: ${event.title} at ${event.venue} on ${event.date}!`, '_blank')}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors font-bold"
                                >
                                    <span>WhatsApp</span>
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        setToastMessage('Link copied to clipboard!');
                                        setShowToast(true);
                                        setTimeout(() => setShowToast(false), 3000);
                                    }}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors font-bold"
                                >
                                    <span>Copy Link</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl bg-white text-black font-bold shadow-2xl z-50 animate-bounce">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
