import { createClient, createAdminClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/gestor/stat-card'
import { Icons } from '@/components/ui/icons'
import { getRecentAuditLogs } from '@/lib/audit'
import { ActivityList } from '@/components/dashboard/shared/activity-list'
import { AnimatedContainer } from '@/components/dashboard/shared/animated-container'
import { Button } from '@/components/ui/button'

export default async function GestorOverviewPage() {
    const supabase = await createClient()
    const adminAuth = await createAdminClient()

    // Fetch Platform Stats and Activities in parallel
    const [
        { count: schoolsCount },
        { count: teachersCount },
        { count: studentsCount },
        { count: activeEventsCount },
        activities
    ] = await Promise.all([
        adminAuth.from('schools').select('*', { count: 'exact', head: true }),
        adminAuth.from('teachers').select('*', { count: 'exact', head: true }),
        adminAuth.from('students').select('*', { count: 'exact', head: true }),
        adminAuth.from('event_plans').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
        getRecentAuditLogs(5)
    ])

    return (
        <div className="space-y-10">
            {/* Page Header */}
            <AnimatedContainer direction="right" className="flex flex-col gap-1">
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    Visão Geral do <span className="text-blue-600 dark:text-blue-400">Ecossistema</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Monitoramento em tempo real da rede City Coop.
                </p>
            </AnimatedContainer>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Escolas Parceiras"
                    value={schoolsCount || 0}
                    iconName="school"
                    variant="blue"
                    subtitle="Instituições ativas"
                    animationDelay={100}
                />
                <StatCard
                    title="Docentes"
                    value={teachersCount || 0}
                    iconName="users"
                    variant="orange"
                    subtitle="Educadores cadastrados"
                    animationDelay={200}
                />
                <StatCard
                    title="Comunidade Estudantil"
                    value={studentsCount || 0}
                    iconName="graduationCap"
                    variant="green"
                    subtitle="Alunos engajados"
                    animationDelay={300}
                />
                <StatCard
                    title="Demandas Pendentes"
                    value={activeEventsCount || 0}
                    iconName="calendar"
                    variant="purple"
                    subtitle="Eventos em revisão"
                    animationDelay={400}
                />
            </div>

            {/* Activity and Status Grid */}
            <div className="grid gap-8 lg:grid-cols-12 items-start">
                {/* Recent Activity Card */}
                <AnimatedContainer
                    delay={5}
                    className="lg:col-span-8 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm"
                >
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Icons.clock className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                    Atividade Recente
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Histórico de ações recentes na infraestrutura.
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-full text-blue-600">Ver Tudo</Button>
                    </div>
                    <div className="p-8">
                        <ActivityList activities={activities as any} />
                    </div>
                </AnimatedContainer>

                {/* System Status Card */}
                <AnimatedContainer
                    delay={6}
                    className="lg:col-span-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm"
                >
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <Icons.check className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                Monitorização
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Saúde dos serviços.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {[
                            { name: 'Supabase Auth', status: 'Operacional' },
                            { name: 'Anthropic Claude', status: 'Operacional' },
                            { name: 'Base de Dados', status: 'Operacional' }
                        ].map((service) => (
                            <div key={service.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse active-ring" />
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        {service.name}
                                    </span>
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
                                    {service.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Status Footer */}
                    <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                            Sincronizado há 1 minuto
                        </p>
                    </div>
                </AnimatedContainer>
            </div>
        </div>
    )
}

