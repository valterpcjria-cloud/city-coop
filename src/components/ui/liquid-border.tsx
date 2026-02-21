"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidBorderProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    active?: boolean;
}

export function LiquidBorder({
    children,
    className,
    containerClassName,
    active = true
}: LiquidBorderProps) {
    return (
        <div className={cn("relative p-[1px] overflow-hidden rounded-2xl group", containerClassName)}>
            {active && (
                <>
                    <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 z-0"
                        style={{
                            background: "conic-gradient(from 0deg, transparent 0%, var(--primary) 5%, transparent 10%, transparent 50%, var(--accent) 55%, transparent 60%)",
                            margin: "-20%",
                        }}
                    />
                    {/* Minimal glow */}
                    <div className="absolute inset-0 z-0 blur-md opacity-5 bg-gradient-brand" />
                </>
            )}

            <div className={cn(
                "relative z-10 bg-white dark:bg-slate-900 rounded-[15px] h-full w-full",
                className
            )}>
                {children}
            </div>
        </div>
    );
}
