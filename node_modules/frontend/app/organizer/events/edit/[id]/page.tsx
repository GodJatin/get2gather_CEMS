'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';

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

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Edit Event</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Event Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none h-32"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none"
                        >
                            <option value="Tech">Tech</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Sports">Sports</option>
                            <option value="Workshop">Workshop</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Capacity</label>
                        <input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Time</label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Venue</label>
                    <input
                        type="text"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none"
                        required
                    />
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_paid}
                            onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                            className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-medium">Paid Event</span>
                    </label>

                    {formData.is_paid && (
                        <div className="flex-1">
                            <input
                                type="number"
                                placeholder="Price (₹)"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                className="w-full p-2 rounded-lg bg-neutral-900 border border-white/10 focus:border-purple-500 outline-none"
                                required={formData.is_paid}
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transition-all"
                >
                    Update Event
                </button>
            </form>
        </div>
    );
}
