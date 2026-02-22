'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { StudentMobileChat } from '@/components/ia/StudentMobileChat';
import { Icons } from '@/components/ui/icons';
import { toast } from 'sonner';

export default function ChatPage() {
    const supabase = createClient();
    const [sessionId, setSessionId] = useState<string | null>(null);

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

    // Initialize or get recent session
    useEffect(() => {
        const initChat = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Simple check for existing session for simpler mobile UX
                const { data: existingSession } = await (supabase as any)
                    .from('dot_chat_sessions')
                    .select('id')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (existingSession) {
                    setSessionId(existingSession.id);
                } else {
                    // Create new session
                    const { data: newSession, error } = await (supabase as any)
                        .from('dot_chat_sessions')
                        .insert({
                            user_id: user.id,
                            title: 'Nova Conversa Coach',
                            metadata: {
                                scores_at_start: dashboard?.scores,
                                context_target: 'student'
                            }
                        })
                        .select()
                        .single();

                    if (error) throw error;
                    setSessionId(newSession.id);
                }
            } catch (err) {
                console.error("Failed to init chat session", err);
                toast.error("Erro ao carregar seu assistente DOT.");
            }
        };

        if (dashboard) {
            initChat();
        }
    }, [dashboard, supabase]);

    if (isLoadingContext || !sessionId) {
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
            sessionId={sessionId}
            studentScores={dashboard?.scores ? {
                ...dashboard.scores,
                xp: dashboard.xp || 0,
                level: dashboard.level || 1
            } : undefined}
            nextMission={dashboard?.next_mission?.title}
        />
    );
}
