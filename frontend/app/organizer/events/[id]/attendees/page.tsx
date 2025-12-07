'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Booking {
    id: number;
    student_name: string;
    student_email: string;
    booking_date: string;
    status: string;
    attended: boolean;
}

export default function AttendeesPage() {
    const params = useParams();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const [eventTitle, setEventTitle] = useState('Event');

    useEffect(() => {
        const fetchAttendees = async () => {
            if (!params?.id) return;
            try {
                // Fetch Event Details for Title
                api.get(`/events/${params.id}`).then(res => setEventTitle(res.data.title)).catch(() => {});

                const res = await api.get(`/events/${params.id}/bookings`);
                setBookings(res.data);
            } catch (error) {
                console.error('Failed to fetch attendees', error);
                alert('Failed to load attendees');
            } finally {
                setLoading(false);
            }
        };
        fetchAttendees();
    }, [params?.id]);

    const downloadCSV = () => {
        if (!bookings.length) return alert('No data to export');

        const headers = ['Name', 'Email', 'Date', 'Status', 'Attended'];
        const rows = bookings.map(b => [
            b.student_name,
            b.student_email,
            new Date(b.booking_date).toLocaleDateString(),
            b.status,
            b.attended ? 'Yes' : 'No'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_attendees.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-8 text-center text-neutral-400">Loading attendees...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Event Attendees</h1>
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
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-neutral-400">
                        <tr>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Attended</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium">{booking.student_name}</td>
                                <td className="p-4 text-neutral-400">{booking.student_email}</td>
                                <td className="p-4 text-neutral-400">
                                    {new Date(booking.booking_date).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {booking.attended ? (
                                        <span className="text-green-500 px-2 py-1 bg-green-500/10 rounded-full text-xs font-bold">Yes</span>
                                    ) : (
                                        <span className="text-neutral-500 px-2 py-1 bg-neutral-800 rounded-full text-xs">No</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {bookings.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-neutral-500">
                                    No attendees yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
