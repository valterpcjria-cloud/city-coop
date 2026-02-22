'use client';

import { useState, useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { sendDotMessage } from '@/app/actions/chat';
import { Send, Bot, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface DotMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at?: string;
}

interface DotMobileChatProps {
    sessionId: string;
    initialMessages?: DotMessage[];
}

export function DotMobileChat({ sessionId, initialMessages = [] }: DotMobileChatProps) {
    const [messages, setMessages] = useState<DotMessage[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const supabase = getSupabaseClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Supabase Realtime subscription for assistant responses
    useEffect(() => {
        const channel = supabase
            .channel(`chat_${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'dot_messages',
                    filter: `session_id=eq.${sessionId}`,
                },
                (payload) => {
                    const newMessage = payload.new as DotMessage;
                    if (newMessage.role === 'assistant') {
                        setMessages((prev) => [...prev, newMessage]);
                        setIsTyping(false);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId, supabase]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput('');

        // Optimistic UI update
        setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), role: 'user' as const, content: userMsg },
        ]);
        setIsTyping(true);

        try {
            await sendDotMessage(sessionId, userMsg, 'user');
            // The DOT API handler saves the assistant response to DB,
            // and the Realtime subscription above will update the UI.
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-50 w-full relative md:h-[calc(100vh-2rem)] md:rounded-xl md:border md:border-slate-200 overflow-hidden">
            {/* Chat Header */}
            <header className="flex items-center justify-between px-4 h-14 bg-white border-b border-slate-200 shrink-0 z-10 sticky top-0">
                <div className="flex items-center space-x-3">
                    <Link
                        href="/professor/ia"
                        className="p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-full md:hidden"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-city-blue to-coop-orange flex items-center justify-center text-white">
                            <Bot size={16} />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-slate-800 leading-tight">DOT Assistente</h1>
                            <p className="text-[10px] text-emerald-600 font-medium">Online</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`flex max-w-[85%] space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                                }`}
                        >
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-auto ${msg.role === 'user'
                                        ? 'bg-slate-200 text-slate-600'
                                        : 'bg-city-blue text-white'
                                    }`}
                            >
                                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                            </div>
                            <div
                                className={`p-3 rounded-2xl text-[15px] shadow-sm ${msg.role === 'user'
                                        ? 'bg-city-blue text-white rounded-br-sm'
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex max-w-[85%] space-x-2 flex-row">
                            <div className="w-6 h-6 rounded-full bg-city-blue text-white flex items-center justify-center shrink-0 mt-auto">
                                <Bot size={12} />
                            </div>
                            <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm text-slate-400 flex space-x-1 items-center">
                                <span className="animate-bounce">●</span>
                                <span className="animate-bounce delay-100">●</span>
                                <span className="animate-bounce delay-200">●</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} className="h-1" />
            </main>

            {/* Input Footer */}
            <footer className="bg-white border-t border-slate-200 p-3 pb-safe shrink-0 mt-auto shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex items-end space-x-2">
                    <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 focus-within:border-city-blue focus-within:bg-white transition-colors overflow-hidden flex items-center min-h-[44px]">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Fale com o DOT..."
                            className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-sm max-h-[120px] min-h-[44px] scrollbar-hide outline-none"
                            rows={1}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="w-11 h-11 rounded-full bg-city-blue text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:bg-slate-300 transition-colors active:scale-95"
                    >
                        <Send size={18} className="ml-0.5" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
