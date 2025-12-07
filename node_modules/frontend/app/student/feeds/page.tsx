'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Post {
    id: number;
    content: string;
    user_name: string;
    created_at: string;
}

export default function SimpleFeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchPosts = async () => {
        try {
            const res = await api.get('/feed/');
            console.log("Feed Response:", res.data); // DEBUG
            if (Array.isArray(res.data)) {
                setPosts(res.data);
                setError('');
            } else {
                console.error("Feed API returned non-array:", res.data);
                setPosts([]);
                setError('Received invalid data format from server.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load feed.');
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleSubmit = async () => {
        if (!input.trim()) return;
        setLoading(true);
        try {
            await api.post('/feed/', { content: input });
            setInput('');
            fetchPosts(); // Reload
        } catch (err) {
            console.error(err);
            alert('Failed to post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 pb-24">
            <h1 className="text-3xl font-bold mb-8 text-[#00F0FF]">Student Feed (Simple Mode)</h1>

            {/* ERROR DISPLAY */}
            {error && <div className="p-4 bg-red-500/20 text-red-400 rounded-xl mb-4">{error}</div>}

            {/* CREATE POST */}
            <div className="bg-neutral-900 p-6 rounded-2xl border border-white/10 mb-8 max-w-2xl mx-auto">
                <textarea
                    className="w-full bg-neutral-800 p-4 rounded-xl text-white mb-4 min-h-[100px]"
                    placeholder="Write something..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-[#00F0FF] text-black font-bold px-6 py-2 rounded-lg hover:opacity-80"
                >
                    {loading ? 'Posting...' : 'Post'}
                </button>
            </div>

            {/* FEED LIST */}
            <div className="max-w-2xl mx-auto space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center text-neutral-500">No posts yet. Be the first!</div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="bg-neutral-900 p-6 rounded-2xl border border-white/10">
                            <div className="font-bold text-[#00FF94] mb-2">{post.user_name}</div>
                            <div className="text-lg text-white/90">{post.content}</div>
                            <div className="text-xs text-neutral-500 mt-4">{new Date(post.created_at).toLocaleString()}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
