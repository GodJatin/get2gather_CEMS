'use client';

import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import BackButton from '@/components/BackButton';
import { Bell, Calendar, Star, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    created_at: string;
    is_read: boolean;
    data?: any;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/notifications/');
            setNotifications(res.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            // toast.error("Failed to load notifications"); // Optional: don't spam user on load
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: number) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        try {
            await api.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error("Failed to mark read", error);
            toast.error("Failed to update notification");
            // Revert on failure? Not strictly necessary for read status
        }
    };

    const markAllAsRead = async () => {
        const original = [...notifications];
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        try {
            await api.put('/notifications/read-all');
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Failed to mark all read", error);
            toast.error("Failed to mark all as read");
            setNotifications(original);
        }
    };

    const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.is_read).length : 0;

    return (
        <MotionWrapper className="max-w-2xl mx-auto pb-20 pt-6">
            <BackButton />
            <header className="mb-8 mt-4 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
                    <p className="text-neutral-400">Stay updated with latest events and announcements.</p>
                </div>
                <div className="relative">
                    <Bell className="text-white w-8 h-8" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </header>

            <div className="flex justify-end mb-6">
                <button 
                    onClick={markAllAsRead}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                    Mark all as read
                </button>
            </div>

            <StaggerContainer className="space-y-4">
                {isLoading ? (
                    // Skeleton Loading
                    Array(3).fill(0).map((_, i) => (
                         <div key={i} className="h-24 bg-neutral-900/50 rounded-2xl animate-pulse" />
                    ))
                ) : notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <StaggerItem 
                            key={notif.id}
                            className={`p-4 rounded-2xl border transition-all relative overflow-hidden group cursor-pointer ${
                                notif.is_read 
                                    ? 'bg-neutral-900/50 border-white/5 opacity-70 hover:bg-neutral-800' 
                                    : 'bg-neutral-800/80 border-blue-500/30 shadow-lg shadow-blue-500/5 hover:border-blue-500/50'
                            }`}
                            onClick={() => {
                                if (!notif.is_read) markAsRead(notif.id);
                                if (notif.data?.link) window.location.href = notif.data.link;
                            }}
                        >
                            {!notif.is_read && (
                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            )}
                            
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                                    notif.type === 'alert' ? 'bg-red-500/20 text-red-400' :
                                    notif.type === 'success' ? 'bg-green-500/20 text-green-400' :
                                    'bg-blue-500/20 text-blue-400'
                                }`}>
                                    {notif.type === 'alert' ? <Info size={24} /> :
                                     notif.type === 'success' ? <Star size={24} /> :
                                     <Calendar size={24} />}
                                </div>
                                <div>
                                    <h3 className={`font-bold mb-1 ${notif.is_read ? 'text-neutral-300' : 'text-white'}`}>
                                        {notif.title}
                                    </h3>
                                    <p className="text-sm text-neutral-400 mb-2 leading-relaxed">
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-neutral-600">
                                        {new Date(notif.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </StaggerItem>
                    ))
                ) : (
                    <div className="text-center py-20 text-neutral-500">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No notifications yet</p>
                    </div>
                )}
            </StaggerContainer>
        </MotionWrapper>
    );
}
