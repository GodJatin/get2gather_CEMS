'use client';

import { motion, HTMLMotionProps } from 'framer-motion';

interface MotionWrapperProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export default function MotionWrapper({ children, className = "", delay = 0 }: MotionWrapperProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export const StaggerContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerItem = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string } & HTMLMotionProps<"div">) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
};
