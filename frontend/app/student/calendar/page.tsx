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
            <div className="flex-1 flex flex-col bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-[#FF9E00]/5 relative group">
                {/* Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF9E00]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Header */}
                <div className="p-8 flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-md">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-[#FF9E00] via-white to-[#FF0000] bg-clip-text text-transparent animate-gradient-x">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex gap-3">
                        <button onClick={prevMonth} className="p-3 rounded-xl hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20">
                            ←
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-bold rounded-xl bg-[#FF9E00]/20 text-[#FF9E00] hover:bg-[#FF9E00]/30 transition-colors border border-[#FF9E00]/20 backdrop-blur-sm">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-3 rounded-xl hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20">
                            →
                        </button>
                    </div>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 p-4 border-b border-white/5 bg-neutral-900/30">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-sm font-bold text-neutral-500 uppercase tracking-wider py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="flex-1 grid grid-cols-7 auto-rows-fr p-6 gap-3 overflow-y-auto custom-scrollbar">
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
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative rounded-2xl flex flex-col items-center justify-start pt-3 transition-all group
                                    ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}
                                    ${isSelected 
                                        ? 'bg-gradient-to-br from-[#FF9E00] to-[#FF0000] shadow-lg shadow-[#FF9E00]/30 ring-2 ring-white/20' 
                                        : 'hover:bg-white/5 hover:border hover:border-white/10'
                                    }
                                    ${isTodayDate && !isSelected ? 'bg-white/5 border border-[#FF9E00]/50 shadow-[0_0_10px_rgba(255,158,0,0.2)]' : ''}
                                `}
                            >
                                <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>
                                    {format(day, 'd')}
                                </span>
                                
                                {/* Event Indicators */}
                                <div className="flex gap-1 mt-2 flex-wrap justify-center px-1">
                                    {dayEvents.slice(0, 3).map((evt, i) => (
                                        <div 
                                            key={i} 
                                            className={`w-1.5 h-1.5 rounded-full shadow-sm ${isSelected ? 'bg-white' : 'bg-[#FF9E00]'}`} 
                                        />
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/50' : 'bg-neutral-600'}`} />
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Event Details Section */}
            <div className="w-full md:w-[400px] flex flex-col bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-[#FF0000]/5">
                <div className="p-8 border-b border-white/5 bg-white/5 backdrop-blur-md">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        Events for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9E00] to-[#FF0000]">{format(selectedDate, 'MMM do')}</span>
                    </h3>
                </div>

                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-full text-neutral-500 gap-4"
                            >
                                <div className="w-10 h-10 border-2 border-[#FF9E00] border-t-transparent rounded-full animate-spin"/>
                                <p className="text-sm font-medium animate-pulse">Loading events...</p>
                            </motion.div>
                        ) : selectedDateEvents.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDateEvents.map((event, idx) => {
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
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-neutral-900/50 rounded-2xl p-5 border border-white/5 hover:border-[#FF9E00]/30 transition-all group hover:shadow-lg hover:shadow-[#FF9E00]/5 relative overflow-hidden"
                                        >
                                            {/* Hover Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#FF9E00]/5 to-[#FF0000]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FF9E00]/10 text-[#FF9E00] border border-[#FF9E00]/20 uppercase tracking-wider">
                                                        {event.category}
                                                    </span>
                                                    <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                                                        ⏰ {event.time}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-lg mb-1 text-white group-hover:text-[#FF9E00] transition-colors">{event.title}</h4>
                                                <p className="text-sm text-neutral-400 mb-4 flex items-center gap-1">
                                                    📍 {event.venue}
                                                </p>
                                                
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                                    <span className={`text-xs font-bold ${event.seats_available < 10 ? 'text-orange-400' : 'text-green-400'}`}>
                                                        {isPast ? '' : `${event.seats_available} seats left`}
                                                    </span>
                                                    
                                                    {isPast ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold bg-neutral-800 text-neutral-500 px-3 py-1.5 rounded-lg cursor-not-allowed border border-white/5">
                                                                Completed
                                                            </span>
                                                            <Link 
                                                                href={`/events/${event.id}`}
                                                                className="text-xs font-bold bg-white/5 text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                                                            >
                                                                View Details
                                                            </Link>
                                                        </div>
                                                    ) : isBookingClosed && !isBooked ? (
                                                        <span className="text-xs font-bold bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-lg cursor-not-allowed border border-orange-500/20">
                                                            Booking Closed
                                                        </span>
                                                    ) : isBooked ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold bg-green-500/10 text-green-400 px-2.5 py-1.5 rounded-lg border border-green-500/20">
                                                                Booked
                                                            </span>
                                                            <Link 
                                                                href={`/events/${event.id}`}
                                                                className="text-xs font-bold bg-white/5 text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                                                            >
                                                                View
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <Link 
                                                            href={`/events/${event.id}`}
                                                            className="text-xs font-bold bg-white text-black px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
                                                        >
                                                            Book Now
                                                        </Link>
                                                    )}
                                                </div>
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
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <span className="text-4xl grayscale opacity-50">📅</span>
                                </div>
                                <p className="font-medium">No events scheduled</p>
                                <p className="text-sm text-neutral-600">Select another date to view events</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

        </MotionWrapper>
    );
}
