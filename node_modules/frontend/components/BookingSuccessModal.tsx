'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface BookingSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BookingSuccessModal({ isOpen, onClose }: BookingSuccessModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
                >
                    {/* Decorative Background */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                                className="text-6xl"
                            >
                                ⭐
                            </motion.div>
                            {/* Confetti / Sparkles */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-4 -right-4 text-2xl text-yellow-400"
                            >
                                ✨
                            </motion.div>
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute -bottom-2 -left-4 text-xl text-blue-400"
                            >
                                🎉
                            </motion.div>
                        </div>
                    </div>

                    {/* Content */}
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Thank you for booking!</h2>
                    <p className="text-neutral-500 mb-8">
                        You have successfully registered for this event. We will let you know when it starts.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => router.push('/student/bookings')}
                            className="flex-1 py-3 rounded-xl bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors"
                        >
                            View Ticket
                        </button>
                    </div>

                    <div className="mt-6 text-xs text-neutral-400 font-medium tracking-widest uppercase">
                        Get2Gather
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
