'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { format } from 'date-fns';

interface Event {
    id: number;
    title: string;
    organizer_id: number;
    date: string;
    time: string;
    status: string;
    seats_available: number;
    capacity: number;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/admin/events');
            setEvents(res.data);
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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading events...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Event Management</h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">ID</th>
                            <th className="p-4 font-semibold text-gray-600">Title</th>
                            <th className="p-4 font-semibold text-gray-600">Date & Time</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600">Capacity</th>
                            <th className="p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {events.map((event) => (
                            <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-600">#{event.id}</td>
                                <td className="p-4 font-medium text-gray-800">{event.title}</td>
                                <td className="p-4 text-gray-600">
                                    {event.date} at {event.time}
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        event.status === 'Upcoming' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {event.status}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600">
                                    {event.seats_available} / {event.capacity}
                                </td>
                                <td className="p-4">
                                    <button 
                                        onClick={() => handleDelete(event.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
