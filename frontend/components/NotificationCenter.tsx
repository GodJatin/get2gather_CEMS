'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
    data?: any;
}

export default function NotificationCenter({ children }: { children?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUnreadCount = async () => {
        try {
            const res = await getUnreadCount();
            if (res.data && typeof res.data.count === 'number') {
                 setUnreadCount(res.data.count);
            }
        } catch (error) {
            console.error("Failed to fetch unread count", error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await getNotifications();
            console.log("🔔 [NotificationCenter] Fetch Response:", res);
            
            if (res.data && Array.isArray(res.data)) {
                console.log(`🔔 [NotificationCenter] Loaded ${res.data.length} notifications`);
                setNotifications(res.data);
                // Unread count logic
                const count = res.data.filter((n: Notification) => !n.is_read).length;
                // setUnreadCount(count); 
            } else {
                console.warn("🔔 [NotificationCenter] Unexpected response format:", res.data);
                setNotifications([]);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        fetchNotifications();

        // Poll every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            try {
                await markNotificationRead(notification.id);
                setNotifications(prev => 
                    prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error("Failed to mark notification as read", error);
            }
        }

        if (notification.data && notification.data.event_id) {
            router.push(`/events/${notification.data.event_id}`);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer relative">
                {children ? (
                    <>
                        {children}
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-5 h-5 bg-red-500 text-[10px] flex items-center justify-center text-white rounded-full border-2 border-neutral-900 z-50">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </>
                ) : (
                    <button
                        className="relative p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                        
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] flex items-center justify-center text-white rounded-full border border-neutral-900">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-[85vw] md:w-[450px] bg-neutral-900 border border-white/10 rounded-2xl shadow-xl overflow-hidden z-[100] origin-top-right"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-neutral-800/50">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {loading ? (
                                <div className="p-8 flex justify-center text-neutral-500">
                                    <span className="animate-spin mr-2">⏳</span> Loading...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500 text-sm">
                                    No notifications yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((n) => (
                                        <div 
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${
                                                !n.is_read ? 'bg-blue-500/5' : ''
                                            }`}
                                        >
                                            <div className="mt-1">
                                                {n.type === 'alert' && <span className="text-red-400">⚠️</span>}
                                                {n.type === 'success' && <span className="text-green-400">✅</span>}
                                                {n.type === 'info' && <span className="text-blue-400">ℹ️</span>}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-sm ${!n.is_read ? 'font-bold text-white' : 'font-medium text-neutral-300'}`}>
                                                    {n.title}
                                                </h4>
                                                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-neutral-600 mt-2">
                                                    {/* Ensure we parse the date string usually ending in Z or Iso */}
                                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                            {!n.is_read && (
                                                <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
