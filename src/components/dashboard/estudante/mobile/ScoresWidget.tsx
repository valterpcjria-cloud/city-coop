'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

import { RollingNumber } from '@/components/gamification/RollingNumber';

interface ScoreItemProps {
    label: string;
    value: number;
    icon: any;
    color: string;
    delay?: number;
}

function ScoreItem({ label, value, icon: Icon, color, delay = 0 }: ScoreItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="flex flex-col items-center bg-white rounded-[2rem] p-3 border border-slate-100 shadow-sm relative overflow-hidden group active:scale-95 transition-transform"
        >
            <div className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center mb-2 shadow-inner transition-colors",
                color
            )}>
                <Icon size={20} className="text-white drop-shadow-sm" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{label}</span>
            <RollingNumber
                value={value}
                className="text-lg font-black text-slate-900 tracking-tight"
                suffix="%"
            />

            {/* Tiny Progress Bar */}
            <div className="w-full h-1 bg-slate-50 rounded-full mt-2 overflow-hidden border border-slate-100/50">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", color.replace('bg-', 'bg-').split(' ')[0])}
                />
            </div>
        </motion.div>
    );
}

interface ScoresWidgetProps {
    scores?: {
        conhecimento: number;
        engajamento: number;
        colaboracao: number;
    };
}

export function ScoresWidget({ scores }: ScoresWidgetProps) {
    const data = scores || { conhecimento: 0, engajamento: 0, colaboracao: 0 };

    return (
        <div className="grid grid-cols-3 gap-3 mb-6">
            <ScoreItem
                label="Conhec."
                value={data.conhecimento}
                icon={Target}
                color="bg-city-blue"
                delay={0.1}
            />
            <ScoreItem
                label="Engaj."
                value={data.engajamento}
                icon={Zap}
                color="bg-coop-orange"
                delay={0.2}
            />
            <ScoreItem
                label="Colab."
                value={data.colaboracao}
                icon={Heart}
                color="bg-green-500"
                delay={0.3}
            />
        </div>
    );
}
