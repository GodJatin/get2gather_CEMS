'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import DateTimePicker from '@/components/DateTimePicker';

export default function CreateEventPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        capacity: '',
        price: '0',
        category: 'Workshop',
        is_paid: false
    });
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (value: string) => {
        setFormData(prev => ({ ...prev, date: value }));
    };

    const handleTimeChange = (value: string) => {
        setFormData(prev => ({ ...prev, time: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const totalImages = images.length + newFiles.length;
            
            if (totalImages > 3) {
                alert("You can only upload up to 3 images.");
                return;
            }

            setImages(prev => [...prev, ...newFiles]);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        if (currentImageIndex >= index && currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    const nextImage = () => {
        setCurrentImageIndex(prev => (prev + 1) % imagePreviews.length);
    };

    const prevImage = () => {
        setCurrentImageIndex(prev => (prev - 1 + imagePreviews.length) % imagePreviews.length);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let eventId: number | null = null;

        try {
            // 1. Create Event
            console.log('Sending event data:', formData);
            const eventResponse = await api.post('/events/', {
                ...formData,
                capacity: parseInt(formData.capacity),
                price: parseFloat(formData.price)
            });

            console.log('Event Response:', eventResponse);
            console.log('Event Data:', eventResponse.data);

            eventId = eventResponse.data?.id;

            if (!eventId) {
                console.error('Event ID missing from response data:', eventResponse.data);
                throw new Error('Event created but ID is missing from response');
            }

            // 2. Upload Images
            // Assuming backend handles multiple uploads sequentially or we call the endpoint multiple times
            for (const image of images) {
                const formData = new FormData();
                formData.append('file', image);
                await api.post(`/events/${eventId}/upload-image`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // Success Implementation
            setLoading(false);
            
            // Trigger Confetti
            const confetti = (await import('canvas-confetti')).default;
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#a855f7', '#ec4899', '#3b82f6']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#a855f7', '#ec4899', '#3b82f6']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();

            // Show Success Dialog
            setShowSuccessModal(true);
            
        } catch (error) {
            console.error('Failed to create event:', error);
            
            // Cleanup on failure
            if (eventId) {
                try {
                    console.log('Cleaning up: Deleting partial event', eventId);
                    await api.delete(`/events/${eventId}`);
                } catch (cleanupError) {
                    console.error('Failed to cleanup partial event:', cleanupError);
                }
            }

            alert('Failed to create event. Please try again.');
            setLoading(false);
        }
    };

    return (
        <MotionWrapper className="max-w-4xl mx-auto pb-20">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    Create New Event
                </h1>
                <p className="text-neutral-400 text-lg">Launch your next big event in minutes.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                <StaggerContainer>
                    {/* Event Details Section */}
                    <StaggerItem className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10 group-hover:bg-purple-500/10 transition-colors" />
                        
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl">📝</span>
                            Event Details
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Event Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:bg-neutral-800 transition-all placeholder:text-neutral-600"
                                    placeholder="e.g., Annual Tech Symposium 2024"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:bg-neutral-800 transition-all placeholder:text-neutral-600 resize-none"
                                    placeholder="Describe your event..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Category</label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:bg-neutral-800 transition-all appearance-none cursor-pointer"
                                        >
                                            <option>Workshop</option>
                                            <option>Seminar</option>
                                            <option>Competition</option>
                                            <option>Social</option>
                                            <option>Other</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">▼</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Event Banners (Max 3)</label>
                                    <div className="relative group/upload">
                                        {imagePreviews.length > 0 ? (
                                            <div className="relative w-full h-[200px] rounded-xl overflow-hidden border border-white/10 bg-neutral-800/30">
                                                <img 
                                                    src={imagePreviews[currentImageIndex]} 
                                                    alt={`Preview ${currentImageIndex}`} 
                                                    className="w-full h-full object-cover"
                                                />
                                                
                                                {/* Navigation */}
                                                {imagePreviews.length > 1 && (
                                                    <>
                                                        <button 
                                                            onClick={(e) => { e.preventDefault(); prevImage(); }}
                                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                                                        >
                                                            ←
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.preventDefault(); nextImage(); }}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                                                        >
                                                            →
                                                        </button>
                                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                                            {imagePreviews.map((_, idx) => (
                                                                <div 
                                                                    key={idx} 
                                                                    className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/30'}`} 
                                                                />
                                                            ))}
                                                        </div>
                                                    </>
                                                )}

                                                {/* Delete Button */}
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); removeImage(currentImageIndex); }}
                                                    className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                                                >
                                                    🗑️
                                                </button>

                                                {/* Add More Button (if < 3) */}
                                                {imagePreviews.length < 3 && (
                                                    <label className="absolute top-2 left-2 p-2 bg-purple-600/80 rounded-lg text-white hover:bg-purple-700 transition-colors cursor-pointer">
                                                        ➕ Add
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                            className="hidden"
                                                            multiple
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-full h-[200px] rounded-xl border border-dashed border-white/20 bg-neutral-800/30 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    multiple
                                                />
                                                <span className="text-3xl">📷</span>
                                                <span>Upload Banners (Max 3)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </StaggerItem>

                    {/* Schedule & Venue Section */}
                    <StaggerItem className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative group mt-6 z-20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -z-10 group-hover:bg-pink-500/10 transition-colors" />
                        
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-xl">📍</span>
                            Schedule & Venue
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <DateTimePicker 
                                label="Date" 
                                value={formData.date} 
                                onChange={handleDateChange} 
                                type="date" 
                            />
                            <DateTimePicker 
                                label="Time" 
                                value={formData.time} 
                                onChange={handleTimeChange} 
                                type="time" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Venue Location</label>
                            <input
                                type="text"
                                name="venue"
                                value={formData.venue}
                                onChange={handleInputChange}
                                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 focus:bg-neutral-800 transition-all placeholder:text-neutral-600"
                                placeholder="e.g., Auditorium A, Main Campus"
                                required
                            />
                        </div>
                    </StaggerItem>

                    {/* Capacity & Pricing Section */}
                    <StaggerItem className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group mt-6">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors" />
                        
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl">🎟️</span>
                            Capacity & Pricing
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Total Capacity</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:bg-neutral-800 transition-all placeholder:text-neutral-600"
                                    placeholder="e.g., 100"
                                    min="1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Ticket Type</label>
                                <div className="flex bg-neutral-800/50 rounded-xl p-1 border border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, is_paid: false, price: '0' }))}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                            !formData.is_paid 
                                                ? 'bg-blue-600 text-white shadow-lg' 
                                                : 'text-neutral-400 hover:text-white'
                                        }`}
                                    >
                                        Free
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, is_paid: true }))}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                            formData.is_paid 
                                                ? 'bg-blue-600 text-white shadow-lg' 
                                                : 'text-neutral-400 hover:text-white'
                                        }`}
                                    >
                                        Paid
                                    </button>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {formData.is_paid && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-6">
                                        <label className="block text-sm font-medium text-neutral-400 mb-2">Ticket Price (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:bg-neutral-800 transition-all"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                required={formData.is_paid}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </StaggerItem>
                </StaggerContainer>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <span>🚀</span> Create Event
                            </>
                        )}
                    </button>
                </div>
            </form>
            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-neutral-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
                            <div className="text-center mb-6 relative z-10">
                                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                    🎉
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Event Created!</h3>
                                <p className="text-neutral-400">
                                    Your event "{formData.title}" has been successfully published. Students can now view and book it.
                                </p>
                            </div>
                            <div className="relative z-10">
                                <button
                                    onClick={() => router.push('/organizer/events')}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition-all shadow-lg hover:shadow-purple-500/25"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </MotionWrapper>
    );
}
