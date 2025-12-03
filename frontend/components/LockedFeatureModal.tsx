'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface LockedFeatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
    requiredPoints?: number;
}

export default function LockedFeatureModal({ isOpen, onClose, featureName, requiredPoints = 1000 }: LockedFeatureModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
                >
                    {/* Decorative Background */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                    
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                            <span className="text-4xl">🔒</span>
                        </div>
                    </div>

                    {/* Content */}
                    <h2 className="text-2xl font-bold text-white mb-2">Feature Locked</h2>
                    <p className="text-neutral-400 mb-6">
                        <span className="text-white font-bold">{featureName}</span> is currently locked. 
                        You need to earn more points to unlock advanced account features.
                    </p>

                    <div className="bg-neutral-800/50 rounded-xl p-4 mb-8 border border-white/5">
                        <p className="text-sm text-neutral-500 mb-2">Unlock at</p>
                        <div className="text-3xl font-bold text-[#00F0FF] drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                            {requiredPoints} pts
                        </div>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-colors"
                    >
                        Got it, I'll earn more!
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
