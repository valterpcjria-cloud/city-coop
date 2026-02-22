'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Bot,
    User,
    ArrowLeft,
    Sparkles,
    Target,
    Zap,
    Heart
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface DotMessage {
    id?: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content?: string;
    text?: string;
    parts?: any[];
}

interface StudentMobileChatProps {
    messages: DotMessage[];
    isLoading: boolean;
    onSendMessage: (content: string) => Promise<void>;
    studentScores?: {
        conhecimento: number;
        engajamento: number;
        colaboracao: number;
        xp: number;
        level: number;
    };
    nextMission?: string;
}

const QUICK_CHIPS = [
    { label: "Como subo minha Colaboração?", icon: Heart },
    { label: "Resuma minha próxima missão", icon: Target },
    { label: "Dicas para engajamento", icon: Zap },
    { label: "O que é cooperativismo?", icon: Sparkles },
];

function Typewriter({ text, speed = 20, onComplete }: { text: string, speed?: number, onComplete?: () => void }) {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplayedText(text.substring(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(timer);
                onComplete?.();
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed, onComplete]);

    return <span>{displayedText}</span>;
}

export function StudentMobileChat({
    messages = [],
    isLoading,
    onSendMessage,
    studentScores,
    nextMission
}: StudentMobileChatProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (content: string) => {
        if (!content.trim() || isLoading) return;
        setInput('');
        await onSendMessage(content);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    // Helper to get text content from potentially mixed message types
    const getMessageText = (msg: DotMessage) => {
        if (msg.parts && msg.parts.length > 0) {
            return msg.parts.filter(p => p.type === 'text').map(p => p.text).join(' ');
        }
        return msg.content || msg.text || '';
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-50 w-full relative overflow-hidden pb-safe">
            {/* Immersive Header */}
            <header className="px-6 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/estudante" className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-transform">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-city-blue to-city-blue-dark flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white">
                                <Bot size={22} className="animate-pulse" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 leading-none">DOT Coach</span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Conectado</span>
                        </div>
                    </div>
                </div>

                {/* Visual context indicator (Scores) */}
                <div className="hidden min-[380px]:flex items-center gap-1.5 bg-slate-100/50 px-3 py-2 rounded-2xl border border-slate-200/50">
                    <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-city-blue flex items-center justify-center border border-white shadow-sm">
                            <Target size={10} className="text-white" />
                        </div>
                        <div className="w-5 h-5 rounded-full bg-coop-orange flex items-center justify-center border border-white shadow-sm">
                            <Zap size={10} className="text-white" />
                        </div>
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border border-white shadow-sm">
                            <Heart size={10} className="text-white" />
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500">{studentScores?.xp || 0} XP</span>
                </div>
            </header>

            {/* Chat Content */}
            <main className="flex-1 overflow-y-auto px-4 pt-6 pb-32 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center text-center mt-8 px-6"
                        >
                            <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center mb-6 border border-slate-100">
                                <Sparkles size={36} className="text-coop-orange animate-bounce" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mb-2">Olá, sou o DOT!</h2>
                            <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                Seu mestre cooperativista. Analisei seus scores e posso te ajudar a subir de nível. O que deseja saber?
                            </p>
                        </motion.div>
                    )}

                    {messages.map((msg, idx) => (
                        <motion.div
                            key={msg.id || idx}
                            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            className={`flex mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={cn(
                                "flex max-w-[85%] gap-2",
                                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}>
                                <div className={cn(
                                    "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white mt-auto",
                                    msg.role === 'user' ? "bg-slate-200 text-slate-600" : "bg-city-blue text-white"
                                )}>
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className={cn(
                                    "px-5 py-3.5 rounded-[1.5rem] shadow-sm text-[15px] font-medium leading-relaxed",
                                    msg.role === 'user'
                                        ? "bg-gradient-to-br from-city-blue to-city-blue-dark text-white rounded-br-none"
                                        : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                                )}>
                                    {msg.role === 'assistant' && idx === messages.length - 1 ? (
                                        <Typewriter text={getMessageText(msg)} onComplete={scrollToBottom} />
                                    ) : (
                                        getMessageText(msg)
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-start mb-6"
                        >
                            <div className="flex gap-2 items-center px-5 py-4 bg-white border border-slate-100 rounded-[1.5rem] rounded-bl-none shadow-sm">
                                <div className="flex gap-1.5 items-center">
                                    <span className="w-1.5 h-1.5 bg-city-blue/40 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-city-blue/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-1.5 h-1.5 bg-city-blue rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Pensando...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </main>

            {/* Sticky Input Area */}
            <footer className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pointer-events-none z-30">
                <div className="max-w-4xl mx-auto space-y-4 pointer-events-auto">
                    {/* Suggestion Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-2 px-2">
                        {QUICK_CHIPS.map((chip, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSend(chip.label)}
                                className="whitespace-nowrap flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/50 shadow-sm text-xs font-bold text-slate-600 hover:border-city-blue active:bg-city-blue/5 transition-all shrink-0"
                            >
                                <chip.icon size={14} className="text-coop-orange" />
                                {chip.label}
                            </motion.button>
                        ))}
                    </div>

                    {/* Input Field */}
                    <div className="flex items-end gap-2 bg-white p-2 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-slate-100">
                        <div className="flex-1 min-h-[48px] max-h-[120px] flex items-center px-4">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Tire uma dúvida com o DOT Coach..."
                                className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-300"
                                rows={1}
                            />
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSend(input)}
                            disabled={!input.trim() || isLoading}
                            className="w-12 h-12 rounded-[1.25rem] bg-city-blue text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:bg-slate-200 shadow-lg shadow-city-blue/20 transition-all active:rotate-12"
                        >
                            <Send size={20} className="-mr-0.5 mt-0.5" />
                        </motion.button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
