"use client";

import { m, LazyMotion, domAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function PremiumCard({ children, className, delay = 0 }: PremiumCardProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay * 0.1 }}
        whileHover={{ y: -5, boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.1)" }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/60 shadow-sm",
          "before:absolute before:inset-0 before:bg-noise before:opacity-[0.03] before:pointer-events-none before:z-0",
          className
        )}
      >
        <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl transition-opacity group-hover:opacity-100" />
        <div className="relative z-10 p-6">{children}</div>
      </m.div>
    </LazyMotion>
  );
}

