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
        venue: '',
        department: 'PICA',
        open_for: 'Everyone',
        outcomes: '',
        images: [] as string[],
        is_paid: false,
        price: 0,
        hashtags: ''
    });
    const [uploading, setUploading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newImages: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            const base64Promise = new Promise<string>((resolve) => {
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
            });
            
            reader.readAsDataURL(file);
            const base64 = await base64Promise;
            newImages.push(base64);
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
        setUploading(false);
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Get current user to extract organizer_id
            const userResponse = await api.get('/auth/me');
            const organizerId = userResponse.data.id;

            await api.post('/events/', {
                ...formData,
                capacity: parseInt(formData.capacity),
                seats_available: parseInt(formData.capacity), // Initially all seats available
                price: formData.is_paid ? parseInt(formData.price.toString()) : 0,
                images: JSON.stringify(formData.images),
                image_url: formData.images[0] || null, // Use first image as thumbnail
                organizer_id: organizerId,
                status: 'Upcoming' // Default status
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

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Organized For (Department)</label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none"
                                >
                                    <option value="PICA">PICA</option>
                                    <option value="PIET">PIET</option>
                                    <option value="PIP">PIP</option>
                                    <option value="PIMR">PIMR</option>
                                    <option value="PARUL">Parul University (All)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Open For</label>
                                <select
                                    name="open_for"
                                    value={formData.open_for}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none"
                                >
                                    <option value="Everyone">Everyone</option>
                                    <option value="PICA">PICA Students Only</option>
                                    <option value="PIET">PIET Students Only</option>
                                    <option value="Department">My Department Only</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Hashtags (comma separated)</label>
                            <input
                                type="text"
                                value={formData.hashtags}
                                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="e.g. #Workshop, #Coding, #Free"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Event Type</label>
                                <div className="flex items-center gap-4 p-1 bg-neutral-900 rounded-xl border border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_paid: false })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!formData.is_paid ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
                                    >
                                        Free
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_paid: true })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.is_paid ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
                                    >
                                        Paid
                                    </button>
                                </div>
                            </div>
                            {formData.is_paid && (
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                        className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            )}
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

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Event Outcomes</label>
                            <textarea
                                name="outcomes"
                                value={formData.outcomes}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none h-24"
                                placeholder="What will students learn or gain?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Event Images (Max 3)</label>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group">
                                        <img src={img} alt={`Event ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {formData.images.length < 3 && (
                                    <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all cursor-pointer">
                                        <span className="text-2xl mb-2">📷</span>
                                        <span className="text-xs text-neutral-400">Upload Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                )}
                            </div>
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
