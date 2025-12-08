'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import Link from 'next/link';

interface Event {
    id: number;
    title: string;
    organizer_id: number;
    date: string;
    time: string;
    status: string;
    seats_available: number;
    capacity: number;
    avg_rating?: number;
    image_url?: string;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/admin/events');
            // Sort by ID Ascending
            const sorted = res.data.sort((a: Event, b: Event) => a.id - b.id);
            setEvents(sorted);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            await api.delete(`/admin/events/${id}`);
            setEvents(events.filter(e => e.id !== id));
        } catch (error) {
            alert("Failed to delete event");
        }
    };

    const downloadCSV = () => {
        if (events.length === 0) return;
        const headers = ["ID", "Title", "Date", "Time", "Status", "Capacity", "Rating"];
        const csvContent = [
            headers.join(","),
            ...events.map(e => [
                e.id, 
                `"${e.title.replace(/"/g, '""')}"`, 
                e.date, 
                e.time, 
                e.status, 
                e.capacity, 
                e.avg_rating || "N/A"
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `events_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const filteredEvents = events.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <MotionWrapper>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        Event Management
                    </h1>
                    <p className="text-neutral-400">Manage all platform events</p>
                </div>
                <div className="flex gap-3">
                    <input 
                        type="text" 
                        placeholder="Search events..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-2 focus:border-blue-500 outline-none w-full md:w-64"
                    />
                    <button 
                        onClick={downloadCSV}
                        className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap"
                    >
                        <span>⬇️</span> CSV
                    </button>
                </div>
            </div>
            
            <div className="bg-neutral-900/50 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-neutral-400 font-medium text-sm uppercase tracking-wider">
                                <th className="p-6">ID</th>
                                <th className="p-6">Event Details</th>
                                <th className="p-6">Status</th>
                                <th className="p-6">Capacity</th>
                                <th className="p-6">Rating</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredEvents.map((event) => (
                                <tr key={event.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6 text-neutral-500 font-mono">#{event.id}</td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-2xl border border-white/5">
                                                {event.image_url ? (
                                                    <img src={event.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                                                ) : '📅'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{event.title}</h4>
                                                <p className="text-sm text-neutral-400">{event.date} • {event.time}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {(() => {
                                            let status = event.status;
                                            // Optional: Client-side status adjustment if needed, but safe to rely on backend or simple date check
                                            try {
                                                const eventDate = new Date(`${event.date} ${event.time}`);
                                                if (!isNaN(eventDate.getTime()) && new Date() > eventDate) {
                                                    status = 'Completed';
                                                }
                                            } catch (e) {}
                                            
                                            // Logic for displaying strict date-based status or backend status?
                                            // Let's stick to simple
                                            
                                            return (
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                    status === 'Completed' ? 'bg-neutral-800 text-neutral-400 border-neutral-700' :
                                                    status === 'Upcoming' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {status}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-white font-mono">{event.seats_available} / {event.capacity}</span>
                                            <div className="w-20 h-1 bg-neutral-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 rounded-full" 
                                                    style={{ width: `${((event.capacity - event.seats_available) / event.capacity) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {event.avg_rating ? (
                                            <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-500/10 px-2 py-1 rounded-lg w-fit border border-yellow-500/20">
                                                <span>★</span> {event.avg_rating.toFixed(1)}
                                            </div>
                                        ) : (
                                            <span className="text-neutral-600 text-sm">No ratings</span>
                                        )}
                                    </td>
                                    <td className="p-6 text-right">
                                        <button 
                                            onClick={() => handleDelete(event.id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredEvents.length === 0 && (
                        <div className="text-center py-12 text-neutral-500">
                            No events found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </MotionWrapper>
    );
}
