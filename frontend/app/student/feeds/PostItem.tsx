'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, ArrowLeft, ArrowRight, MapPin, Smile } from 'lucide-react';
import Link from 'next/link';
import { Post, Comment } from './types';
import { StaggerItem } from '@/components/MotionWrapper';

// Helper for image URLs
const getMediaUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.includes('localhost:8000') || path.includes('127.0.0.1:8000')) {
        path = path.replace('http://localhost:8000', '').replace('http://127.0.0.1:8000', '');
    }
    if (path.startsWith('http') || path.startsWith('https') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (apiUrl) {
        const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
        return `${baseUrl}${cleanPath}`;
    }
    return cleanPath;
};

// Improved Time Formatter
const formatTimeAgo = (dateString: string) => {
    // Parse UTC date string
    const date = new Date(dateString);
    const now = new Date();
    
    // Get difference in milliseconds
    // Note: new Date(isoString) returns local time, assuming server sends UTC ending in Z or is treated as UTC
    // If server sends naive datetime, we might need to assume it's UTC.
    // Let's assume standard behavior:
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // If it's more than 24 hours (86400 seconds), show Date
    if (diffInSeconds >= 86400) {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    // Less than 24 hours
    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h ago`;
};

interface PostItemProps {
    post: Post;
    activePostId: number | null;
    onToggleComments: (id: number) => void;
    onLike: (id: number) => void;
    onOpenLightbox: (url: string, allUrls: string[]) => void;
    children?: React.ReactNode; // For the comments section which is passed as slot or we render it here? 
                                // To minimize refactor, let's keep comments logic in parent for now or move it here?
                                // User asked to modify the list item. Let's pass the "isExpanded" state.
}

export default function PostItem({ post, activePostId, onToggleComments, onLike, onOpenLightbox, children }: PostItemProps) {
    const isActive = activePostId === post.id;
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleShare = () => {
        const text = `Check out this post by ${post.user_name}: ${post.content.substring(0, 50)}...`;
        const url = window.location.href; // Or specific post link if we had routing
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <StaggerItem 
            className={`
                bg-neutral-900/80 backdrop-blur-md border rounded-3xl p-6 transition-all shadow-xl
                ${isActive 
                    ? 'border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.15)] ring-1 ring-[#00F0FF]/50' // Glowing border logic
                    : 'border-white/10 hover:border-[#00F0FF]/30'
                }
            `}
        >
            {/* Post Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                     {/* Avatar Frame */}
                    <div 
                        className={`
                            w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg relative z-10
                            bg-gradient-to-br from-blue-600 to-purple-600
                            ${post.user_active_effect === 'frame-gold' ? 'ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-pulse' : ''}
                            ${post.user_active_effect === 'frame-silver' ? 'ring-4 ring-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.6)]' : ''}
                            ${post.user_active_effect === 'frame-bronze' ? 'ring-4 ring-orange-700 shadow-[0_0_15px_rgba(194,65,12,0.6)]' : ''}
                        `}
                    >
                        {(post.user_name || "U")[0]}
                    </div>
                    {/* Crown Icon for Gold */}
                    {post.user_active_effect === 'frame-gold' && (
                        <div className="absolute -top-3 -right-1 text-2xl z-20 animate-bounce">👑</div>
                    )}
                </div>
                
                <div>
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        {post.user_name}
                        {post.user_active_effect === 'frame-gold' && <span className="text-yellow-400 text-xs px-2 py-0.5 border border-yellow-400 rounded-full">#1 Weekly</span>}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span>{formatTimeAgo(post.created_at)}</span>
                        {post.location && <span className="flex items-center gap-1">| <MapPin className="w-3 h-3"/> {post.location}</span>}
                        {post.feeling && <span className="flex items-center gap-1">| <Smile className="w-3 h-3"/> is feeling {post.feeling}</span>}
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <p className="text-gray-100 mb-4 whitespace-pre-wrap leading-relaxed text-base">{post.content}</p>
            
            {/* Tags Display */}
            {((post.tagged_events && post.tagged_events.length > 0) || (post.tagged_users && post.tagged_users.length > 0)) && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tagged_events?.map(tag => (
                        <Link key={`event-${tag.id}`} href={`/student/events/${tag.id}`} className="text-xs font-bold text-[#00FF94] bg-[#00FF94]/10 px-2 py-1 rounded-md hover:bg-[#00FF94]/20 transition-colors">
                            #{tag.name}
                        </Link>
                    ))}
                    {post.tagged_users?.map(tag => (
                        <Link key={`user-${tag.id}`} href={`/student/profile/${tag.id}`} className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md hover:bg-purple-500/20 transition-colors">
                            @{tag.name}
                        </Link>
                    ))}
                </div>
            )}
            
            {/* Media Carousel */}
            {post.media_urls && post.media_urls.length > 0 && (
                <div className="relative group/carousel mb-4">
                    {/* Left Arrow */}
                    {post.media_urls.length > 1 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); scroll('left'); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}

                    {/* Scroll Container */}
                    <div 
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-2 snap-x snap-mandatory scrollbar-none pb-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar
                    >
                        {post.media_urls.map((url, i) => (
                            <div key={i} className="flex-shrink-0 w-full sm:w-[90%] md:w-[80%] aspect-video relative snap-center rounded-xl overflow-hidden cursor-pointer" onClick={() => onOpenLightbox(url, post.media_urls)}>
                                    <img src={getMediaUrl(url)} alt="Post Media" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    {post.media_urls.length > 1 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); scroll('right'); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex gap-6">
                    <button 
                        onClick={() => onLike(post.id)}
                        className={`flex items-center gap-2 transition-all ${post.is_liked ? 'text-red-500' : 'text-neutral-400 hover:text-white'}`}
                    >
                        <Heart className={`w-6 h-6 ${post.is_liked ? 'fill-current' : ''}`} />
                        <span className="font-medium">{post.likes_count}</span>
                    </button>
                    <button 
                        onClick={() => onToggleComments(post.id)}
                        className={`flex items-center gap-2 transition-colors ${isActive ? 'text-[#00F0FF]' : 'text-neutral-400 hover:text-[#00F0FF]'}`}
                    >
                        <MessageCircle className="w-6 h-6" />
                        <span className="font-medium">{post.comments_count}</span>
                    </button>
                    <button 
                        onClick={handleShare}
                        className="text-neutral-400 hover:text-green-400 transition-colors"
                        title="Share on WhatsApp"
                    >
                        <Share2 className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Comments Slot */}
            <AnimatePresence>
                {isActive && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-0 overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </StaggerItem>
    );
}
