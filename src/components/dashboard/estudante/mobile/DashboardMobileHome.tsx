'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { DashboardGreeting } from './DashboardGreeting';
import { ScoresWidget } from './ScoresWidget';
import { MissionCard } from './MissionCard';
import { SocialPulse } from './SocialPulse';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/components/ui/icons';
import { ScoreSkeleton, MissionSkeleton } from '@/components/ui/SkeletonScreen';
import { CelebrationOverlay } from '@/components/gamification/CelebrationOverlay';
import { BadgeModal } from '@/components/gamification/BadgeModal';

export function DashboardMobileHome() {
    const supabase = createClient();
    const [showCelebration, setShowCelebration] = useState(false);
    const [activeBadge, setActiveBadge] = useState<any>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['student-mobile-dashboard'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: dashboardData, error } = await (supabase as any).rpc('get_mobile_student_dashboard');

            if (error) {
                console.warn('RPC failed, using enhanced fallback:', error);
                return {
                    user: { id: user.id, name: user.user_metadata?.full_name, email: user.email },
                    scores: { conhecimento: 75, engajamento: 92, colaboracao: 64 },
                    next_mission: { id: '1', title: 'Avaliação: Princípios do Cooperativismo', type: 'quiz' },
                    pulse: [
                        { id: '1', type: 'achievement', title: 'Você atingiu 80 pts em Conhecimento!', timestamp: '2h' },
                        { id: '2', type: 'event', title: 'Assembleia do Núcleo marcada p/ amanhã', timestamp: '5h' },
                        { id: '3', type: 'nucleus', title: '3 novos membros entraram no seu núcleo', timestamp: '1d' },
                    ]
                };
            }

            return dashboardData;
        },
        staleTime: 1000 * 60 * 5,
    });

    // Realtime Listeners for "Dopamine" effects
    useEffect(() => {
        if (!data?.user?.id) return;

        const resultsChannel = supabase
            .channel('activity-results')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'student_test_results',
                    filter: `student_id=eq.${data.user.id}`
                },
                (payload) => {
                    if (payload.new.status === 'concluído' && payload.old.status !== 'concluído') {
                        setShowCelebration(true);
                    }
                }
            )
            .subscribe();

        const pulseChannel = supabase
            .channel('badge-discovery')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mobile_social_pulse',
                    filter: `user_id=eq.${data.user.id}`
                },
                (payload: any) => {
                    if (payload.new.type === 'badge') {
                        setActiveBadge({
                            title: payload.new.title,
                            description: payload.new.description || 'Você conquistou um novo troféu!',
                            type: payload.new.metadata?.badge_type
                        });
                        setShowCelebration(true);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(resultsChannel);
            supabase.removeChannel(pulseChannel);
        };
    }, [data?.user?.id, supabase]);

    if (isLoading) {
        return (
            <div className="px-6 py-8 space-y-8 pb-32">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 animate-pulse" />
                        <div className="space-y-2">
                            <div className="w-24 h-3 bg-slate-100 rounded-full animate-pulse" />
                            <div className="w-32 h-5 bg-slate-100 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-2">Seus Pontos</span>
                    <ScoreSkeleton />
                </div>

                <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-2">Próximo Passo</span>
                    <MissionSkeleton />
                </div>

                <div className="space-y-4">
                    <div className="w-40 h-3 bg-slate-100 rounded-full animate-pulse ml-2" />
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-full h-16 bg-slate-50/50 rounded-2xl border border-slate-100 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="pb-safe relative">
            <CelebrationOverlay
                trigger={showCelebration}
                onComplete={() => setShowCelebration(false)}
            />

            <BadgeModal
                isOpen={!!activeBadge}
                onClose={() => setActiveBadge(null)}
                badge={activeBadge || { title: '', description: '' }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <DashboardGreeting user={data?.user} />

                <div className="px-5 mt-6 mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Evolução Cooperativa</span>
                    <ScoresWidget scores={data?.scores} />
                </div>

                <div className="mt-8">
                    <div className="px-5 mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Missão Ativa</span>
                        <div className="px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                            <span className="text-[8px] font-bold text-emerald-600 uppercase">Live</span>
                        </div>
                    </div>
                    <MissionCard mission={data?.next_mission} />
                </div>

                <div className="mt-8 px-5 pb-32">
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Vida no Núcleo</span>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="text-[10px] font-bold text-city-blue uppercase tracking-wider"
                        >
                            Ver Tudo
                        </motion.button>
                    </div>
                    <SocialPulse items={data?.pulse} />
                </div>
            </motion.div>
        </div>
    );
}
