'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface RewardCardProps {
    id: number;
    name: string;
    cost: number;
    icon: string;
    color: string;
    canAfford: boolean;
    onRedeem: (id: number, name: string, cost: number) => void;
}

export default function RewardCard({ id, name, cost, icon, color, canAfford, onRedeem }: RewardCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="relative group"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ y: -10 }}
        >
            {/* Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl`} />

            <div className="relative bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center h-full overflow-hidden transition-colors group-hover:border-white/20">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
                
                {/* Icon Circle */}
                <div className={`relative w-24 h-24 mb-6 rounded-full flex items-center justify-center text-5xl shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    <div className={`absolute inset-0 ${color} opacity-20 rounded-full blur-md group-hover:opacity-40 transition-opacity`} />
                    <div className={`relative z-10 w-full h-full rounded-full bg-neutral-800/50 border border-white/10 flex items-center justify-center backdrop-blur-md`}>
                        {icon}
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-400 transition-all">
                    {name}
                </h3>
                
                <div className="mt-auto w-full">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="text-yellow-400 text-lg">💎</span>
                        <span className={`text-2xl font-bold ${canAfford ? 'text-white' : 'text-neutral-500'}`}>
                            {cost}
                        </span>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onRedeem(id, name, cost)}
                        disabled={!canAfford}
                        className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide uppercase transition-all duration-300 relative overflow-hidden ${
                            canAfford
                                ? 'bg-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                : 'bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5'
                        }`}
                    >
                        <span className="relative z-10">{canAfford ? 'Redeem Reward' : 'Insufficient Points'}</span>
                        {canAfford && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer" />
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
