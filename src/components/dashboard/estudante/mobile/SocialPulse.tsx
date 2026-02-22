'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageCircle, Calendar, Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PulseItem {
    id: string;
    type: 'event' | 'achievement' | 'message' | 'nucleus';
    title: string;
    timestamp: string;
}

const icons = {
    event: Calendar,
    achievement: Trophy,
    message: MessageCircle,
    nucleus: Users,
};

const colors = {
    event: 'text-city-blue bg-city-blue/10',
    achievement: 'text-coop-orange bg-coop-orange/10',
    message: 'text-indigo-500 bg-indigo-500/10',
    nucleus: 'text-green-500 bg-green-500/10',
};

export function SocialPulse({ items }: { items?: PulseItem[] }) {
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => setIsMounted(true), []);

    // Mock data if none provided
    const pulseItems = items || [
        { id: '1', type: 'achievement', title: 'Você atingiu 80 pts em Conhecimento!', timestamp: '2h' },
        { id: '2', type: 'event', title: 'Assembleia do Núcleo marcada p/ amanhã', timestamp: '5h' },
        { id: '3', type: 'nucleus', title: '3 novos membros entraram no seu núcleo', timestamp: '1d' },
    ] as PulseItem[];

    if (!isMounted) {
        return (
            <div className="space-y-4">
                <div className="h-6 w-32 bg-slate-100 rounded-lg animate-pulse ml-2" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-slate-50 rounded-3xl border border-slate-100 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
                    <Sparkles size={16} className="text-coop-orange" />
                    Social Pulse
                </h3>
                <button className="text-[10px] font-bold text-city-blue uppercase tracking-widest active:opacity-50 transition-opacity">
                    Ver Tudo
                </button>
            </div>

            <div className="space-y-3">
                {pulseItems.map((item, index) => {
                    const Icon = icons[item.type];
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-transform shadow-sm"
                        >
                            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", colors[item.type])}>
                                <Icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-700 leading-snug line-clamp-1">
                                    {item.title}
                                </p>
                                <span className="text-[10px] font-medium text-slate-400">Há {item.timestamp}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
