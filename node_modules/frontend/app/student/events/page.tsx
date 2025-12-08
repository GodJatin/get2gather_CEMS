'use client';

import { useEffect, useState, Fragment } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import MotionWrapper from '@/components/MotionWrapper';
import { parse } from 'date-fns';
import { Dialog, Transition } from '@headlessui/react';
import { getImageUrl } from '@/lib/image-utils';

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

// Moved EventCard outside to prevent re-creation on every render
const EventCard = ({ event, bookings, bookingsData, openReviewModal }: { event: Event, bookings: number[], bookingsData: any[], openReviewModal: (b: any) => void }) => {
    const image = getImageUrl(event.images || event.image_url);

    const isBooked = bookings.includes(event.id);

    // Safe date parsing
    let eventDate = new Date();
    try {
        eventDate = parse(`${event.date} ${event.time}`, 'yyyy-MM-dd h:mm aa', new Date());
        if (isNaN(eventDate.getTime())) {
            eventDate = parse(`${event.date} ${event.time}`, 'yyyy-MM-dd HH:mm', new Date());
        }
    } catch (e) {
        // Fallback or leave as invalid
    }
    
    // Use client-side only check to avoid hydration mismatch
    // But for now, we'll assume consistent time or allow hydration fix later
    // Better: use mounted state or suppression
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    if (!isMounted) return <div className="animate-pulse bg-neutral-900/50 h-96 rounded-3xl" />;

    const now = new Date();
    const timeDiff = eventDate.getTime() - now.getTime();
    const minutesUntilStart = timeDiff / (1000 * 60);
    
    const isCompleted = !isNaN(eventDate.getTime()) && eventDate < now;
    const isBookingClosed = isCompleted || (minutesUntilStart <= 30 && minutesUntilStart > -1000);

    return (
        <div className="group block h-full">
            <div className="rounded-3xl bg-neutral-900/50 border border-white/10 overflow-hidden hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col">
                {/* Image Section - Wrapped in Link for navigation */}
                <Link href={`/events/${event.id}`} className="block h-48 bg-neutral-800 relative overflow-hidden cursor-pointer">
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
                </Link>

                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-accent mb-2 font-medium">
                        <span>📅 {event.date}</span>
                        <span>•</span>
                        <span>⏰ {event.time}</span>
                    </div>
                    <Link href={`/events/${event.id}`} className="block">
                         <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                    </Link>
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
                            {isBookingClosed ? 'Booking Closed' : `${event.seats_available} seats left`}
                        </span>
                        
                        {/* Action Buttons - NO LONGER nested in Link */}
                        {isCompleted ? (
                            (() => {
                                const booking = bookingsData.find(b => b.event_id === event.id);
                                
                                if (booking && booking.attended) {
                                    if (booking.event_title && booking.event_title.includes('(Volunteer)')) {
                                        return <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20">Volunteer Attended</span>;
                                    }

                                    return (
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                openReviewModal(booking);
                                            }}
                                            className="px-4 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-bold hover:bg-yellow-500/20 transition-colors flex items-center gap-1"
                                        >
                                            {booking.rating ? (
                                                <>
                                                    <span>{booking.rating} ★</span>
                                                    <span className="opacity-75 font-normal ml-1">Edit</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>★ Leave Review</span>
                                                </>
                                            )}
                                        </button>
                                    );
                                }
                                return <span className="text-xs font-bold bg-neutral-700 text-neutral-400 px-3 py-1.5 rounded-lg">Completed</span>;
                            })()
                        ) : isBooked ? (
                            <span className="text-xs font-bold bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/20">Booked</span>
                        ) : isBookingClosed ? (
                            <span className="text-sm font-bold text-red-500">Closed</span>
                        ) : (
                            <Link href={`/events/${event.id}`} className="text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                                Book Now →
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [bookings, setBookings] = useState<number[]>([]); // Store booked event IDs
    const [bookingsData, setBookingsData] = useState<any[]>([]); // Full booking objects
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTag, setSearchTag] = useState('');

    // Review Modal State
    const [reviewModal, setReviewModal] = useState({
        isOpen: false,
        bookingId: 0,
        eventTitle: '',
        rating: 0,
        review: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await api.get('/auth/me');
                setUser(userRes.data);

                const eventsRes = await api.get('/events/');
                setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);

                const trendingRes = await api.get('/events/trending');
                setTrendingEvents(Array.isArray(trendingRes.data) ? trendingRes.data : []);

            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchBookings = async () => {
             try {
                const res = await api.get('/bookings/my');
                setBookingsData(res.data);
                setBookings(res.data.map((b: any) => b.event_id));
             } catch (e) { console.error(e); }
        };

        fetchData();
        fetchBookings();
    }, []);

    const openReviewModal = (booking: any) => {
        setReviewModal({
            isOpen: true,
            bookingId: booking.id,
            eventTitle: booking.event_title || 'Event',
            rating: booking.rating || 0,
            review: booking.review || ''
        });
    };

    const submitReview = async () => {
        try {
            await api.post(`/bookings/${reviewModal.bookingId}/feedback`, {
                rating: reviewModal.rating,
                review: reviewModal.review
            });
            
            // Update local state
            setBookingsData(prev => prev.map(b => 
                b.id === reviewModal.bookingId 
                    ? { ...b, rating: reviewModal.rating, review: reviewModal.review }
                    : b
            ));
            
            setReviewModal(prev => ({ ...prev, isOpen: false }));
            alert('Review submitted successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to submit review');
        }
    };

    const filterEvents = (section?: string) => {
        let filtered = events;

        // Apply Category Filter
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

        // Filter out past events for specific sections
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

    return (
        <MotionWrapper className="max-w-7xl mx-auto p-6 md:p-12">
            {/* Review Modal */}
            <Transition appear show={reviewModal.isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 p-8 text-left align-middle shadow-2xl transition-all">
                                    <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-white mb-2">
                                        Rate & Review
                                    </Dialog.Title>
                                    <p className="text-neutral-400 mb-6">
                                        How was your experience at <span className="text-[#00F0FF]">{reviewModal.eventTitle}</span>?
                                    </p>

                                    <div className="space-y-6">
                                        <div className="flex justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setReviewModal(prev => ({ ...prev, rating: star }))}
                                                    className={`text-4xl transition-transform hover:scale-110 ${
                                                        reviewModal.rating >= star ? 'text-yellow-400' : 'text-neutral-700 hover:text-yellow-400/50'
                                                    }`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-neutral-400 mb-2">Feedback (Optional)</label>
                                            <textarea
                                                rows={4}
                                                className="w-full rounded-xl bg-neutral-800 border border-white/5 p-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                                placeholder="Share your thoughts..."
                                                value={reviewModal.review}
                                                onChange={(e) => setReviewModal(prev => ({ ...prev, review: e.target.value }))}
                                            />
                                        </div>

                                        <div className="flex gap-3 mt-6">
                                            <button
                                                type="button"
                                                className="flex-1 rounded-xl bg-neutral-800 px-4 py-3 text-sm font-medium text-neutral-300 hover:bg-neutral-700 transition-colors"
                                                onClick={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className={`flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary/80 transition-colors shadow-lg shadow-primary/20 ${reviewModal.rating === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={submitReview}
                                                disabled={reviewModal.rating === 0}
                                            >
                                                Submit Review
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            
            <header className="mb-12">
                <h1 className="text-4xl font-bold mb-4">Discover Events</h1>
                <p className="text-neutral-400">Find workshops, seminars, and fun activities happening around you.</p>
                
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

            {/* Trending Section */}
            {filter === 'All' && !searchTag && (
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span>🔥</span> Trending Now
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {trendingEvents.map(event => (
                            <EventCard key={event.id} event={event} bookings={bookings} bookingsData={bookingsData} openReviewModal={openReviewModal} />
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
                            <EventCard key={event.id} event={event} bookings={bookings} bookingsData={bookingsData} openReviewModal={openReviewModal} />
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
                        <EventCard key={event.id} event={event} bookings={bookings} bookingsData={bookingsData} openReviewModal={openReviewModal} />
                    ))}
                </div>
            </section>

             {/* All Events Grid */}
             <section>
                <h2 className="text-2xl font-bold mb-6">All Events</h2>
                {filterEvents().length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filterEvents().map(event => (
                            <EventCard key={event.id} event={event} bookings={bookings} bookingsData={bookingsData} openReviewModal={openReviewModal} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-white/5">
                        <div className="text-6xl mb-4">📅</div>
                        <h3 className="text-xl font-bold text-white mb-2">No Events Found</h3>
                        <p className="text-neutral-400">Try adjusting your filters or check back later.</p>
                    </div>
                )}
            </section>
        </MotionWrapper>
    );
}
