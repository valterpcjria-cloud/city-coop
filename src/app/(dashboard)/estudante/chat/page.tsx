'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { StudentMobileChat } from '@/components/ia/StudentMobileChat';
import { Icons } from '@/components/ui/icons';
import { toast } from 'sonner';
import { useChat } from '@ai-sdk/react';

export default function ChatPage() {
    const supabase = createClient();
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

    // Fetch dashboard data for context
    const { data: dashboard, isLoading: isLoadingContext } = useQuery({
        queryKey: ['student-context-for-chat'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Try to get dashboard data for context
            const { data, error } = await (supabase as any).rpc('get_mobile_student_dashboard');
            if (error) {
                console.warn('Context RPC failed:', error);
                return {
                    scores: { conhecimento: 50, engajamento: 50, colaboracao: 50 },
                    xp: 0,
                    level: 1,
                    next_mission: null
                };
            }
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    const {
        messages = [],
        status,
        setMessages,
        sendMessage
    } = useChat({
        api: '/api/chat',
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: 'Olá! Sou o seu DOT Assistente cooperativista. Estou aqui para te ajudar em suas missões e atividades. Como posso ajudar?'
            } as any
        ],
        onError: (error: Error) => {
            console.error("useChat onError API event:", error);
            toast.error(`Erro: ${error.message || 'Falha na conexão com a IA'}`);
        }
    } as any);

    const isLoadingChat = status === 'streaming';

    // Initialize or get recent session from the unified endpoint
    useEffect(() => {
        const loadInitialHistory = async () => {
            try {
                const res = await fetch('/api/ai/history');
                if (!res.ok) throw new Error('Failed to fetch history');
                const data = await res.json();
                if (data && data.id) {
                    setCurrentConversationId(data.id);
                    if (data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                    }
                } else {
                    setCurrentConversationId('new');
                }
            } catch (err) {
                console.error("Failed to load chat history", err);
                setCurrentConversationId('new');
            }
        };

        loadInitialHistory();
    }, [setMessages]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isLoadingChat) return;

        // Custom payload attached strictly to the send
        if (sendMessage) {
            await sendMessage({ text: content } as any, {
                body: {
                    conversationId: currentConversationId === 'new' ? null : currentConversationId,
                    model: 'gpt',
                    webSearch: false
                }
            });
        }
    };

    if (isLoadingContext || !currentConversationId) {
        return (
            <div className="flex flex-col items-center justify-center h-[100dvh] bg-slate-50 gap-4">
                <div className="relative">
                    <Icons.spinner className="h-10 w-10 animate-spin text-city-blue" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-coop-orange rounded-full animate-ping" />
                    </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Iniciando DOT Coach...</p>
            </div>
        );
    }

    return (
        <StudentMobileChat
            messages={messages}
            isLoading={isLoadingChat}
            onSendMessage={handleSendMessage}
            studentScores={dashboard?.scores ? {
                ...dashboard.scores,
                xp: dashboard.xp || 0,
                level: dashboard.level || 1
            } : undefined}
            nextMission={dashboard?.next_mission?.title}
        />
    );
}
