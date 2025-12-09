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

    const [currentImages, setCurrentImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

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

                // Parse existing images
                let images: string[] = [];
                if (res.data.images) {
                    try {
                        const parsed = JSON.parse(res.data.images);
                        images = Array.isArray(parsed) ? parsed : [res.data.images];
                    } catch {
                        images = res.data.images.split(',').map((s: string) => s.trim()).filter(Boolean);
                    }
                } else if (res.data.image_url) {
                    images = [res.data.image_url];
                }
                setCurrentImages(images);

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

    const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const totalImages = currentImages.length + newImages.length + files.length;
            
            if (totalImages > 3) {
                alert('Maximum 3 images allowed per event');
                return;
            }

            setNewImages(prev => [...prev, ...files]);
            
            // Create previews
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeCurrentImage = (index: number) => {
        setCurrentImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const compressImage = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                const MAX_SIZE = 800;
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context failed'));
                    return;
                }
                
                ctx.drawImage(img, 0, 0, width, height);
                const base64String = canvas.toDataURL('image/jpeg', 0.7);
                resolve(base64String);
            };
            img.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        
        try {
            // 1. Upload new images
            const newImageUrls: string[] = [];
            for (const file of newImages) {
                const base64 = await compressImage(file);
                const res = await api.post(`/events/${params.id}/upload-image-base64?save_to_db=false`, {
                    image_base64: base64
                });
                newImageUrls.push(res.data.url);
            }

            // 2. Combine all images
            const finalImages = [...currentImages, ...newImageUrls];
            const imagesString = finalImages.join(',');

            // 3. Update Event
            await api.put(`/events/${params.id}`, {
                ...formData,
                images: imagesString,
                image_url: finalImages[0] || '' // Set primary image
            });

            alert('Event updated successfully!');
            router.push('/organizer/events');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.detail || 'Failed to update event');
        } finally {
            setIsUploading(false);
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
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-4 rounded-xl bg-neutral-800 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none h-32 transition-all resize-none"
                            required
                        />
                    </div>
                </div>

                {/* Section 2: Images */}
                <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                        <span>📷</span> Event Images
                    </h2>
                    
                    <div className="grid grid-cols-3 gap-4">
                        {/* Existing Images */}
                        {currentImages.map((img, idx) => (
                            <div key={`curr-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                                <img src={img} alt="Current" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeCurrentImage(idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}

                        {/* New Images */}
                        {newImagePreviews.map((img, idx) => (
                            <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border border-green-500/30">
                                <img src={img} alt="New" className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 font-bold text-xs text-green-400">NEW</div>
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}

                        {/* Add Button */}
                        {(currentImages.length + newImages.length) < 3 && (
                            <label className="aspect-square rounded-xl border border-dashed border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-neutral-400 hover:text-purple-400">
                                <span className="text-2xl">➕</span>
                                <span className="text-xs font-bold">Add Image</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleNewImages}
                                />
                            </label>
                        )}
                    </div>
                    <p className="text-xs text-neutral-500">Max 3 images. Existing images will be preserved unless deleted.</p>
                </div>

                {/* Section 3: Schedule & Location */}
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
                            required
                        />
                    </div>
                </div>

                {/* Section 4: Capacity & Category */}
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
                        disabled={isUploading}
                        className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'Uploading Images...' : 'Update Event Changes'}
                    </button>
                </div>
            </form>
        </MotionWrapper>
    );
}
