'use client';

import { motion } from 'framer-motion';

export function ScoreSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-2 w-full animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-3 border border-slate-100 flex flex-col items-center gap-2 relative overflow-hidden">
                    {/* Shimmer Effect */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent z-10"
                    />

                    <div className="w-10 h-10 rounded-2xl bg-slate-100" />
                    <div className="w-12 h-3 bg-slate-100 rounded-full" />
                    <div className="w-8 h-4 bg-slate-100 rounded-full mt-1" />
                </div>
            ))}
        </div>
    );
}

export function MissionSkeleton() {
    return (
        <div className="w-full h-40 bg-slate-100 rounded-[2.5rem] relative overflow-hidden animate-pulse">
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent z-10"
            />
        </div>
    );
}
