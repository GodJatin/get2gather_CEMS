'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import BookingSuccessModal from '@/components/BookingSuccessModal';
import { triggerConfetti } from '@/components/Confetti';

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

    // Slideshow Auto-Rotation
    useEffect(() => {
        if (!event) return;
        const images = event.images ? JSON.parse(event.images) : (event.image_url ? [event.image_url] : []);
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 3000); // Change every 3 seconds

        return () => clearInterval(interval);
    }, [event]);



    const handleBooking = async () => {
        if (!event) return;
        try {
            await api.post('/bookings/', { event_id: event.id });
            setShowSuccessModal(true);
            setIsBooked(true);
            fetchEvent(); // Refresh seats
            triggerConfetti();
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Booking failed');
        }
    };

    const [showWaitlistModal, setShowWaitlistModal] = useState(false);

    const handleJoinWaitlist = () => {
        // Mock logic: If waitlist count > 5, show warning (In real app, fetch waitlist count)
        // For now, we'll just show it if seats are 0 to demonstrate the feature
        setShowWaitlistModal(true);
    };

    const confirmJoinWaitlist = async () => {
        if (!event) return;
        try {
            await api.post(`/events/${event.id}/waitlist`);
            setToastMessage('Joined waitlist successfully!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setOnWaitlist(true);
            setShowWaitlistModal(false);
            triggerConfetti();
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to join waitlist');
            setShowWaitlistModal(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-neutral-400">Loading...</div>;
    if (!event) return <div className="min-h-screen flex items-center justify-center text-red-400">Event not found</div>;

    const eventImages = event.images ? JSON.parse(event.images) : (event.image_url ? [event.image_url] : []);

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <BookingSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
            
            {/* Waitlist Warning Modal */}
            <AnimatePresence>
                {showWaitlistModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                            <div className="text-center mb-6 relative z-10">
                                <div className="w-16 h-16 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                                    ⚠️
                                </div>
                                <h3 className="text-xl font-bold mb-2">High Demand Event</h3>
                                <p className="text-neutral-400">
                                    There are already many students on the waitlist. Your chances of getting a confirmed seat are low.
                                </p>
                                <p className="text-sm text-neutral-500 mt-2">
                                    We recommend checking out other similar events.
                                </p>
                            </div>
                            <div className="flex gap-3 relative z-10">
                                <button
                                    onClick={() => setShowWaitlistModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 font-bold transition-colors border border-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmJoinWaitlist}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 font-bold transition-all shadow-lg shadow-orange-600/20"
                                >
                                    Join Anyway
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.button 
                    onClick={() => window.history.back()} 
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md text-neutral-300 hover:text-white group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
                </motion.button>

                {/* Hero Section with Carousel */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-[2rem] overflow-hidden bg-neutral-900 border border-white/10 h-[450px] group shadow-2xl shadow-primary/5 mb-8"
                >
                    {eventImages.length > 0 ? (
                        <>
                            {eventImages.map((img: string, idx: number) => (
                                <div
                                    key={idx}
                                    className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                                >
                                    <img src={img} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2s]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
                                </div>
                            ))}
                            
                            {/* Carousel Indicators */}
                            {eventImages.length > 1 && (
                                <div className="absolute bottom-6 right-6 flex gap-2 z-20">
                                    {eventImages.map((_: any, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/30 w-2 hover:bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                            <h1 className="text-6xl font-bold text-white/5 select-none">{event.category}</h1>
                        </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 w-full p-8 z-10">
                        <div className="flex gap-3 mb-4">
                            <span className="px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/20 text-xs font-bold backdrop-blur-md shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]">
                                {event.category}
                            </span>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border ${event.is_paid ? 'bg-secondary/20 text-secondary border-secondary/20' : 'bg-green-500/20 text-green-400 border-green-500/20'}`}>
                                {event.is_paid ? `₹ ${event.price}` : 'Free Entry'}
                            </span>
                        </div>
                        <h1 className="text-5xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                            {event.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-300 font-medium">
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/5">
                                <span>📅</span> {event.date}
                            </div>
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/5">
                                <span>⏰</span> {event.time}
                            </div>
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/5">
                                <span>📍</span> {event.venue}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About & Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="md:col-span-2"
                            >
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1 h-8 bg-primary rounded-full" />
                                    About Event
                                </h2>
                                <p className="text-neutral-400 leading-relaxed whitespace-pre-wrap text-lg">
                                    {event.description}
                                </p>
                            </motion.div>

                            {event.department && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-primary/30 transition-colors group"
                                >
                                    <h3 className="text-sm text-neutral-500 mb-2 uppercase tracking-wider font-bold">Organized By</h3>
                                    <p className="font-bold text-xl group-hover:text-primary transition-colors">{event.department}</p>
                                </motion.div>
                            )}
                            {event.open_for && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-secondary/30 transition-colors group"
                                >
                                    <h3 className="text-sm text-neutral-500 mb-2 uppercase tracking-wider font-bold">Open For</h3>
                                    <p className="font-bold text-xl group-hover:text-secondary transition-colors">{event.open_for}</p>
                                </motion.div>
                            )}
                        </div>

                        {event.outcomes && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1 h-8 bg-secondary rounded-full" />
                                    Event Outcomes
                                </h2>
                                <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-white/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                    <p className="whitespace-pre-wrap text-neutral-300 relative z-10">{event.outcomes}</p>
                                </div>
                            </motion.section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="sticky top-8 space-y-8"
                        >
                            {/* Booking Card */}
                            <div className="relative group">
                                {/* Gradient Border Effect */}
                                <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-secondary to-primary rounded-[2rem] opacity-70 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-500 animate-gradient-xy" />
                                
                                <div className="relative p-8 rounded-[2rem] bg-neutral-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <p className="text-sm text-neutral-400 font-medium mb-1">Available Seats</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-bold text-white">{event.seats_available}</span>
                                                <span className="text-lg text-neutral-500">/ {event.capacity}</span>
                                            </div>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] ${event.seats_available > 0 ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'}`} />
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mb-8">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${event.seats_available > 0 ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-red-500'}`}
                                            style={{ width: `${(event.seats_available / event.capacity) * 100}%` }}
                                        />
                                    </div>

                                    {(() => {
                                        const eventDate = new Date(`${event.date} ${event.time}`);
                                        const isPast = !isNaN(eventDate.getTime()) && eventDate < new Date();

                                        if (isPast) {
                                            return (
                                                <div className="w-full py-4 rounded-xl bg-neutral-800 text-neutral-400 font-bold border border-neutral-700 text-center cursor-not-allowed">
                                                    Event Ended
                                                </div>
                                            );
                                        }

                                        return (
                                            <>
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
                                                    className="w-full py-4 rounded-xl bg-primary hover:bg-primary/80 text-white font-bold shadow-lg shadow-primary/20 transition-all"
                                                >
                                                    Book Seat Now
                                                </button>
                                            )
                                        ) : (
                                            <>
                                                <div className="text-center mb-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                                    <p className="text-orange-400 font-bold text-sm">Event Full</p>
                                                    <p className="text-xs text-neutral-400">Join the waitlist to get notified if a seat opens up.</p>
                                                </div>
                                                
                                                {isBooked ? (
                                                     <button
                                                        disabled
                                                        className="w-full py-4 rounded-xl bg-green-600/20 text-green-400 font-bold border border-green-500/50 cursor-not-allowed"
                                                    >
                                                        ✅ Booked
                                                    </button>
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
                                            </>
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
                                    </>
                                );
                            })()}

                            <p className="text-xs text-center text-neutral-500 mt-4">
                                Instant confirmation • No payment required
                            </p>
                        </div>
                        </div>

                        {/* Social Sharing */}
                        <div className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10 mt-8">
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
                    </motion.div>
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

