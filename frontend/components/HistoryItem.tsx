'use client';

import { motion } from 'framer-motion';

interface HistoryItemProps {
    action: string;
    date: string;
    points: number;
    delay: number;
}

export default function HistoryItem({ action, date, points, delay }: HistoryItemProps) {
    const isPositive = points > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.3 }}
            className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all mb-3"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                    {isPositive ? '↓' : '↑'}
                </div>
                <div>
                    <p className="font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-400 transition-all">
                        {action}
                    </p>
                    <p className="text-xs text-neutral-500 font-mono">
                        {new Date(date).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>
            <div className={`text-lg font-bold font-mono ${
                isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
                {isPositive ? '+' : ''}{points}
            </div>
        </motion.div>
    );
}
