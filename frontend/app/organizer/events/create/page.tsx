'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function CreateEventPage() {
    const [formData, setFormData] = useState({
        title: '',
        category: 'Technical',
        capacity: '',
        description: '',
        date: '',
        time: '',
        venue: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/events/', {
                ...formData,
                capacity: parseInt(formData.capacity),
            });
            alert('Event created successfully!');
            window.location.href = '/organizer/events';
        } catch (error: any) {
            console.error('Failed to create event:', error);
            alert('Failed to create event: ' + (error.response?.data?.detail || 'Unknown error'));
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Create New Event</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Details */}
                <section className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10">
                    <h2 className="text-xl font-bold mb-6 text-purple-400">Event Details</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Event Title</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none"
                                placeholder="e.g. Annual Tech Fest"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none"
                                >
                                    <option value="Technical">Technical</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Workshop">Workshop</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Capacity</label>
                                <input
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none"
                                    placeholder="100"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none h-32"
                                placeholder="Describe your event..."
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Schedule & Venue */}
                <section className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10">
                    <h2 className="text-xl font-bold mb-6 text-blue-400">Schedule & Venue</h2>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Date</label>
                                <input
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    type="date"
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Time</label>
                                <input
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    type="time"
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Venue</label>
                            <input
                                name="venue"
                                value={formData.venue}
                                onChange={handleChange}
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none"
                                placeholder="e.g. Main Auditorium"
                                required
                            />
                        </div>
                    </div>
                </section>

                <div className="flex justify-end gap-4">
                    <button type="button" className="px-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold transition-colors">Cancel</button>
                    <button type="submit" className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-900/20 transition-colors">Create Event</button>
                </div>
            </form>
        </div>
    );
}
