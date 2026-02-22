'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Star, Sparkles } from 'lucide-react';
import React from 'react';

interface BadgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    badge: {
        title: string;
        description: string;
        icon_url?: string;
        type?: string;
    };
}

export function BadgeModal({ isOpen, onClose, badge }: BadgeModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 40 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            transition: { type: "spring", damping: 20, stiffness: 200 }
                        }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden border-4 border-city-blue/10"
                    >
                        {/* Radial Light Rays Animation */}
                        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_0deg,rgb(74,144,217,0.4)_45deg,transparent_90deg,rgb(245,166,35,0.4)_135deg,transparent_180deg)] blur-3xl opacity-30"
                            />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
                            >
                                <X size={20} />
                            </button>

                            {/* Badge Icon Container */}
                            <div className="relative mb-6">
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-city-blue to-coop-orange p-1 shadow-xl relative z-10"
                                >
                                    <div className="w-full h-full bg-white rounded-[2.3rem] flex items-center justify-center overflow-hidden">
                                        <Trophy size={64} className="text-coop-orange" />
                                    </div>
                                </motion.div>

                                {/* Orbiting Stars */}
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 z-20 pointer-events-none"
                                >
                                    <Star size={16} className="text-coop-orange absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-coop-orange" />
                                    <Star size={12} className="text-city-blue absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 fill-city-blue" />
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                            >
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Sparkles size={16} className="text-coop-orange" />
                                    <span className="text-[10px] font-black text-city-blue uppercase tracking-widest">Nova Conquista</span>
                                    <Sparkles size={16} className="text-coop-orange" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-3">{badge.title}</h2>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed px-4 mb-8">
                                    {badge.description}
                                </p>
                            </motion.div>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm tracking-wider shadow-lg active:bg-black transition-colors"
                            >
                                INCRÍVEL!
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
