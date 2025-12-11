'use client';

import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import { Bell, Calendar, Star, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Mock Data
const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        title: "Hackathon Date Changed",
        message: "The 'CodeWar 2024' hackathon has been rescheduled to next Saturday due to maintenance.",
        type: "alert", // alert, info, success
        date: "2024-10-25T10:00:00",
        read: false
    },
    {
        id: 2,
        title: "New Event: AI Workshop",
        message: "Join us for an exclusive workshop on Generative AI. Seats are filling fast!",
        type: "success",
        date: "2024-10-24T14:30:00",
        read: false
    },
    {
        id: 3,
        title: "Point Balance Updated",
        message: "You received 50 points for attending 'Campus Clean Drive'.",
        type: "info",
        date: "2024-10-23T09:15:00",
        read: true
    },
    {
        id: 4,
        title: "Volunteer Application Approved",
        message: "Your application to volunteer for 'Tech Fest' has been approved. Check your dashboard.",
        type: "success",
        date: "2024-10-22T16:45:00",
        read: true
    }
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <MotionWrapper className="max-w-2xl mx-auto pb-20">
            <header className="mb-8 flex items-center justify-between">
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
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <StaggerItem 
                            key={notif.id}
                            className={`p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                                notif.read 
                                    ? 'bg-neutral-900/50 border-white/5 opacity-70' 
                                    : 'bg-neutral-800/80 border-blue-500/30 shadow-lg shadow-blue-500/5'
                            }`}
                            onClick={() => markAsRead(notif.id)}
                        >
                            {!notif.read && (
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
                                    <h3 className={`font-bold mb-1 ${notif.read ? 'text-neutral-300' : 'text-white'}`}>
                                        {notif.title}
                                    </h3>
                                    <p className="text-sm text-neutral-400 mb-2 leading-relaxed">
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-neutral-600">
                                        {new Date(notif.date).toLocaleString()}
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
