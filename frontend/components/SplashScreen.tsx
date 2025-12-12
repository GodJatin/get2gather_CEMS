"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Total duration: 3.5s
        // Typewriter: 0-1.5s
        // Logo: 1.5s-2.5s
        // Hold: 2.5s-3.5s
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onFinish) onFinish();
        }, 4000); 

        return () => clearTimeout(timer);
    }, [onFinish]);

    const text = "Get2Gather";

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950 overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
                >
                    {/* Background Particles */}
                    <div className="absolute inset-0 z-0">
                         {[...Array(15)].map((_, i) => (
                            <Particle key={i} />
                        ))}
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center">
                         {/* Typewriter Text */}
                        <div className="mb-6 h-16 flex items-center">
                            {text.split("").map((char, index) => (
                                <motion.span
                                    key={index}
                                    className="text-4xl md:text-6xl font-bold text-white tracking-widest inline-block"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ 
                                        duration: 0.1, 
                                        delay: index * 0.15, // Slow typewriting
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>

                         {/* Logo Animation */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0, rotate: -180 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ duration: 0.8, delay: 2, type: "spring" }} // Appears after text
                            className="relative"
                        >
                             <img 
                                src="/logo.png" 
                                alt="Get2Gather Logo" 
                                className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                            />
                            
                            {/* Glowing Ring behind logo */}
                            <motion.div 
                                className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/40 to-secondary/40 blur-xl -z-10"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function Particle() {
    const [mounted, setMounted] = useState(false);
    // Randomize colors: Primary (Approx #8B5CF6), Secondary (#06b6d4), Yellow/Accent
    const colors = ["bg-purple-500", "bg-teal-500", "bg-blue-500", "bg-yellow-400"];
    const [props, setProps] = useState({ 
        x: 0, y: 0, size: 0, duration: 0, delay: 0, color: "" 
    });

    useEffect(() => {
        setMounted(true);
        setProps({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 4 + 2,
            duration: 3 + Math.random() * 4,
            delay: Math.random() * 2,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }, []);

    if (!mounted) return null;

    return (
        <motion.div
            className={`absolute rounded-full ${props.color} blur-[1px]`}
            initial={{ 
                x: props.x, 
                y: props.y,
                opacity: 0,
                scale: 0
            }}
            animate={{ 
                y: [props.y, props.y - 100 - Math.random() * 100],
                x: [props.x, props.x + (Math.random() - 0.5) * 50],
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0]
            }}
            transition={{ 
                duration: props.duration, 
                repeat: Infinity, 
                repeatDelay: props.delay,
                ease: "easeInOut"
            }}
            style={{
                width: props.size + "px",
                height: props.size + "px",
            }}
        />
    );
}
