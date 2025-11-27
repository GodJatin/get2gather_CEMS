'use client';

import { useState, useEffect } from 'react';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import api from '@/lib/api';

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

    const handleRedeem = async (cost: number, itemName: string) => {
        if (confirm(`Are you sure you want to redeem ${itemName} for ${cost} points?`)) {
            try {
                await api.post('/student/spend', { amount: cost, description: `Redeemed: ${itemName}` });
                alert('Redemption successful!');
                fetchPoints(); // Refresh balance
                fetchHistory(); // Refresh history
            } catch (error) {
                alert('Failed to redeem. Insufficient points?');
            }
        }
    };

    const rewards = [
        { id: 1, name: 'Canteen Coupon (₹50)', cost: 200, icon: '🍔', color: 'bg-orange-500' },
        { id: 2, name: 'Library Fine Waiver', cost: 500, icon: '📚', color: 'bg-blue-500' },
        { id: 3, name: 'Priority Event Pass', cost: 800, icon: '🎫', color: 'bg-purple-500' },
        { id: 4, name: 'Exclusive Merch', cost: 1500, icon: '👕', color: 'bg-green-500' },
    ];

    if (loading) return <div className="p-8 text-center text-neutral-400">Loading points...</div>;

    return (
        <MotionWrapper className="max-w-6xl mx-auto p-6">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4">Points & Rewards</h1>
                <p className="text-neutral-400">Earn points by participating and redeem them for cool rewards!</p>
            </header>

            {/* Points Balance Card */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-3xl p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                    <h2 className="text-2xl font-bold mb-2 relative z-10">Available Balance</h2>
                    <div className="text-6xl font-bold text-yellow-400 mb-4 relative z-10">{points}</div>
                    <p className="text-yellow-200/70 relative z-10">Points ready to spend</p>
                </div>
                <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 text-center flex flex-col justify-center">
                    <h2 className="text-xl font-bold mb-2 text-neutral-400">Total Collected</h2>
                    <div className="text-4xl font-bold text-white mb-2">{totalPoints}</div>
                    <p className="text-sm text-neutral-500">Lifetime earnings</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Rewards Shop */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span>🛍️</span> Rewards Shop
                    </h2>
                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {rewards.map((reward) => (
                            <StaggerItem key={reward.id} className="bg-neutral-900/50 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center hover:border-white/20 transition-colors group">
                                <div className={`w-16 h-16 rounded-2xl ${reward.color} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {reward.icon}
                                </div>
                                <h3 className="font-bold mb-1">{reward.name}</h3>
                                <p className="text-yellow-500 font-bold mb-4">{reward.cost} pts</p>
                                <button 
                                    onClick={() => handleRedeem(reward.cost, reward.name)}
                                    disabled={points < reward.cost}
                                    className={`w-full py-2 rounded-xl font-bold text-sm transition-colors ${
                                        points >= reward.cost 
                                            ? 'bg-white text-black hover:bg-neutral-200' 
                                            : 'bg-white/5 text-neutral-500 cursor-not-allowed'
                                    }`}
                                >
                                    {points >= reward.cost ? 'Redeem' : 'Not Enough Points'}
                                </button>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </section>

                {/* History */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span>📜</span> History
                    </h2>
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl overflow-hidden">
                        {history.length > 0 ? (
                            history.map((item, i) => (
                                <div key={item.id} className={`p-4 flex justify-between items-center ${i !== history.length - 1 ? 'border-b border-white/5' : ''}`}>
                                    <div>
                                        <p className="font-bold">{item.action}</p>
                                        <p className="text-xs text-neutral-500">{new Date(item.date).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`font-bold ${item.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.points > 0 ? '+' : ''}{item.points}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-neutral-500">
                                No transactions yet.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </MotionWrapper>
    );
}
