"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onFinish) onFinish();
        }, 3500); // Show for 3.5 seconds

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950 overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)", transition: { duration: 0.8, ease: "easeInOut" } }}
                >
                    {/* Dynamic Background Effects */}
                    <div className="absolute inset-0 opacity-30">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary rounded-full blur-[150px]" 
                        />
                        <motion.div 
                            animate={{ 
                                x: [-50, 50, -50],
                                y: [-50, 50, -50],
                            }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-600 rounded-full blur-[120px]" 
                        />
                        <motion.div 
                            animate={{ 
                                x: [50, -50, 50],
                                y: [50, -50, 50],
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600 rounded-full blur-[120px]" 
                        />
                    </div>

                    {/* Particle Effects (Simple CSS/Framer implementation) */}
                    {[...Array(6)].map((_, i) => (
                        <Particle key={i} />
                    ))}

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative">
                            <motion.div
                                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{ duration: 1.2, type: "spring", bounce: 0.5 }}
                                className="mb-8 relative z-10"
                            >
                                <img 
                                    src="/logo.png" 
                                    alt="Get2Gather" 
                                    className="w-40 h-40 object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                                />
                            </motion.div>
                            
                            {/* Orbital Ring */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1, rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 0.5 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full border-t-primary border-r-transparent"
                            />
                             <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1, rotate: -360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 0.5 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border border-white/5 rounded-full border-b-secondary border-l-transparent"
                            />
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <motion.h1 
                                className="text-4xl md:text-5xl font-bold text-white tracking-[0.2em]"
                                initial={{ opacity: 0, y: 20, letterSpacing: "0.5em" }}
                                animate={{ opacity: 1, y: 0, letterSpacing: "0.2em" }}
                                transition={{ duration: 1, delay: 0.5 }}
                            >
                                GET2GATHER
                            </motion.h1>
                            
                            <motion.div 
                                className="h-1 w-24 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 96, opacity: 1 }}
                                transition={{ duration: 1, delay: 1 }}
                            />
                            
                            <motion.p
                                className="text-neutral-400 text-sm tracking-widest uppercase mt-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2 }}
                            >
                                Campus Events Reimagined
                            </motion.p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function Particle() {
    const [mounted, setMounted] = useState(false);
    const [uniqueProps, setUniqueProps] = useState({ x: 0, y: 0, size: 0, duration: 2, delay: 0, moveY: -100 });

    useEffect(() => {
        setMounted(true);
        setUniqueProps({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 4 + 2,
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 2,
            moveY: Math.random() * -100
        });
    }, []);

    if (!mounted) return null;

    return (
        <motion.div
            className="absolute rounded-full bg-white/20"
            initial={{ 
                x: uniqueProps.x, 
                y: uniqueProps.y,
                scale: 0
            }}
            animate={{ 
                y: [null, uniqueProps.moveY],
                scale: [0, 1, 0],
                opacity: [0, 0.5, 0]
            }}
            transition={{ 
                duration: uniqueProps.duration, 
                repeat: Infinity, 
                repeatDelay: uniqueProps.delay 
            }}
            style={{
                width: uniqueProps.size + "px",
                height: uniqueProps.size + "px",
            }}
        />
    );
}
