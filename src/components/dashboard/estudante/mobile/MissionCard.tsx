'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface MissionCardProps {
    mission?: {
        id: string;
        title: string;
        description?: string;
        type: string;
        due_date?: string;
    } | null;
}

export function MissionCard({ mission }: MissionCardProps) {
    if (!mission) return null;

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8 relative overflow-hidden"
        >
            {/* Background Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-city-blue/10 blur-[60px] -z-10" />

            <div className="bg-gradient-to-br from-city-blue to-city-blue-dark p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,144,217,0.3)] text-white group">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                        <Rocket size={24} className="text-white animate-pulse" />
                    </div>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest">
                        Próxima Missão
                    </span>
                </div>

                <div className="space-y-2 mb-6">
                    <h2 className="text-2xl font-black leading-tight line-clamp-2">
                        {mission.title}
                    </h2>
                    <div className="flex items-center gap-2 opacity-80 text-xs font-bold">
                        <Clock size={14} />
                        <span>Entrega: Amanhã, 18:00</span>
                    </div>
                </div>

                <Link
                    href={`/estudante/atividades/${mission.id}`}
                    className="w-full flex items-center justify-between bg-white text-city-blue px-6 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.2)]"
                >
                    <span>INICIAR AGORA</span>
                    <ArrowRight size={18} />
                </Link>
            </div>

            {/* Decorative pulse ring */}
            <div className="absolute -top-10 -right-10 w-40 h-40 border-[20px] border-white/5 rounded-full" />
        </motion.div>
    );
}
