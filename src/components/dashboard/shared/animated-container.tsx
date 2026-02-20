"use client";

import { motion } from "framer-motion";

interface AnimatedContainerProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
}

export function AnimatedContainer({
    children,
    className,
    delay = 0,
    direction = "up"
}: AnimatedContainerProps) {
    const directions = {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 }
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...directions[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.5, delay: delay * 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
