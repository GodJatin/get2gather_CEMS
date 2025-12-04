'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import MotionWrapper from '@/components/MotionWrapper';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Comment {
    id: number;
    user_id: number;
    user_name: string;
    content: string;
    created_at: string;
}

interface Post {
    id: number;
    user_id: number;
    user_name: string;
    user_role: string;
    content: string;
    media_url?: string;
    media_type?: 'image' | 'video';
    event_id?: number;
    event_title?: string;
    location?: string;
    feeling?: string;
    tagged_users?: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    is_liked: boolean;
    comments: Comment[];
}

interface Event {
    id: number;
    title: string;
    date: string;
    time: string;
    venue: string;
}

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Create Post State
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostMediaUrl, setNewPostMediaUrl] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
    const [location, setLocation] = useState('');
    const [feeling, setFeeling] = useState('');
    const [taggedUsers, setTaggedUsers] = useState('');
    
    // UI Toggles for Create Post
    const [showEventSelect, setShowEventSelect] = useState(false);
    const [showLocationInput, setShowLocationInput] = useState(false);
    const [showFeelingInput, setShowFeelingInput] = useState(false);
    const [showTagInput, setShowTagInput] = useState(false);
    const [showMediaInput, setShowMediaInput] = useState(false);

    const [filter, setFilter] = useState<'all' | 'following'>('all');

    useEffect(() => {
        fetchPosts();
        fetchEvents();
    }, [filter]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = filter === 'following' ? { following_only: true } : {};
            const response = await api.get('/feed/', { params });
            setPosts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events/');
            setEvents(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent && !newPostMediaUrl) return;

        try {
            const postData = {
                content: newPostContent,
                media_url: newPostMediaUrl,
                event_id: selectedEvent,
                location: location,
                feeling: feeling,
                tagged_users: taggedUsers ? [1] : [] // Mocking tagged user ID
            };
            
            await api.post('/feed/', postData);
            
            // Reset form
            setNewPostContent('');
            setNewPostMediaUrl('');
            setSelectedEvent(null);
            setLocation('');
            setFeeling('');
            setTaggedUsers('');
            setShowEventSelect(false);
            setShowLocationInput(false);
            setShowFeelingInput(false);
            setShowTagInput(false);
            setShowMediaInput(false);
            
            fetchPosts(); // Refresh feed
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('Failed to create post');
        }
    };

    const handleLike = async (postId: number) => {
        try {
            // Optimistic update
            setPosts(posts.map(p => {
                if (p.id === postId) {
                    return {
                        ...p,
                        is_liked: !p.is_liked,
                        likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
                    };
                }
                return p;
            }));
            
            await api.post(`/feed/${postId}/like`);
        } catch (error) {
            console.error('Failed to toggle like:', error);
            fetchPosts(); // Revert on error
        }
    };

    return (
        <MotionWrapper className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Main Feed Column */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Header & Tabs */}
                    <div className="flex items-center justify-between bg-neutral-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md sticky top-20 z-20">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Campus Feed
                        </h1>
                        <div className="flex bg-neutral-800/50 p-1 rounded-lg">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                    filter === 'all' 
                                        ? 'bg-neutral-700 text-white shadow-sm' 
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('following')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                    filter === 'following' 
                                        ? 'bg-neutral-700 text-white shadow-sm' 
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                Following
                            </button>
                        </div>
                    </div>

                    {/* Create Post Card */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                ME
                            </div>
                            <div className="flex-1">
                                <textarea
                                    placeholder="What's on your mind?"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    className="w-full bg-transparent text-lg text-white placeholder-neutral-500 focus:outline-none min-h-[60px] resize-none"
                                />
                                
                                {/* Dynamic Inputs */}
                                <AnimatePresence>
                                    {(showMediaInput || newPostMediaUrl) && (
                                        <motion.input
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            type="text"
                                            placeholder="Image URL..."
                                            value={newPostMediaUrl}
                                            onChange={(e) => setNewPostMediaUrl(e.target.value)}
                                            className="w-full bg-neutral-800/50 border border-white/10 rounded-lg p-2 text-sm mb-2 mt-2"
                                        />
                                    )}
                                    {showTagInput && (
                                        <motion.input
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            type="text"
                                            placeholder="Tag friends..."
                                            value={taggedUsers}
                                            onChange={(e) => setTaggedUsers(e.target.value)}
                                            className="w-full bg-neutral-800/50 border border-white/10 rounded-lg p-2 text-sm mb-2 mt-2"
                                        />
                                    )}
                                    {showLocationInput && (
                                        <motion.input
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            type="text"
                                            placeholder="Location..."
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full bg-neutral-800/50 border border-white/10 rounded-lg p-2 text-sm mb-2 mt-2"
                                        />
                                    )}
                                    {showFeelingInput && (
                                        <motion.input
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            type="text"
                                            placeholder="Feeling..."
                                            value={feeling}
                                            onChange={(e) => setFeeling(e.target.value)}
                                            className="w-full bg-neutral-800/50 border border-white/10 rounded-lg p-2 text-sm mb-2 mt-2"
                                        />
                                    )}
                                    {showEventSelect && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-2"
                                        >
                                            <select
                                                value={selectedEvent || ''}
                                                onChange={(e) => setSelectedEvent(Number(e.target.value))}
                                                className="w-full bg-neutral-800/50 border border-white/10 rounded-lg p-2 text-sm text-white"
                                            >
                                                <option value="">Select an event</option>
                                                {events.map(event => (
                                                    <option key={event.id} value={event.id}>{event.title}</option>
                                                ))}
                                            </select>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                    <div className="flex gap-1">
                                        <button onClick={() => setShowMediaInput(!showMediaInput)} className="p-2 hover:bg-white/5 rounded-full text-green-400 transition-colors" title="Photo">
                                            🖼️
                                        </button>
                                        <button onClick={() => setShowTagInput(!showTagInput)} className="p-2 hover:bg-white/5 rounded-full text-blue-400 transition-colors" title="Tag">
                                            👤
                                        </button>
                                        <button onClick={() => setShowFeelingInput(!showFeelingInput)} className="p-2 hover:bg-white/5 rounded-full text-yellow-400 transition-colors" title="Feeling">
                                            🙂
                                        </button>
                                        <button onClick={() => setShowLocationInput(!showLocationInput)} className="p-2 hover:bg-white/5 rounded-full text-red-400 transition-colors" title="Location">
                                            📍
                                        </button>
                                        <button onClick={() => setShowEventSelect(!showEventSelect)} className="p-2 hover:bg-white/5 rounded-full text-purple-400 transition-colors" title="Event">
                                            📅
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleCreatePost}
                                        disabled={!newPostContent && !newPostMediaUrl}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all shadow-lg shadow-blue-900/20"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posts Feed */}
                    <div className="space-y-6">
                        {loading ? (
                            <div className="text-center text-neutral-500 py-12">Loading feed...</div>
                        ) : posts.length === 0 ? (
                            <div className="text-center text-neutral-500 py-12 bg-neutral-900/30 rounded-2xl border border-white/5">
                                <span className="text-4xl block mb-2">📭</span>
                                No posts found. Be the first to post!
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostCard key={post.id} post={post} onLike={() => handleLike(post.id)} />
                            ))
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="hidden lg:col-span-4 space-y-6">
                    
                    {/* Trending Events Widget */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 sticky top-24">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span>🔥</span> Trending Events
                        </h2>
                        <div className="space-y-4">
                            {events.slice(0, 3).map(event => (
                                <Link href={`/events/${event.id}`} key={event.id} className="block group">
                                    <div className="bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors border border-white/5">
                                        <h3 className="font-bold text-sm group-hover:text-blue-400 transition-colors">{event.title}</h3>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            📅 {event.date} • 📍 {event.venue}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            {events.length === 0 && (
                                <p className="text-sm text-neutral-500">No upcoming events.</p>
                            )}
                            <Link href="/student/dashboard" className="block text-center text-xs text-blue-400 hover:text-blue-300 mt-4">
                                View all events
                            </Link>
                        </div>
                    </div>

                    {/* Suggested People Widget */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 sticky top-[400px]">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span>👥</span> Suggested People
                        </h2>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs">
                                            U{i}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Student {i}</p>
                                            <p className="text-xs text-neutral-500">Computer Science</p>
                                        </div>
                                    </div>
                                    <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors">
                                        Follow
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </MotionWrapper>
    );
}

function PostCard({ post, onLike }: { post: Post; onLike: () => void }) {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [localComments, setLocalComments] = useState(post.comments);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const response = await api.post(`/feed/${post.id}/comment`, { content: commentText });
            setLocalComments([...localComments, response.data]);
            setCommentText('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm hover:border-white/20 transition-colors"
        >
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {post.user_name[0]}
                </div>
                <div>
                    <div className="flex flex-wrap items-center gap-1 text-sm">
                        <span className="font-bold text-white hover:underline cursor-pointer">{post.user_name}</span>
                        {post.tagged_users && (
                            <>
                                <span className="text-neutral-400">is with</span>
                                <span className="font-bold text-white">{post.tagged_users}</span>
                            </>
                        )}
                        {post.feeling && <span className="text-neutral-400">is feeling {post.feeling}</span>}
                        {post.event_title && (
                            <>
                                <span className="text-neutral-400">at</span>
                                <Link href={`/events/${post.event_id}`} className="font-bold text-blue-400 hover:underline">
                                    {post.event_title}
                                </Link>
                            </>
                        )}
                        {post.location && (
                            <>
                                <span className="text-neutral-400">in</span>
                                <span className="font-bold text-red-400">{post.location}</span>
                            </>
                        )}
                    </div>
                    <p className="text-xs text-neutral-500">
                        {post.user_role} • {formatDistanceToNow(new Date(post.created_at))} ago
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                {post.content && <p className="text-neutral-200 whitespace-pre-wrap text-base leading-relaxed">{post.content}</p>}
            </div>

            {/* Media */}
            {post.media_url && (
                <div className="w-full bg-black/50 flex items-center justify-center overflow-hidden">
                    <img src={post.media_url} alt="Post content" className="w-full max-h-[600px] object-contain" />
                </div>
            )}

            {/* Stats */}
            <div className="px-4 py-3 flex items-center justify-between text-xs text-neutral-400 border-b border-white/5">
                <div className="flex items-center gap-1">
                    <span className="bg-red-500/20 text-red-400 p-1 rounded-full text-[10px]">❤️</span> 
                    <span>{post.likes_count} likes</span>
                </div>
                <div className="hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>
                    {localComments.length} comments
                </div>
            </div>

            {/* Actions */}
            <div className="px-2 py-1 flex items-center justify-between">
                <button
                    onClick={onLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors group ${
                        post.is_liked ? 'text-red-500' : 'text-neutral-400 hover:bg-white/5'
                    }`}
                >
                    <span className={`text-lg transition-transform group-active:scale-125 ${post.is_liked ? 'scale-110' : ''}`}>
                        {post.is_liked ? '❤️' : '🤍'}
                    </span>
                    <span className="font-medium text-sm">Like</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-neutral-400 hover:bg-white/5 transition-colors"
                >
                    <span className="text-lg">💬</span>
                    <span className="font-medium text-sm">Comment</span>
                </button>

                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-neutral-400 hover:bg-white/5 transition-colors">
                    <span className="text-lg">📤</span>
                    <span className="font-medium text-sm">Share</span>
                </button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/20 border-t border-white/5"
                    >
                        <div className="p-4 space-y-4">
                            {localComments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 text-sm group">
                                    <div className="w-8 h-8 rounded-full bg-neutral-700 flex-shrink-0 flex items-center justify-center text-xs font-bold">
                                        {comment.user_name[0]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-neutral-800/80 rounded-2xl px-3 py-2 inline-block max-w-full">
                                            <span className="font-bold text-white block text-xs mb-0.5">{comment.user_name}</span>
                                            <span className="text-neutral-300">{comment.content}</span>
                                        </div>
                                        <div className="text-[10px] text-neutral-500 mt-1 ml-2">
                                            {formatDistanceToNow(new Date(comment.created_at))} ago
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            <form onSubmit={handleAddComment} className="flex gap-2 mt-4 items-center">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                                    ME
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        className="w-full bg-neutral-800/50 border border-white/10 rounded-full pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim()}
                                        className="absolute right-1 top-1 p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-0 disabled:pointer-events-none transition-all"
                                    >
                                        <span className="text-xs">➤</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
