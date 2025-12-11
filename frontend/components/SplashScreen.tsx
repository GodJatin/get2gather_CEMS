"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onFinish) onFinish();
        }, 3000); // Show for 3 seconds

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                >
                    {/* Background Effects */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500 rounded-full blur-[100px]" />
                        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500 rounded-full blur-[100px]" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, type: "spring" }}
                            className="mb-8"
                        >
                             {/* Placeholder for Logo if not using image, or use the image */}
                             <motion.img 
                                src="/logo.png" 
                                alt="Get2Gather" 
                                className="w-32 h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                animate={{ 
                                    y: [0, -20, 0],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                    duration: 4, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
                                }}
                             />
                        </motion.div>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "200px" }}
                            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                            className="h-1 bg-white/20 rounded-full overflow-hidden"
                        >
                            <motion.div 
                                className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400"
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                            />
                        </motion.div>

                        <motion.h1 
                            className="mt-6 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50 tracking-widest"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            GET2GATHER
                        </motion.h1>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
