'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface InteractiveFeatureCardProps {
  icon: string;
  title: string;
  description: string;
  colorClass: string; // e.g., "from-primary to-purple-600"
  delay?: number;
}

export default function InteractiveFeatureCard({ icon, title, description, colorClass, delay = 0 }: InteractiveFeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-[320px] rounded-3xl bg-neutral-900/50 border border-white/5 overflow-hidden group cursor-pointer"
    >
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      {/* Animated Border */}
      <div className={`absolute inset-0 border-2 border-transparent group-hover:border-white/10 rounded-3xl transition-colors duration-500`} />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        {/* Icon */}
        <motion.div
          animate={{
            scale: isHovered ? 0.6 : 1,
            y: isHovered ? -60 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-4xl shadow-lg mb-6 z-10`}
        >
          {icon}
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 20,
          }}
          transition={{ duration: 0.3, delay: isHovered ? 0.1 : 0 }}
          className="absolute bottom-8 left-0 right-0 px-8"
        >
          <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
          <p className="text-neutral-400 leading-relaxed text-sm">
            {description}
          </p>
        </motion.div>
        
        {/* Initial Title (Visible when not hovered) */}
        <motion.h3
            animate={{ opacity: isHovered ? 0 : 1, y: isHovered ? -20 : 0 }}
            className="text-xl font-bold text-neutral-300 absolute bottom-12"
        >
            {title}
        </motion.h3>
      </div>
    </motion.div>
  );
}
