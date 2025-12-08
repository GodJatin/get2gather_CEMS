'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import MotionWrapper from '@/components/MotionWrapper';

export default function EditEventPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Tech',
        capacity: 0,
        date: '',
        time: '',
        end_time: '',
        venue: '',
        is_paid: false,
        price: 0
    });

    useEffect(() => {
        const fetchEvent = async () => {
            if (!params?.id) return;
            try {
                const res = await api.get(`/events/${params.id}`);
                setFormData({
                    title: res.data.title,
                    description: res.data.description,
                    category: res.data.category,
                    capacity: res.data.capacity,
                    date: res.data.date,
                    time: res.data.time,
                    end_time: res.data.end_time || '',
                    venue: res.data.venue,
                    is_paid: res.data.is_paid,
                    price: res.data.price
                });
            } catch (error) {
                console.error('Failed to fetch event', error);
                alert('Failed to load event details');
                router.push('/organizer/events');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [params?.id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/events/${params.id}`, formData);
            alert('Event updated successfully!');
            router.push('/organizer/events');
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to update event');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <MotionWrapper className="max-w-3xl mx-auto pb-20">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-8">
                <Link 
                    href="/organizer/events"
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                    ←
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Edit Event</h1>
                    <p className="text-neutral-400">Update event details and schedule</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section 1: Basic Info */}
                <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                        <span>📝</span> Event Details
                    </h2>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Event Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-4 rounded-xl bg-neutral-800 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                            placeholder="e.g. Annual Tech Symposium"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-4 rounded-xl bg-neutral-800 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none h-32 transition-all resize-none"
                            placeholder="Describe your event..."
                            required
                        />
                    </div>
                </div>

                {/* Section 2: Schedule & Location */}
                <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                        <span>📅</span> Schedule & Location
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-300">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full p-4 rounded-xl bg-neutral-800 border border-white/10 focus:border-purple-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-300">Start Time</label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full p-4 rounded-xl bg-neutral-800 border border-white/10 focus:border-purple-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-300">End Time</label>
                            <input
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                className="w-full p-4 rounded-xl bg-neutral-800 border border-white/10 focus:border-purple-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Venue</label>
                        <input
                            type="text"
                            value={formData.venue}
                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                            className="w-full p-4 rounded-xl bg-neutral-800 border border-white/10 focus:border-purple-500 outline-none"
                            placeholder="e.g. Main Auditorium / Online"
                            required
                        />
                    </div>
                </div>

                {/* Section 3: Capacity & Category */}
                <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                        <span>⚙️</span> Settings
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-300">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-4 rounded-xl bg-neutral-800 border border-white/10 focus:border-purple-500 outline-none appearance-none"
                            >
                                <option value="Tech">Tech</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Sports">Sports</option>
                                <option value="Workshop">Workshop</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-300">Total Capacity</label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                className="w-full p-4 rounded-xl bg-neutral-800 border border-white/10 focus:border-purple-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 rounded-xl bg-neutral-800/50 border border-white/5">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <div className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${formData.is_paid ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-white/30'}`}>
                                    {formData.is_paid && <span>✓</span>}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.is_paid}
                                    onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                                    className="hidden"
                                />
                                <span className="font-medium">This is a Paid Event</span>
                            </label>

                            {formData.is_paid && (
                                <div className="flex-1 w-full md:w-auto ml-0 md:ml-4">
                                    <input
                                        type="number"
                                        placeholder="Price (₹)"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                        className="w-full p-2 bg-neutral-900 border-b border-white/20 focus:border-purple-500 outline-none transition-all placeholder:text-neutral-600"
                                        required={formData.is_paid}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Link 
                        href="/organizer/events"
                        className="flex-1 py-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-center transition-all"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-[1.02] transition-all"
                    >
                        Update Event Changes
                    </button>
                </div>
            </form>
        </MotionWrapper>
    );
}
