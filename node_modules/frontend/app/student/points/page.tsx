'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import api from '@/lib/api';
import confetti from 'canvas-confetti';
import RewardCard from '@/components/RewardCard';
import HistoryItem from '@/components/HistoryItem';
import Counter from '@/components/Counter';

export default function PointsPage() {
    const [points, setPoints] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPoints = async () => {
        try {
            const res = await api.get('/auth/me');
            setPoints(res.data.available_points || 0);
            setTotalPoints(res.data.total_points || 0);
        } catch (error) {
            console.error('Failed to fetch points:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/student/history');
            setHistory(res.data);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchPoints(), fetchHistory()]);
            setLoading(false);
        };
        init();
    }, []);

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const random = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults, 
                particleCount,
                origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults, 
                particleCount,
                origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    const handleRedeem = async (id: number, itemName: string, cost: number) => {
        if (confirm(`Are you sure you want to redeem ${itemName} for ${cost} points?`)) {
            try {
                await api.post('/student/spend', { amount: cost, description: `Redeemed: ${itemName}` });
                triggerConfetti();
                // Optimistic update
                setPoints(prev => prev - cost);
                // Refresh real data
                fetchPoints(); 
                fetchHistory(); 
            } catch (error) {
                alert('Failed to redeem. Insufficient points?');
            }
        }
    };

    const rewards = [
        { id: 1, name: 'Canteen Coupon (₹50)', cost: 200, icon: '🍔', color: 'from-orange-500 to-red-500' },
        { id: 2, name: 'Library Fine Waiver', cost: 500, icon: '📚', color: 'from-blue-500 to-indigo-500' },
        { id: 3, name: 'Priority Event Pass', cost: 800, icon: '🎫', color: 'from-purple-500 to-pink-500' },
        { id: 4, name: 'Exclusive Merch', cost: 1500, icon: '👕', color: 'from-green-500 to-emerald-500' },
        { id: 5, name: 'Workshop Discount', cost: 1000, icon: '💡', color: 'from-yellow-500 to-orange-500' },
        { id: 6, name: 'Profile Badge', cost: 300, icon: '🏅', color: 'from-teal-500 to-cyan-500' },
    ].sort((a, b) => a.cost - b.cost);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00F0FF]"></div>
        </div>
    );

    return (
        <MotionWrapper className="max-w-7xl mx-auto p-6 space-y-12">
            <header className="text-center relative py-10">
                <Link href="/student/profile" className="absolute left-0 top-10 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 z-10">
                    ←
                </Link>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#00F0FF]/20 blur-[100px] rounded-full pointer-events-none" />
                <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-[#00F0FF] via-[#ffffff] to-[#00FF94] hover:from-[#FF0080] hover:via-[#ffffff] hover:to-[#7928CA] transition-all duration-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,240,255,0.5)] cursor-default">
                    POINTS SHOP
                </h1>
                <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                    Turn your participation into premium rewards. Earn points, level up, and claim your prizes.
                </p>
            </header>

            {/* Points Balance Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative overflow-hidden bg-neutral-900/50 border border-[#00F0FF]/30 rounded-[2.5rem] p-10 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F0FF]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#00F0FF]/20 transition-colors duration-500" />
                    
                    <h2 className="text-xl font-bold text-neutral-400 mb-2 uppercase tracking-widest">Available Balance</h2>
                    <div className="flex items-baseline gap-4">
                        <span className="text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                            <Counter value={points} />
                        </span>
                        <span className="text-2xl text-[#00F0FF] font-bold">PTS</span>
                    </div>
                    <p className="mt-4 text-neutral-500">Ready to spend on exclusive rewards</p>
                </div>

                <div className="relative overflow-hidden bg-neutral-900/50 border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-center group">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00FF94]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-[#00FF94]/10 transition-colors duration-500" />
                    
                    <h2 className="text-xl font-bold text-neutral-400 mb-2 uppercase tracking-widest">Lifetime Earnings</h2>
                    <div className="flex items-baseline gap-4">
                        <span className="text-5xl font-bold text-white">
                            <Counter value={totalPoints} />
                        </span>
                        <span className="text-xl text-[#00FF94] font-bold">PTS</span>
                    </div>
                    <p className="mt-4 text-neutral-500">Total points accumulated since joining</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Rewards Grid */}
                <section className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <span className="text-4xl">🛍️</span> 
                            <span className="bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Exclusive Rewards</span>
                        </h2>
                        <div className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-400">
                            REFRESHES WEEKLY
                        </div>
                    </div>
                    
                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {rewards.map((reward) => (
                            <StaggerItem key={reward.id}>
                                <RewardCard 
                                    {...reward} 
                                    canAfford={points >= reward.cost}
                                    onRedeem={handleRedeem}
                                />
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </section>

                {/* History Sidebar */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <span className="text-4xl">📜</span>
                        <span className="bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Transaction History</span>
                    </h2>
                    
                    <div className="bg-neutral-900/30 border border-white/5 rounded-[2rem] p-6 backdrop-blur-sm h-[600px] overflow-y-auto custom-scrollbar">
                        {history.length > 0 ? (
                            history.map((item, i) => (
                                <HistoryItem 
                                    key={item.id}
                                    action={item.description || item.action} // Handle both fields if backend varies
                                    date={item.timestamp || item.date}
                                    points={item.amount || item.points}
                                    delay={i * 0.05}
                                />
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                                <span className="text-4xl mb-4">🕸️</span>
                                <p className="text-neutral-400">No transactions yet.</p>
                                <p className="text-xs text-neutral-600 mt-2">Earn points to see history here.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </MotionWrapper>
    );
}
