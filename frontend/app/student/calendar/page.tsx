'use client';

import { useState, useEffect } from 'react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths, 
    parseISO, 
    isToday,
    parse
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import Link from 'next/link';
import MotionWrapper from '@/components/MotionWrapper';

interface Event {
    id: number;
    title: string;
    date: string; // YYYY-MM-DD
    time: string;
    venue: string;
    category: string;
    seats_available: number;
    capacity: number;
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [myBookings, setMyBookings] = useState<number[]>([]);

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

        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/my');
                setMyBookings(res.data.map((b: any) => b.event_id));
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            }
        };

        fetchEvents();
        fetchBookings();
    }, []);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const getEventsForDate = (date: Date) => {
        return events.filter(event => isSameDay(parseISO(event.date), date));
    };

    const selectedDateEvents = getEventsForDate(selectedDate);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <MotionWrapper className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-8">
            
            {/* Calendar Section */}
            <div className="flex-1 flex flex-col bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-white/5 bg-white/5">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                            ←
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                            →
                        </button>
                    </div>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 p-4 border-b border-white/5 bg-neutral-900/30">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-sm font-medium text-neutral-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="flex-1 grid grid-cols-7 auto-rows-fr p-4 gap-2 overflow-y-auto">
                    {calendarDays.map((day, idx) => {
                        const dayEvents = getEventsForDate(day);
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isTodayDate = isToday(day);

                        return (
                            <motion.button
                                key={day.toString()}
                                layoutId={isSelected ? 'selected-day' : undefined}
                                onClick={() => setSelectedDate(day)}
                                className={`relative rounded-2xl flex flex-col items-center justify-start pt-2 transition-all group
                                    ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}
                                    ${isSelected ? 'bg-blue-600 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400' : 'hover:bg-white/5'}
                                    ${isTodayDate && !isSelected ? 'bg-white/5 border border-blue-500/30' : ''}
                                `}
                            >
                                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                                    {format(day, 'd')}
                                </span>
                                
                                {/* Event Indicators */}
                                <div className="flex gap-1 mt-1 flex-wrap justify-center px-1">
                                    {dayEvents.slice(0, 3).map((evt, i) => (
                                        <div 
                                            key={i} 
                                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-400'}`} 
                                        />
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/50' : 'bg-neutral-500'}`} />
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Event Details Section */}
            <div className="w-full md:w-96 flex flex-col bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <h3 className="text-xl font-bold">
                        Events for <span className="text-blue-400">{format(selectedDate, 'MMM do')}</span>
                    </h3>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-full text-neutral-500"
                            >
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"/>
                                Loading...
                            </motion.div>
                        ) : selectedDateEvents.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDateEvents.map((event) => {
                                    // Parse date and time (Support both 12hr and 24hr)
                                    let eventDate = parse(`${event.date} ${event.time}`, 'yyyy-MM-dd h:mm aa', new Date());
                                    if (isNaN(eventDate.getTime())) {
                                        eventDate = parse(`${event.date} ${event.time}`, 'yyyy-MM-dd HH:mm', new Date());
                                    }
                                    const now = new Date();
                                    const isPast = eventDate < now;
                                    const isBookingClosed = eventDate.getTime() - now.getTime() < 30 * 60 * 1000; // Less than 30 mins
                                    const isBooked = myBookings.includes(event.id);

                                    return (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-blue-500/30 transition-colors group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                                                    {event.category}
                                                </span>
                                                <span className="text-xs text-neutral-400">{event.time}</span>
                                            </div>
                                            <h4 className="font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors">{event.title}</h4>
                                            <p className="text-sm text-neutral-400 mb-3">{event.venue}</p>
                                            
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-green-400 font-medium">
                                                    {isPast ? '' : `${event.seats_available} seats left`}
                                                </span>
                                                
                                                {isPast ? (
                                                    <span className="text-xs font-bold bg-neutral-700 text-neutral-400 px-3 py-1.5 rounded-lg cursor-not-allowed">
                                                        Completed
                                                    </span>
                                                ) : isBookingClosed && !isBooked ? (
                                                    <span className="text-xs font-bold bg-orange-900/50 text-orange-400 px-3 py-1.5 rounded-lg cursor-not-allowed border border-orange-500/30">
                                                        Booking Closed
                                                    </span>
                                                ) : isBooked ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold bg-green-600/20 text-green-400 px-2 py-1.5 rounded-lg border border-green-500/30">
                                                            ✅ Booked
                                                        </span>
                                                        <Link 
                                                            href={`/events/${event.id}`}
                                                            className="text-xs font-bold bg-white/10 text-white px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors"
                                                        >
                                                            View Details
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <Link 
                                                        href={`/events/${event.id}`}
                                                        className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors"
                                                    >
                                                        Book Now
                                                    </Link>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-full text-neutral-500"
                            >
                                <span className="text-4xl mb-2">📅</span>
                                <p>No events scheduled for this day.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

        </MotionWrapper>
    );
}
