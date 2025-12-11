'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import MotionWrapper from '@/components/MotionWrapper';
import { motion } from 'framer-motion';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    department?: string;
    enrollment_number?: string;
    title?: string;
    badges?: { name: string; icon: string }[];
    bookings_count?: number;
    posts_count?: number;
    volunteer_count?: number;
    stats?: {
        events_attended: number;
    };
    events_attended?: number;
    available_points?: number;
    total_points?: number;
    active_effect?: string | null;
    inventory?: { name: string; type: string; id: number, metadata?: any }[];
}

import Counter from '@/components/Counter';
import LockedFeatureModal from '@/components/LockedFeatureModal';
import Loader from '@/components/Loader';

interface StudentStats {
    rank: number;
    total_bookings: number;
    total_volunteer: number;
    total_posts: number;
}

interface Booking {
    id: number;
    attended: boolean;
    status: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLockedModal, setShowLockedModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get detailed student profile (includes active_effect, inventory, badges)
                const profileRes = await api.get('/student/profile');
                console.log("DEBUG: Profile Response:", profileRes.data);
                setUser(profileRes.data);

                // 2. Get student stats (for total bookings)
                const statsRes = await api.get('/stats/student');
                setStats(statsRes.data);

                // 3. Get my bookings (to calculate attended)
                const bookingsRes = await api.get('/bookings/my');
                setBookings(bookingsRes.data);

            } catch (error) {
                console.error('Failed to fetch profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
            <Loader />
            <p className="text-neutral-500 animate-pulse">Loading profile data...</p>
        </div>
    );
    if (!user) return <div className="p-8 text-center text-neutral-400">Profile not found</div>;

    // Use real points from backend
    const points = user.available_points || 0; 
    const nextUnlock = 1000;
    const progress = Math.min((points / nextUnlock) * 100, 100);

    // Calculate attended events - prioritize backend stats
    const eventsAttended = user.events_attended !== undefined ? user.events_attended : bookings.filter(b => b.attended).length;
    const volunteerCount = user.volunteer_count !== undefined ? user.volunteer_count : 0;
    const totalEvents = eventsAttended + volunteerCount;

    return (
        <MotionWrapper className="max-w-5xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#00F0FF] to-[#00FF94] bg-clip-text text-transparent">My Profile</h1>
                        <p className="text-neutral-400">Manage your account and view your activity.</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-[#00F0FF] drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
                        <Counter value={points} /> <span className="text-lg text-neutral-400">pts</span>
                    </div>
                    <div className="text-xs text-neutral-500 uppercase tracking-widest">Available Balance</div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-neutral-900/80 backdrop-blur-xl border border-[#00F0FF]/20 rounded-[2rem] p-8 flex flex-col items-center text-center relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.1)] group">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#00F0FF]/10 to-transparent opacity-50" />
                        
                        <div className={`relative w-36 h-36 rounded-full p-1 mb-6 transition-all duration-500 ${
                            user.active_effect === 'Neon Blue Glow' ? 'shadow-[0_0_40px_#00F0FF] border-2 border-[#00F0FF]' :
                            user.active_effect === 'Golden Aura' ? 'shadow-[0_0_40px_#FFD700] border-2 border-[#FFD700]' :
                            user.active_effect === 'Cyber Glitch' ? 'shadow-[0_0_20px_#00FF94] animate-pulse border-2 border-[#00FF94]' :
                            'bg-gradient-to-br from-[#00F0FF] to-[#00FF94] shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                        }`}>
                            <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-5xl font-bold text-white overflow-hidden relative">
                                <span className="z-10">{user.name?.[0] || 'U'}</span>
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/20 to-[#00FF94]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-2 text-white">{user.name}</h2>
                        {user.title && (
                            <span className="mb-4 px-4 py-1 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] text-xs font-bold border border-[#00F0FF]/30 uppercase tracking-widest shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                                {user.title}
                            </span>
                        )}
                        <p className="text-sm text-neutral-400 mb-8">{user.department}</p>

                        {/* Gamification Progress */}
                        <div className="w-full bg-neutral-800 rounded-full h-3 mb-3 overflow-hidden border border-white/5 relative">
                            <div className="absolute inset-0 bg-[#00F0FF]/10 animate-pulse" />
                            <div className="bg-gradient-to-r from-[#00F0FF] to-[#00FF94] h-full rounded-full relative shadow-[0_0_10px_rgba(0,240,255,0.5)]" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-neutral-500 mb-8 w-full flex justify-between">
                            <span><Counter value={points} /> pts</span>
                            <span className="text-[#00FF94]">{nextUnlock} pts target</span>
                        </p>

                        <div className="w-full pt-6 border-t border-white/5 space-y-4 text-sm text-left">
                            <div className="group/item">
                                <span className="text-neutral-500 block text-xs uppercase tracking-wider mb-1 group-hover/item:text-[#00F0FF] transition-colors">Email</span>
                                <span className="text-neutral-300 truncate font-mono">{user.email}</span>
                            </div>
                            <div className="group/item">
                                <span className="text-neutral-500 block text-xs uppercase tracking-wider mb-1 group-hover/item:text-[#00FF94] transition-colors">Enrollment No.</span>
                                <span className="text-neutral-300 font-mono">{user.enrollment_number}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats & Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div whileHover={{ y: -5 }} className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-6xl">🎟️</span>
                            </div>
                            <span className="text-3xl mb-2 block relative z-10">🎟️</span>
                            <span className="text-3xl font-bold block text-white mb-1 relative z-10">
                                <Counter value={(stats?.total_bookings || 0) + (stats?.total_volunteer || 0)} />
                            </span>
                            <span className="text-sm text-neutral-400 relative z-10">Events Booked</span>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#F72585] to-[#7209B7]" />
                        </motion.div>

                        <motion.div whileHover={{ y: -5 }} className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-6xl">✅</span>
                            </div>
                            <span className="text-3xl mb-2 block relative z-10">✅</span>
                            <span className="text-3xl font-bold block text-white mb-1 relative z-10">
                                <Counter value={totalEvents} />
                            </span>
                            <span className="text-sm text-neutral-400 relative z-10">Events Attended</span>
                            
                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between gap-4 relative z-10">
                                <div>
                                    <span className="block text-xs text-neutral-500 uppercase tracking-wider mb-1">Attendee</span>
                                    <span className="text-lg font-bold text-[#00FF94]"><Counter value={eventsAttended} /></span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs text-neutral-500 uppercase tracking-wider mb-1">Volunteer</span>
                                    <span className="text-lg font-bold text-[#00F0FF]"><Counter value={volunteerCount} /></span>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#00FF94] to-[#00F0FF]" />
                        </motion.div>

                        <motion.div whileHover={{ y: -5 }} className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-6xl">📝</span>
                            </div>
                            <span className="text-3xl mb-2 block relative z-10">📝</span>
                            <span className="text-3xl font-bold block text-white mb-1 relative z-10">
                                <Counter value={stats?.total_posts || 0} />
                            </span>
                            <span className="text-sm text-neutral-400 relative z-10">Posts Created</span>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF9E00] to-[#FFD000]" />
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -5, scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }}
                            className="bg-gradient-to-br from-[#00F0FF]/10 to-[#00FF94]/10 border border-[#00F0FF]/30 rounded-2xl p-6 cursor-pointer relative overflow-hidden group" 
                            onClick={() => window.location.href = '/student/points'}
                        >
                            <div className="absolute inset-0 bg-[#00F0FF]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-3xl mb-2 block relative z-10">💎</span>
                            <span className="text-3xl font-bold block text-[#00F0FF] mb-1 relative z-10 drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
                                <Counter value={points} />
                            </span>
                            <span className="text-sm text-neutral-400 relative z-10 flex items-center gap-1 group-hover:text-white transition-colors">
                                Points & Rewards <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                        </motion.div>
                    </div>

                    {/* Badges */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-[2rem] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F0FF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <span className="text-2xl">🏆</span> 
                            <span className="bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">My Badges</span>
                        </h3>
                        
                        {user.badges && user.badges.length > 0 ? (
                            <div className="flex gap-6 flex-wrap">
                                {user.badges.map((badge, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -5 }}
                                        className="group relative"
                                    >
                                        <div className="w-20 h-20 rounded-2xl bg-neutral-800/50 flex items-center justify-center p-4 border border-white/5 relative z-10 overflow-hidden group-hover:border-[#00F0FF]/50 transition-colors shadow-lg group-hover:shadow-[#00F0FF]/20">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-4xl drop-shadow-lg filter group-hover:brightness-110 transition-all">{badge.icon}</span>
                                        </div>
                                        
                                        {/* Badge Name Tooltip */}
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-20">
                                            <span className="text-xs font-bold bg-[#00F0FF]/10 text-[#00F0FF] px-3 py-1 rounded-full border border-[#00F0FF]/20 backdrop-blur-md">
                                                {badge.name}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-2xl">
                                <p className="text-neutral-500 mb-2">No badges earned yet</p>
                                <p className="text-xs text-neutral-600">Participate in events to unlock your first badge!</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Inventory & Effects */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-[2rem] p-8 mt-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <span className="text-2xl">🎒</span> 
                            <span className="bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Inventory & Effects</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {user.inventory?.filter(i => i.type === 'effect').map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#00F0FF]/20 transition-all">
                                    <span className="font-medium text-white">{item.name}</span>
                                    
                                    {user.active_effect === item.name ? (
                                        <button 
                                            onClick={async () => {
                                                await api.post('/student/equip', { item_name: 'None', item_type: 'effect' });
                                                setUser(prev => prev ? { ...prev, active_effect: null } : null);
                                            }}
                                            className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 hover:bg-red-500/30"
                                        >
                                            Unequip
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={async () => {
                                                await api.post('/student/equip', { item_name: item.name, item_type: 'effect' });
                                                setUser(prev => prev ? { ...prev, active_effect: item.name } : null);
                                            }}
                                            className="px-3 py-1 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] text-xs font-bold border border-[#00F0FF]/20 hover:bg-[#00F0FF]/20"
                                        >
                                            Equip
                                        </button>
                                    )}
                                </div>
                            ))}
                            
                            {(!user.inventory || user.inventory.filter(i => i.type === 'effect').length === 0) && (
                                <div className="col-span-full text-center text-neutral-500 py-4">
                                    No effects purchased yet. Visit the <Link href="/student/points" className="text-[#00F0FF] underline">Shop</Link>!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Settings / Actions */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-[2rem] p-8">
                        <h3 className="text-xl font-bold mb-6">Account Settings</h3>
                        <div className="space-y-3">
                            <button onClick={() => setShowLockedModal(true)} className="w-full text-left px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all flex justify-between items-center group border border-white/5 hover:border-white/10">
                                <span className="font-medium group-hover:text-white transition-colors">Edit Profile</span>
                                <span className="text-neutral-500 group-hover:text-[#00F0FF] transition-colors transform group-hover:translate-x-1">→</span>
                            </button>
                            <button onClick={() => setShowLockedModal(true)} className="w-full text-left px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all flex justify-between items-center group border border-white/5 hover:border-white/10">
                                <span className="font-medium group-hover:text-white transition-colors">Change Password</span>
                                <span className="text-neutral-500 group-hover:text-[#00F0FF] transition-colors transform group-hover:translate-x-1">→</span>
                            </button>
                            
                            {/* PWA Install Button */}
                            <button 
                                onClick={() => {
                                    const promptEvent = (window as any).deferredPrompt;
                                    if (promptEvent) {
                                        promptEvent.prompt();
                                        promptEvent.userChoice.then((choiceResult: any) => {
                                            if (choiceResult.outcome === 'accepted') {
                                                console.log('User accepted the A2HS prompt');
                                            }
                                            (window as any).deferredPrompt = null;
                                        });
                                    } else {
                                        alert("To install the app, look for 'Add to Home Screen' in your browser menu.");
                                    }
                                }} 
                                className="w-full text-left px-6 py-4 rounded-2xl bg-gradient-to-r from-[#00F0FF]/10 to-[#00FF94]/10 hover:from-[#00F0FF]/20 hover:to-[#00FF94]/20 transition-all flex justify-between items-center group border border-[#00F0FF]/20"
                            >
                                <span className="font-medium text-[#00F0FF] group-hover:text-white transition-colors">Install App</span>
                                <span className="text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-1 rounded text-xs">FREE</span>
                            </button>
                    </div>
                </div>
            </div>
            </div>
            
            <LockedFeatureModal 
                isOpen={showLockedModal} 
                onClose={() => setShowLockedModal(false)}
                featureName="Account Settings"
                requiredPoints={1000}
            />
        </MotionWrapper>
    );
}
