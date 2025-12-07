'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import MotionWrapper from '@/components/MotionWrapper';

interface Review {
    id: number;
    student_name: string;
    student_email: string;
    rating: number;
    review: string;
    booking_date: string;
}

export default function EventReviewsPage() {
    const params = useParams();
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [eventTitle, setEventTitle] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch event details for title
                const eventRes = await api.get(`/events/${params.id}`);
                setEventTitle(eventRes.data.title);

                // Fetch bookings which now include reviews
                const bookingsRes = await api.get(`/events/${params.id}/bookings`);
                
                // Filter only those with ratings or reviews
                const reviewsData = bookingsRes.data
                    .filter((b: any) => b.rating || b.review)
                    .map((b: any) => ({
                        id: b.id,
                        student_name: b.student_name || 'Anonymous',
                        student_email: b.student_email || 'N/A',
                        rating: b.rating || 0,
                        review: b.review || '',
                        booking_date: b.booking_date
                    }));
                
                setReviews(reviewsData);
            } catch (error) {
                console.error("Failed to fetch data", error);
                alert("Failed to load reviews");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchData();
        }
    }, [params.id]);

    const downloadCSV = () => {
        if (reviews.length === 0) return;
        
        const headers = ["Student Name", "Email", "Rating", "Review", "Date"];
        const csvContent = [
            headers.join(","),
            ...reviews.map(r => [
                `"${r.student_name}"`,
                r.student_email,
                r.rating,
                `"${r.review.replace(/"/g, '""')}"`,
                r.booking_date
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reviews_${eventTitle}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <MotionWrapper className="max-w-4xl mx-auto p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <button 
                        onClick={() => router.back()}
                        className="text-neutral-400 hover:text-white mb-2 flex items-center gap-1 text-sm"
                    >
                        ← Back to Event
                    </button>
                    <h1 className="text-3xl font-bold">Reviews: {eventTitle}</h1>
                    <p className="text-neutral-400 mt-1">
                        {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                    </p>
                </div>
                {reviews.length > 0 && (
                    <button 
                        onClick={downloadCSV}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all hover:scale-105 flex items-center gap-2"
                    >
                        <span>⬇️</span> Export CSV
                    </button>
                )}
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-24 bg-neutral-900/50 rounded-3xl border border-dashed border-white/10">
                    <div className="text-5xl mb-4 grayscale opacity-50">⭐</div>
                    <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
                    <p className="text-neutral-500">Wait for students to rate and review this event.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-neutral-900/50 border border-white/5 p-6 rounded-2xl hover:border-purple-500/20 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
                                        {review.student_name[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold">{review.student_name}</div>
                                        <div className="text-xs text-neutral-500">{review.booking_date.split('T')[0]}</div>
                                    </div>
                                </div>
                                <div className="flex gap-1 text-yellow-400 text-lg">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < review.rating ? "opacity-100" : "opacity-20 text-neutral-500"}>★</span>
                                    ))}
                                </div>
                            </div>
                            {review.review ? (
                                <p className="text-neutral-300 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                                    "{review.review}"
                                </p>
                            ) : (
                                <p className="text-neutral-500 italic">No text review provided.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </MotionWrapper>
    );
}
