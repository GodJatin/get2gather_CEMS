'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
// Local helper to avoid build import issues
const getMediaUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}/${cleanPath}`;
};

import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '@/components/Loader';
import { Plus, X, Image as ImageIcon, Calendar, UserPlus, MessageCircle, Heart, Share2, MoreHorizontal } from 'lucide-react';

// Utility for real-time dates
const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
};

interface Comment {
    id: number;
    user_name: string;
    content: string;
    created_at: string;
    parent_id?: number | null;
    replies?: Comment[];
    replyToName?: string; // For "replied to X" context
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
    media_type?: string;
    event_id?: number;
    location?: string;
    feeling?: string;
    tagged_users?: { id: number, name: string }[];
    tagged_events?: { id: number, name: string }[];
}

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Create Post State
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [createContent, setCreateContent] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    
    // Taggable State
    const [taggableEvents, setTaggableEvents] = useState<{id: number, title: string}[]>([]);
    const [taggableUsers, setTaggableUsers] = useState<{id: number, name: string}[]>([]);
    const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    // Comment State
    const [activePostId, setActivePostId] = useState<number | null>(null);
    const [commentContent, setCommentContent] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null); // parent_id
    
    // Image Preview State (Lightbox)
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/feed/');
            if (Array.isArray(res.data)) {
                // Organize comments into threads
                const processedPosts = res.data.map((post: Post) => ({
                    ...post,
                    comments: organizeComments(post.comments || [])
                }));
                setPosts(processedPosts);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTaggables = async () => {
        try {
            const [eventsRes, usersRes] = await Promise.all([
                api.get('/feed/taggable/events'),
                api.get('/feed/taggable/users')
            ]);
            setTaggableEvents(eventsRes.data || []);
            setTaggableUsers(usersRes.data || []);
        } catch (err) {
            console.error("Failed to fetch taggables", err);
        }
    };

    useEffect(() => {
        if (showCreateDialog) {
            fetchTaggables();
        }
    }, [showCreateDialog]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (mediaUrls.length >= 5) {
            alert("Max 5 images allowed");
            return;
        }

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            // Updated endpoint to match backend prefix
            const res = await api.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMediaUrls(prev => [...prev, res.data.url]);
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const organizeComments = (comments: Comment[]) => {
        const commentMap = new Map<number, Comment>();
        const roots: Comment[] = [];

        // First pass: create map
        comments.forEach(c => {
            commentMap.set(c.id, { ...c, replies: [] });
        });

        // Second pass: link parents
        comments.forEach(c => {
            if (c.parent_id && commentMap.has(c.parent_id)) {
                // Reply Context: Set the name of the user being replied to
                const parent = commentMap.get(c.parent_id)!;
                const child = commentMap.get(c.id)!;
                child.replyToName = parent.user_name;
                
                parent.replies!.push(child);
            } else {
                roots.push(commentMap.get(c.id)!);
            }
        });
        return roots;
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreatePost = async () => {
        if (!createContent.trim() && mediaUrls.length === 0) return;
        setCreateLoading(true);
        try {
            const postData = {
                content: createContent,
                media_urls: mediaUrls,
                tagged_users: selectedUsers,
                tagged_events: selectedEvents
            };

            const res = await api.post('/feed/', postData);
            setCreateContent('');
            setMediaUrls([]);
            setSelectedEvents([]);
            setSelectedUsers([]);
            setShowCreateDialog(false);
            
            if (res.data) {
                // Optimization: Prepend new post immediately
                // The backend ensures the response matches the Post interface
                setPosts(prev => [res.data, ...prev]);
            } else {
                fetchPosts();
            }
        } catch (err) {
            console.error("Failed to post", err);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleLike = async (postId: number) => {
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
            fetchPosts();
        }
    };

    // State for individual comment interactions
    const [replyInputVisible, setReplyInputVisible] = useState<number | null>(null);
    const [expandedComments, setExpandedComments] = useState<number[]>([]);
    
    const toggleReplies = (commentId: number) => {
        setExpandedComments(prev => 
            prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]
        );
    };

    const submitReply = async (postId: number, parentId: number, content: string) => {
        if (!content.trim()) return;
        try {
            const res = await api.post(`/feed/${postId}/comment`, { content, parent_id: parentId });
            // Re-fetch to update tree correctly
            fetchPosts();
            setReplyInputVisible(null);
            // Ensure parent is expanded so we see the new reply
            if (!expandedComments.includes(parentId)) {
                setExpandedComments(prev => [...prev, parentId]);
            }
        } catch (err) {
            console.error("Failed to reply", err);
        }
    };

    const CommentItem = ({ comment, postId, depth = 0 }: { comment: Comment, postId: number, depth?: number }) => {
        const [localReplyContent, setLocalReplyContent] = useState('');
        const hasReplies = comment.replies && comment.replies.length > 0;
        const isExpanded = expandedComments.includes(comment.id);
        const isReplying = replyInputVisible === comment.id;

        return (
            <div className={`mt-3 ${depth > 0 ? 'ml-6 pl-3 border-l-2 border-white/10' : ''}`}>
                <div className="bg-white/5 rounded-xl p-3 text-sm hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-white flex gap-2 items-center">
                            {comment.user_name}
                            {comment.replyToName && (
                                <span className="text-xs text-neutral-400 font-normal">replied to {comment.replyToName}</span>
                            )}
                        </span>
                        <span className="text-[10px] text-neutral-500">{formatTimeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-gray-300 mb-2">{comment.content}</p>
                    
                    <div className="flex items-center gap-4">
                        {depth < 3 && (
                            <button 
                                onClick={() => setReplyInputVisible(isReplying ? null : comment.id)} 
                                className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1 font-medium"
                            >
                                {isReplying ? 'Cancel' : 'Reply'}
                            </button>
                        )}
                        
                        {hasReplies && (
                            <button 
                                onClick={() => toggleReplies(comment.id)} 
                                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                            >
                                {isExpanded ? 'Hide Replies' : `View ${comment.replies!.length} Replies`}
                            </button>
                        )}
                    </div>
                </div>

                {/* Inline Reply Input */}
                {isReplying && (
                    <div className="mt-2 ml-2 flex gap-2 animate-in fade-in slide-in-from-top-2">
                        <input
                            type="text"
                            value={localReplyContent}
                            onChange={(e) => setLocalReplyContent(e.target.value)}
                            placeholder={`Reply to ${comment.user_name}...`}
                            className="flex-1 bg-neutral-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-[#00F0FF]"
                            onKeyDown={(e) => e.key === 'Enter' && submitReply(postId, comment.id, localReplyContent)}
                            autoFocus
                        />
                        <button 
                            onClick={() => submitReply(postId, comment.id, localReplyContent)}
                            className="text-[#00F0FF] text-xs font-bold px-2 hover:bg-[#00F0FF]/10 rounded"
                        >
                            Send
                        </button>
                    </div>
                )}

                {/* Nested Replies */}
                {hasReplies && isExpanded && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        {comment.replies!.map(reply => (
                            <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const handleComment = async (postId: number) => {
        if (!commentContent.trim()) return;
        try {
            await api.post(`/feed/${postId}/comment`, { content: commentContent }); // Root comment
            fetchPosts();
            setCommentContent('');
        } catch (err) {
            console.error("Failed to comment", err);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <Loader />
            <p className="text-neutral-500 animate-pulse">Loading feed...</p>
        </div>
    );

    return (
        <MotionWrapper className="max-w-2xl mx-auto px-4 pb-24 relative">
            <header className="mb-8 pt-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00F0FF] to-[#00FF94] bg-clip-text text-transparent mb-2">Campus Feed</h1>
                <p className="text-neutral-400">See what's happening around you.</p>
            </header>

            {/* Posts Feed */}
            <StaggerContainer className="space-y-6">
                {posts.map((post, index) => (
                    <StaggerItem 
                        key={`${post.id}-${index}`} 
                        className="bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:border-[#00F0FF]/30 transition-all shadow-xl"
                    >
                        {/* Post Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                                {(post.user_name || "U")[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{post.user_name}</h3>
                                <div className="flex items-center gap-2 text-xs text-neutral-400">
                                    <span>{formatTimeAgo(post.created_at)}</span>
                                    {post.location && <span>• 📍 {post.location}</span>}
                                    {post.feeling && <span>• used {post.feeling}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Post Content */}
                        <p className="text-gray-100 mb-4 whitespace-pre-wrap leading-relaxed text-base">{post.content}</p>
                        
                        {/* Tags Display */}
                        {((post.tagged_events && post.tagged_events.length > 0) || (post.tagged_users && post.tagged_users.length > 0)) && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {post.tagged_events?.map(tag => (
                                    <span key={`event-${tag.id}`} className="text-xs font-bold text-[#00FF94] bg-[#00FF94]/10 px-2 py-1 rounded-md">
                                        #{tag.name}
                                    </span>
                                ))}
                                {post.tagged_users?.map(tag => (
                                    <span key={`user-${tag.id}`} className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">
                                        @{tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        {/* Media Carousel (Horizontal Scroll) */}
                        {post.media_urls && post.media_urls.length > 0 && (
                            <div className="flex overflow-x-auto gap-2 mb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pb-2">
                                {post.media_urls.map((url, i) => (
                                    <div key={i} className="flex-shrink-0 w-full sm:w-[90%] md:w-[80%] aspect-video relative snap-center rounded-xl overflow-hidden cursor-pointer" onClick={() => setSelectedImage(getMediaUrl(url))}>
                                         <img src={getMediaUrl(url)} alt="Post Media" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex gap-6">
                                <button 
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-2 transition-all ${post.is_liked ? 'text-red-500' : 'text-neutral-400 hover:text-white'}`}
                                >
                                    <Heart className={`w-6 h-6 ${post.is_liked ? 'fill-current' : ''}`} />
                                    <span className="font-medium">{post.likes_count}</span>
                                </button>
                                <button 
                                    onClick={() => {
                                        setActivePostId(activePostId === post.id ? null : post.id);
                                        setReplyingTo(null);
                                    }}
                                    className="flex items-center gap-2 text-neutral-400 hover:text-[#00F0FF] transition-colors"
                                >
                                    <MessageCircle className="w-6 h-6" />
                                    <span className="font-medium">{post.comments_count}</span>
                                </button>
                                <button className="text-neutral-400 hover:text-green-400 transition-colors">
                                    <Share2 className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <AnimatePresence>
                            {(activePostId === post.id || (post.comments && post.comments.length > 0)) && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-6 pt-0 space-y-4 overflow-hidden"
                                >
                                    {/* Root Comment Input */}
                                    {activePostId === post.id && (
                                    <div className="bg-neutral-800/50 rounded-2xl p-4 border border-white/5 mb-4">
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={commentContent}
                                                onChange={(e) => setCommentContent(e.target.value)}
                                                placeholder="Write a comment..."
                                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-neutral-500"
                                                onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                            />
                                            <button 
                                                onClick={() => handleComment(post.id)}
                                                className="bg-[#00F0FF] text-black px-4 py-1.5 rounded-lg font-bold text-sm hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                    )}

                                    {/* Comments List */}
                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                                        {post.comments && post.comments.length > 0 ? (
                                            post.comments.map((comment) => (
                                                <CommentItem key={comment.id} comment={comment} postId={post.id} />
                                            ))
                                        ) : (
                                            null
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </StaggerItem>
                ))}
            </StaggerContainer>
            
            {/* FAB */}
             <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCreateDialog(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-[#00F0FF] to-[#00FF94] rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(0,240,255,0.3)] z-50 hover:shadow-[0_0_50px_rgba(0,255,148,0.5)] transition-all"
            >
                <Plus className="w-8 h-8 font-bold" />
            </motion.button>
            
            {/* Create Post Dialog Overlay */}
            <AnimatePresence>
                {showCreateDialog && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateDialog(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-[#111] border border-white/10 w-full max-w-lg rounded-3xl p-6 shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">New Post</h2>
                                <button onClick={() => setShowCreateDialog(false)} className="text-neutral-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <textarea
                                value={createContent}
                                onChange={(e) => setCreateContent(e.target.value)}
                                placeholder="What's happening?"
                                className="w-full bg-white/5 rounded-xl p-4 text-white placeholder-neutral-500 resize-none outline-none min-h-[100px] mb-4 focus:ring-1 focus:ring-[#00F0FF] transition-all text-lg"
                            />

                            {/* Previews */}
                            {mediaUrls.length > 0 && (
                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                    {mediaUrls.map((url, i) => (
                                        <div key={i} className="relative w-20 h-20 flex-shrink-0">
                                            <img src={url} alt="upload" className="w-full h-full object-cover rounded-lg border border-white/20" />
                                            <button 
                                                onClick={() => setMediaUrls(prev => prev.filter((_, idx) => idx !== i))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Tag Selectors */}
                            <div className="flex flex-col gap-2 mb-4">
                                {taggableEvents.length > 0 && (
                                    <select 
                                        className="bg-neutral-800 text-white text-sm p-2 rounded-lg outline-none"
                                        onChange={(e) => {
                                            const id = parseInt(e.target.value);
                                            if (id && !selectedEvents.includes(id)) setSelectedEvents(prev => [...prev, id]);
                                        }}
                                        value=""
                                    >
                                        <option value="">Tag Event (Attended/Volunteered)</option>
                                        {taggableEvents.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                                    </select>
                                )}
                                
                                {taggableUsers.length > 0 && (
                                    <select 
                                        className="bg-neutral-800 text-white text-sm p-2 rounded-lg outline-none"
                                        onChange={(e) => {
                                            const id = parseInt(e.target.value);
                                            if (id && !selectedUsers.includes(id)) setSelectedUsers(prev => [...prev, id]);
                                        }}
                                        value=""
                                    >
                                        <option value="">Tag Friend</option>
                                        {taggableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                )}
                            </div>

                            {/* Selected Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {selectedEvents.map(id => (
                                    <span key={id} className="bg-[#00FF94]/20 text-[#00FF94] text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        #{taggableEvents.find(e => e.id === id)?.title}
                                        <button onClick={() => setSelectedEvents(prev => prev.filter(eid => eid !== id))}><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                                {selectedUsers.map(id => (
                                    <span key={id} className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        @{taggableUsers.find(u => u.id === id)?.name}
                                        <button onClick={() => setSelectedUsers(prev => prev.filter(uid => uid !== id))}><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <label className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-[#00F0FF] transition-colors cursor-pointer" title="Add Image">
                                        <ImageIcon className="w-6 h-6" />
                                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
                                <button
                                    onClick={handleCreatePost}
                                    disabled={createLoading || uploading || (!createContent.trim() && mediaUrls.length === 0)}
                                    className={`px-8 py-3 rounded-xl font-bold transition-all ${
                                        (!createLoading && !uploading && (createContent.trim() || mediaUrls.length > 0))
                                            ? 'bg-gradient-to-r from-[#00F0FF] to-[#00FF94] text-black hover:scale-105 shadow-lg shadow-[#00F0FF]/25'
                                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                                    }`}
                                >
                                    {uploading ? 'Uploading...' : createLoading ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <motion.button 
                            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="w-8 h-8" />
                        </motion.button>
                        <motion.img 
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            src={selectedImage} 
                            alt="Full View" 
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </MotionWrapper>
    );
}
