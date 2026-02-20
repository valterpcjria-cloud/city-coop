"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Conversation {
    id: string;
    title: string;
    updated_at: string;
}

interface ChatHistorySidebarProps {
    currentConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    isOpen: boolean;
    onToggle: () => void;
    refreshTrigger?: number;
}

export function ChatHistorySidebar({
    currentConversationId,
    onSelectConversation,
    onNewChat,
    isOpen,
    onToggle,
    refreshTrigger = 0
}: ChatHistorySidebarProps) {
    const [history, setHistory] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/ai/history/list");
            const data = await res.json();
            if (Array.isArray(data)) {
                setHistory(data);
            }
        } catch (err) {
            console.error("Failed to fetch history list", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen || refreshTrigger > 0) {
            fetchHistory();
        }
    }, [isOpen, refreshTrigger]);

    // Group history by date
    const groupHistory = () => {
        const groups: Record<string, Conversation[]> = {
            "Hoje": [],
            "Ontem": [],
            "Anteriores": []
        };

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        history.forEach(item => {
            const date = new Date(item.updated_at);
            if (date.toDateString() === today.toDateString()) {
                groups["Hoje"].push(item);
            } else if (date.toDateString() === yesterday.toDateString()) {
                groups["Ontem"].push(item);
            } else {
                groups["Anteriores"].push(item);
            }
        });

        return groups;
    };

    const groupedHistory = groupHistory();

    return (
        <div className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-0",
            !isOpen && "-translate-x-full"
        )}>
            <div className="flex flex-col h-full p-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Icons.messageSquare className="h-4 w-4" />
                        Histórico
                    </h3>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggle}>
                        <Icons.x className="h-4 w-4" />
                    </Button>
                </div>

                <Button
                    onClick={() => {
                        onNewChat();
                        if (window.innerWidth < 1024) onToggle();
                    }}
                    className="w-full mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md border-0"
                >
                    <Icons.plus className="h-4 w-4 mr-2" />
                    Nova Conversa
                </Button>

                <ScrollArea className="flex-1 -mx-4 px-4">
                    {isLoading ? (
                        <div className="space-y-3 py-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-10 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedHistory).map(([label, items]) => (
                                items.length > 0 && (
                                    <div key={label} className="space-y-2">
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">{label}</h4>
                                        <div className="space-y-1">
                                            {items.map(chat => (
                                                <button
                                                    key={chat.id}
                                                    onClick={() => {
                                                        onSelectConversation(chat.id);
                                                        if (window.innerWidth < 1024) onToggle();
                                                    }}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all truncate",
                                                        currentConversationId === chat.id
                                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    )}
                                                >
                                                    {chat.title || "Sem título"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}

                            {history.length === 0 && (
                                <p className="text-xs text-center text-slate-400 py-10">Nenhuma conversa encontrada.</p>
                            )}
                        </div>
                    )}
                </ScrollArea>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-center text-slate-400">Versão DOT 2.5</p>
                </div>
            </div>
        </div>
    );
}
