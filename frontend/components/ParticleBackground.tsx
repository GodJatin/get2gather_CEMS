"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ParticleBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-neutral-950">
             {[...Array(50)].map((_, i) => (
                <Particle key={i} />
            ))}
        </div>
    );
}

function Particle() {
    const [mounted, setMounted] = useState(false);
    // Randomize colors: Primary (Approx #8B5CF6), Secondary (#06b6d4), Yellow/Accent
    const colors = ["bg-purple-500", "bg-teal-500", "bg-blue-500", "bg-yellow-400", "bg-pink-500"];
    const [props, setProps] = useState({ 
        x: 0, y: 0, size: 0, duration: 0, delay: 0, color: "" 
    });

    useEffect(() => {
        setMounted(true);
        setProps({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 4 + 2, // Slightly larger
            duration: 8 + Math.random() * 10,
            delay: Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }, []);

    if (!mounted) return null;

    return (
        <motion.div
            className={`absolute rounded-full ${props.color} blur-[1px]`} // Reduced blur for visibility
            initial={{ 
                x: props.x, 
                y: props.y,
                opacity: 0,
                scale: 0
            }}
            animate={{ 
                y: [props.y, props.y - 100 - Math.random() * 100],
                x: [props.x, props.x + (Math.random() - 0.5) * 50],
                opacity: [0, 0.6, 0], // Increased opacity
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
                boxShadow: "0 0 10px currentColor" // Add glow
            }}
        />
    );
}
