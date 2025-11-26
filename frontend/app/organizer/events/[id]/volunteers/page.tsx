'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';

interface Volunteer {
    id: number;
    user_id: number;
    status: string;
    created_at: string;
}

export default function VolunteerManagementPage() {
    const params = useParams();
    const router = useRouter();
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVolunteers = async () => {
        if (!params?.id) return;
        try {
            const res = await api.get(`/events/${params.id}/volunteers`);
            setVolunteers(res.data);
        } catch (error) {
            console.error('Failed to fetch volunteers', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVolunteers();
    }, [params?.id]);

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await api.put(`/volunteers/${id}`, { status });
            fetchVolunteers();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Manage Volunteers</h1>
                <button 
                    onClick={() => router.back()}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                    Back
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {volunteers.map((vol) => (
                    <div key={vol.id} className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">Volunteer #{vol.id}</h3>
                                <p className="text-sm text-neutral-400">User ID: {vol.user_id}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                vol.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                                vol.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                            }`}>
                                {vol.status}
                            </span>
                        </div>

                        {vol.status === 'Pending' && (
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleStatusUpdate(vol.id, 'Approved')}
                                    className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(vol.id, 'Rejected')}
                                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        )}

                        {vol.status === 'Approved' && (
                            <div className="mt-4 flex flex-col items-center p-4 bg-white rounded-xl">
                                <QRCodeSVG value={`VOLUNTEER-${vol.id}-${vol.user_id}`} size={120} />
                                <p className="text-black text-xs font-bold mt-2 text-center">Volunteer Pass</p>
                            </div>
                        )}
                    </div>
                ))}

                {volunteers.length === 0 && (
                    <div className="col-span-full text-center py-20 text-neutral-500">
                        No volunteer applications yet.
                    </div>
                )}
            </div>
        </div>
    );
}
