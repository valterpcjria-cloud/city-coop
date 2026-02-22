'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Bell } from 'lucide-react';

interface DashboardGreetingProps {
    user?: { name: string; email: string; image?: string; nucleus?: string | null };
}

export function DashboardGreeting({ user }: DashboardGreetingProps) {
    const firstName = user?.name?.split(' ')[0] || 'Estudante';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    return (
        <div className="flex items-center justify-between px-2 pt-2 mb-6">
            <div className="flex items-center gap-3">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-city-blue to-city-blue-dark flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white">
                        {user?.image ? (
                            <img src={user.image} alt={firstName} className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle size={28} />
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-50" />
                </motion.div>

                <div className="flex flex-col">
                    <motion.p
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="text-xs font-bold text-slate-400 uppercase tracking-widest"
                    >
                        {greeting}
                    </motion.p>
                    <motion.h1
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl font-black text-slate-900 leading-tight"
                    >
                        {firstName} <span className="text-coop-orange">!</span>
                    </motion.h1>
                </div>
            </div>

            <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100 relative"
            >
                <Bell size={20} />
                <div className="absolute top-2.5 right-3 w-2 h-2 bg-coop-orange rounded-full border border-white" />
            </motion.button>
        </div>
    );
}
