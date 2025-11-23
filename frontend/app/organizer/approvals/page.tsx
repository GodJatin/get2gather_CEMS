'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Media {
    id: number;
    event_id: number;
    url: string;
    caption: string;
    type: string;
    uploaded_at: string;
}

export default function ApprovalsPage() {
    const [pendingMedia, setPendingMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        try {
            const response = await api.get('/media/pending');
            setPendingMedia(response.data);
        } catch (error) {
            console.error('Failed to fetch pending media:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await api.post(`/media/${id}/approve`);
            setPendingMedia(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            alert('Failed to approve media');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Pending Approvals</h1>

            {loading ? (
                <div className="text-neutral-400">Loading...</div>
            ) : pendingMedia.length === 0 ? (
                <div className="p-12 rounded-3xl bg-neutral-900/50 border border-white/10 text-center text-neutral-500">
                    No pending media to approve.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingMedia.map((media) => (
                        <div key={media.id} className="p-4 rounded-2xl bg-neutral-900/50 border border-white/10">
                            <div className="aspect-video rounded-xl overflow-hidden bg-black mb-4 relative">
                                <img src={media.url} alt="Pending" className="w-full h-full object-contain" />
                                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 text-xs text-white">
                                    Event #{media.event_id}
                                </div>
                            </div>

                            {media.caption && (
                                <p className="text-sm text-neutral-300 mb-4 italic">"{media.caption}"</p>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleApprove(media.id)}
                                    className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-colors"
                                >
                                    Approve
                                </button>
                                <button className="flex-1 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold text-sm transition-colors">
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
