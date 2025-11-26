'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import MotionWrapper from '@/components/MotionWrapper';
import { formatDistanceToNow } from 'date-fns';

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
}

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Create Post State
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostMediaUrl, setNewPostMediaUrl] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
    const [location, setLocation] = useState('');
    const [feeling, setFeeling] = useState('');
    const [taggedUsers, setTaggedUsers] = useState('');
    const [showEventSelect, setShowEventSelect] = useState(false);
    const [showLocationInput, setShowLocationInput] = useState(false);
    const [showFeelingInput, setShowFeelingInput] = useState(false);
    const [showTagInput, setShowTagInput] = useState(false);

    useEffect(() => {
        fetchPosts();
        fetchEvents();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/feed/');
            setPosts(response.data);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events/');
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/feed/', {
                content: newPostContent,
                media_url: newPostMediaUrl || null,
                media_type: newPostMediaUrl ? 'image' : null,
                event_id: selectedEvent,
                location: location || null,
                feeling: feeling || null,
                tagged_users: taggedUsers || null
            });
            setIsCreateModalOpen(false);
            resetForm();
            fetchPosts();
        } catch (error) {
            console.error('Failed to create post:', error);
        }
    };

    const resetForm = () => {
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
    };

    const handleLike = async (postId: number) => {
        try {
            const response = await api.post(`/feed/${postId}/like`);
            const isLiked = response.data.liked;
            
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        is_liked: isLiked,
                        likes_count: isLiked ? post.likes_count + 1 : post.likes_count - 1
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    return (
        <MotionWrapper className="max-w-2xl mx-auto pb-20">
            {/* Header / Create Post Trigger */}
            <div className="flex items-center justify-between mb-8 sticky top-20 z-30 bg-neutral-950/80 backdrop-blur-md py-4 border-b border-white/5">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Campus Feed
                </h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-lg shadow-blue-500/20"
                >
                    <span>➕</span> Create Post
                </button>
            </div>

            {/* Feed */}
            <div className="space-y-8">
                {loading ? (
                    <div className="text-center text-neutral-500 py-12">Loading feed...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center text-neutral-500 py-12">
                        <span className="text-4xl block mb-2">📭</span>
                        No posts yet. Be the first to share something!
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} onLike={() => handleLike(post.id)} />
                    ))
                )}
            </div>

            {/* Create Post Modal (Facebook Style) */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center relative">
                                <h3 className="text-lg font-bold w-full text-center">Create post</h3>
                                <button 
                                    onClick={() => setIsCreateModalOpen(false)} 
                                    className="absolute right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreatePost} className="p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                        ME
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">You</div>
                                        <div className="flex items-center gap-1 text-xs bg-neutral-800 px-2 py-1 rounded-md text-neutral-400">
                                            <span>👥 Friends</span>
                                            <span>▼</span>
                                        </div>
                                    </div>
                                </div>

                                <textarea
                                    placeholder="What's on your mind?"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    className="w-full bg-transparent text-xl text-white placeholder-neutral-500 focus:outline-none min-h-[120px] resize-none mb-4"
                                />

                                {/* Dynamic Inputs based on selection */}
                                {showTagInput && (
                                    <input
                                        type="text"
                                        placeholder="Tag friends (comma separated)"
                                        value={taggedUsers}
                                        onChange={(e) => setTaggedUsers(e.target.value)}
                                        className="w-full bg-neutral-800/50 border border-white/10 rounded-lg p-2 text-sm mb-2"
                                        autoFocus
                                    />
                                )}
                                {showLocationInput && (
                                    <input
                                        type="text"
                                        placeholder="Where are you?"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full bg-neutral-800/50 border border-white/10 rounded-lg p-2 text-sm mb-2"
                                        autoFocus
                                    />
                                )}
                                {showFeelingInput && (
                                    <input
                                        type="text"
                                        placeholder="How are you feeling?"
                                        value={feeling}
                                        onChange={(e) => setFeeling(e.target.value)}
                                        className="w-full bg-neutral-800/50 border border-white/10 rounded-lg p-2 text-sm mb-2"
                                        autoFocus
                                    />
                                )}
                                {showEventSelect && (
                                    <select
                                        value={selectedEvent || ''}
                                        onChange={(e) => setSelectedEvent(Number(e.target.value))}
                                        className="w-full bg-neutral-800/50 border border-white/10 rounded-lg p-2 text-sm mb-2 text-white"
                                    >
                                        <option value="">Select an event</option>
                                        {events.map(event => (
                                            <option key={event.id} value={event.id}>{event.title}</option>
                                        ))}
                                    </select>
                                )}
                                <input
                                    type="text"
                                    placeholder="Image URL (Optional)"
                                    value={newPostMediaUrl}
                                    onChange={(e) => setNewPostMediaUrl(e.target.value)}
                                    className="w-full bg-neutral-800/50 border border-white/10 rounded-lg p-2 text-sm mb-4"
                                />

                                {/* Add to your post bar */}
                                <div className="border border-white/10 rounded-lg p-3 flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium">Add to your post</span>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="Image URL (Optional)"]')?.focus()} className="text-green-500 hover:bg-white/5 p-1 rounded-full" title="Photo/Video">🖼️</button>
                                        <button type="button" onClick={() => setShowTagInput(!showTagInput)} className="text-blue-500 hover:bg-white/5 p-1 rounded-full" title="Tag People">👤</button>
                                        <button type="button" onClick={() => setShowFeelingInput(!showFeelingInput)} className="text-yellow-500 hover:bg-white/5 p-1 rounded-full" title="Feeling/Activity">🙂</button>
                                        <button type="button" onClick={() => setShowLocationInput(!showLocationInput)} className="text-red-500 hover:bg-white/5 p-1 rounded-full" title="Check in">📍</button>
                                        <button type="button" onClick={() => setShowEventSelect(!showEventSelect)} className="text-purple-500 hover:bg-white/5 p-1 rounded-full" title="Tag Event">📅</button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!newPostContent && !newPostMediaUrl}
                                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors"
                                >
                                    Post
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
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
            viewport={{ once: true }}
            className="bg-neutral-900/50 border border-white/10 rounded-xl overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {post.user_name[0]}
                </div>
                <div>
                    <div className="flex flex-wrap items-center gap-1 text-sm">
                        <span className="font-bold text-white">{post.user_name}</span>
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
                                <span className="font-bold text-blue-400">{post.event_title}</span>
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
            <div className="px-4 pb-2">
                {post.content && <p className="text-neutral-200 whitespace-pre-wrap text-base">{post.content}</p>}
            </div>

            {/* Media */}
            {post.media_url && (
                <div className="w-full mt-2 bg-black flex items-center justify-center overflow-hidden">
                    <img src={post.media_url} alt="Post content" className="w-full max-h-[500px] object-contain" />
                </div>
            )}

            {/* Stats */}
            <div className="px-4 py-2 flex items-center justify-between text-xs text-neutral-400 border-b border-white/5">
                <div className="flex items-center gap-1">
                    <span>❤️</span> {post.likes_count}
                </div>
                <div>
                    {localComments.length} comments
                </div>
            </div>

            {/* Actions */}
            <div className="px-2 py-1 flex items-center justify-between">
                <button
                    onClick={onLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                        post.is_liked ? 'text-red-500' : 'text-neutral-400 hover:bg-white/5'
                    }`}
                >
                    <span className="text-lg">{post.is_liked ? '❤️' : '🤍'}</span>
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
                                <div key={comment.id} className="flex gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-neutral-700 flex-shrink-0 flex items-center justify-center text-xs font-bold">
                                        {comment.user_name[0]}
                                    </div>
                                    <div className="bg-neutral-800 rounded-2xl px-3 py-2">
                                        <span className="font-bold text-white block text-xs mb-0.5">{comment.user_name}</span>
                                        <span className="text-neutral-300">{comment.content}</span>
                                    </div>
                                </div>
                            ))}
                            
                            <form onSubmit={handleAddComment} className="flex gap-2 mt-4">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="flex-1 bg-neutral-800/50 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim()}
                                    className="p-2 rounded-full bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 disabled:opacity-50 transition-colors"
                                >
                                    ➤
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
