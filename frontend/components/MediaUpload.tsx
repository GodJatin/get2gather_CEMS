'use client';

import { useState } from 'react';
import api from '@/lib/api';
import axios from 'axios';

interface MediaUploadProps {
    eventId: number;
    onUploadSuccess: () => void;
}

export default function MediaUpload({ eventId, onUploadSuccess }: MediaUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [caption, setCaption] = useState('');

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('event_id', eventId.toString());
            if (caption) formData.append('caption', caption);

            // Use direct axios to avoid default JSON headers from the global api instance
            // We must manually add the Authorization header
            const token = localStorage.getItem('token');
            // Do NOT set Content-Type header for FormData, let browser set it with boundary
            await axios.post('/api/media/upload', formData, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });

            alert('Media uploaded successfully! It will be visible after approval.');
            setCaption('');
            onUploadSuccess();
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload media.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10">
            <h3 className="text-lg font-bold mb-4">Share your moments</h3>

            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Add a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />

                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <button
                        disabled={uploading}
                        className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
              ${uploading
                                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                    >
                        {uploading ? (
                            <>
                                <span className="animate-spin">⏳</span> Uploading...
                            </>
                        ) : (
                            <>
                                <span>📷</span> Upload Photo
                            </>
                        )}
                    </button>
                </div>
                <p className="text-xs text-neutral-500 text-center">
                    Photos are subject to moderation before appearing in the gallery.
                </p>
            </div>
        </div>
    );
}
