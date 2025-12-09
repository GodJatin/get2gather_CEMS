'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '@/components/Loader';

interface Comment {
    id: number;
    user_name: string;
    content: string;
    created_at: string;
}

interface Post {
    id: number;
    content: string;
    user_id: number;
    user_name: string;
    created_at: string;
    media_urls: string[];
    likes_count: number;
    comments_count: number;
    is_liked: boolean;
    comments: Comment[];
}

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [createContent, setCreateContent] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [showCommentInput, setShowCommentInput] = useState<number | null>(null);
    const [commentContent, setCommentContent] = useState('');

    const fetchPosts = async () => {
        try {
            const res = await api.get('/feed/');
            if (Array.isArray(res.data)) {
                setPosts(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreatePost = async () => {
        if (!createContent.trim()) return;
        setCreateLoading(true);
        try {
            const res = await api.post('/feed/', { content: createContent, media_urls: [] });
            setCreateContent('');
            // Optimistically add to list
            if (res.data) {
                setPosts(prev => [res.data, ...prev]);
            } else {
                fetchPosts(); // Fallback
            }
        } catch (err) {
            console.error("Failed to post", err);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleLike = async (postId: number) => {
        // Optimistic update
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    is_liked: !p.is_liked,
                    likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
                };
            }
            return p;
        }));

        try {
            await api.post(`/feed/${postId}/like`);
        } catch (err) {
            console.error("Failed to like", err);
            fetchPosts(); // Revert on error
        }
    };

    const handleComment = async (postId: number) => {
        if (!commentContent.trim()) return;
        try {
            const res = await api.post(`/feed/${postId}/comment`, { content: commentContent });
            // Add comment to state
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    return {
                        ...p,
                        comments: [res.data, ...p.comments],
                        comments_count: p.comments_count + 1
                    };
                }
                return p;
            }));
            setCommentContent('');
            setShowCommentInput(null);
        } catch (err) {
            console.error("Failed to comment", err);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

    return (
        <MotionWrapper className="max-w-2xl mx-auto px-4 pb-24">
            <header className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00F0FF] to-[#00FF94] bg-clip-text text-transparent mb-2">Campus Feed</h1>
                <p className="text-neutral-400">See what's happening around you.</p>
            </header>

            {/* Create Post */}
            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 mb-8 focus-within:border-[#00F0FF]/50 transition-colors">
                <textarea
                    value={createContent}
                    onChange={(e) => setCreateContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full bg-transparent text-white placeholder-neutral-500 resize-none outline-none min-h-[100px] mb-4"
                />
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 text-neutral-500">
                        {/* Placeholder interactions */}
                        <button className="hover:text-[#00F0FF] transition-colors" title="Add Image (Coming Soon)">📷</button>
                        <button className="hover:text-[#00FF94] transition-colors" title="Tag Event (Coming Soon)">📅</button>
                    </div>
                    <button
                        onClick={handleCreatePost}
                        disabled={createLoading || !createContent.trim()}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${
                            createContent.trim()
                                ? 'bg-[#00F0FF] text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        }`}
                    >
                        {createLoading ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>

            {/* Feed */}
            <StaggerContainer className="space-y-6">
                {posts.length === 0 ? (
                    <div className="text-center py-20 text-neutral-500">
                        <div className="text-4xl mb-4">📭</div>
                        <p>No posts yet. Be the first to share something!</p>
                    </div>
                ) : (
                    posts.map((post, index) => (
                        <StaggerItem 
                            key={`${post.id}-${index}`} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white uppercase">
                                    {(post.user_name || "User")[0] || "?"}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{post.user_name}</h3>
                                    <p className="text-xs text-neutral-500">{new Date(post.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-gray-200 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                            {/* Actions */}
                            <div className="flex items-center gap-6 pt-4 border-t border-white/5 text-sm">
                                <button 
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-2 transition-colors ${post.is_liked ? 'text-[#F72585]' : 'text-neutral-400 hover:text-white'}`}
                                >
                                    <span className={`text-xl ${post.is_liked ? 'animate-bounce-short' : ''}`}>
                                        {post.is_liked ? '❤️' : '🤍'}
                                    </span>
                                    <span>{post.likes_count}</span>
                                </button>

                                <button 
                                    onClick={() => setShowCommentInput(showCommentInput === post.id ? null : post.id)}
                                    className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                                >
                                    <span className="text-xl">💬</span>
                                    <span>{post.comments_count}</span>
                                </button>
                            </div>

                                {/* Comments Section */}
                                <AnimatePresence>
                                    {(showCommentInput === post.id || (post.comments && post.comments.length > 0)) && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 pt-4 border-t border-white/5 space-y-4"
                                        >
                                            {/* Input */}
                                            {showCommentInput === post.id && (
                                            <div className="flex gap-2 mb-4">
                                                <input
                                                    type="text"
                                                    value={commentContent}
                                                    onChange={(e) => setCommentContent(e.target.value)}
                                                    placeholder="Write a comment..."
                                                    className="flex-1 bg-neutral-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-[#00F0FF]"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                />
                                                <button 
                                                    onClick={() => handleComment(post.id)}
                                                    className="text-[#00F0FF] font-bold text-sm px-2 hover:bg-[#00F0FF]/10 rounded"
                                                >
                                                    Send
                                                </button>
                                            </div>
                                        )}

                                        {/* List */}
                                        {post.comments.map((comment, i) => (
                                            <div key={`${comment.id}-${i}`} className="bg-white/5 rounded-xl p-3 text-sm">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-white">{comment.user_name}</span>
                                                    <span className="text-[10px] text-neutral-500">{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                                <p className="text-gray-300">{comment.content}</p>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </StaggerItem>
                    ))
                )}
            </StaggerContainer>
        </MotionWrapper>
    );
}
