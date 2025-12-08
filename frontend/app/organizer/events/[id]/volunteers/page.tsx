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
    student_name?: string;
    student_email?: string;
    attended?: boolean;
}

export default function VolunteerManagementPage() {
    const params = useParams();
    const router = useRouter();
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState(true);

    const [eventTitle, setEventTitle] = useState('Event');

    const fetchVolunteers = async () => {
        if (!params?.id) return;
        try {
            // Fetch Event Details for Title
            api.get(`/events/${params.id}`).then(res => setEventTitle(res.data.title)).catch(() => {});

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

    const downloadCSV = () => {
        if (!volunteers.length) return alert('No data to export');

        const headers = ['Name', 'Email', 'Date', 'Status', 'Attended'];
        const rows = volunteers.map(v => [
            v.student_name || `User ${v.user_id}`,
            v.student_email || '-',
            new Date(v.created_at).toLocaleDateString(),
            v.status,
            v.attended ? 'Yes' : 'No'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_volunteers.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Manage Volunteers</h1>
                <div className="flex gap-3">
                    <button 
                        onClick={downloadCSV}
                        className="px-4 py-2 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 border border-[#00F0FF]/20 font-bold transition-all flex items-center gap-2"
                    >
                        <span>⬇️</span> Export CSV
                    </button>
                    <button 
                        onClick={() => router.back()}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        Back
                    </button>
                </div>
            </div>

            <div className="bg-neutral-900/50 rounded-3xl border border-white/10 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-neutral-400">
                            <tr>
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Attended</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {volunteers.map((vol) => (
                                <tr key={vol.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium">{vol.student_name || `User ${vol.user_id}`}</td>
                                    <td className="p-4 text-neutral-400">{vol.student_email || '-'}</td>
                                    <td className="p-4 text-neutral-400">
                                        {new Date(vol.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            vol.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                                            vol.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                            {vol.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {vol.attended ? (
                                            <span className="text-green-500 px-2 py-1 bg-green-500/10 rounded-full text-xs font-bold">Yes</span>
                                        ) : (
                                            <span className="text-neutral-500 px-2 py-1 bg-neutral-800 rounded-full text-xs">No</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {vol.status === 'Pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(vol.id, 'Approved')}
                                                    className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(vol.id, 'Rejected')}
                                                    className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {volunteers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-neutral-500">
                                        No volunteer applications yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-white/10">
                    {volunteers.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500">
                            No volunteer applications yet
                        </div>
                    ) : volunteers.map((vol) => (
                        <div key={vol.id} className="p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-white mb-1">{vol.student_name || `User ${vol.user_id}`}</div>
                                    <div className="text-xs text-neutral-400 break-all">{vol.student_email}</div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    vol.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                                    vol.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                    {vol.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-neutral-400 bg-white/5 p-3 rounded-lg">
                                <span>Applied: {new Date(vol.created_at).toLocaleDateString()}</span>
                                <span>Attended: {vol.attended ? <b className="text-green-400">Yes</b> : 'No'}</span>
                            </div>

                            {vol.status === 'Pending' && (
                                <div className="flex gap-2 mt-1">
                                    <button
                                        onClick={() => handleStatusUpdate(vol.id, 'Approved')}
                                        className="flex-1 py-2 rounded-lg bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-600/30 text-sm font-bold transition-colors"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(vol.id, 'Rejected')}
                                        className="flex-1 py-2 rounded-lg bg-red-600/20 text-red-400 border border-red-600/50 hover:bg-red-600/30 text-sm font-bold transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
