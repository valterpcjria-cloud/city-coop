import { createClient, createAdminClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/gestor/stat-card'
import { Icons } from '@/components/ui/icons'
import { getRecentAuditLogs } from '@/lib/audit'
import { ActivityList } from '@/components/dashboard/shared/activity-list'

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
        <div className="space-y-6">
            {/* Page Header */}
            <div className="animate-fade-in-up opacity-0">
                <h2 className="text-3xl font-bold tracking-tight text-gradient-brand">
                    Painel Administrativo
                </h2>
                <p className="text-tech-gray mt-1">
                    Visão geral da plataforma City Coop
                </p>
            </div>

            {/* Bento Grid Stats */}
            <div className="bento-grid">
                <StatCard
                    title="Escolas Parceiras"
                    value={schoolsCount || 0}
                    iconName="school"
                    variant="blue"
                    subtitle="Instituições ativas"
                    animationDelay={100}
                />
                <StatCard
                    title="Professores"
                    value={teachersCount || 0}
                    iconName="users"
                    variant="orange"
                    subtitle="Educadores cadastrados"
                    animationDelay={200}
                />
                <StatCard
                    title="Estudantes"
                    value={studentsCount || 0}
                    iconName="graduationCap"
                    variant="green"
                    subtitle="Alunos na plataforma"
                    animationDelay={300}
                />
                <StatCard
                    title="Eventos em Revisão"
                    value={activeEventsCount || 0}
                    iconName="calendar"
                    variant="purple"
                    subtitle="Aguardando aprovação"
                    animationDelay={400}
                />
            </div>

            {/* Activity and Status Grid */}
            <div className="grid gap-5 lg:grid-cols-7">
                {/* Recent Activity Card */}
                <div
                    className="lg:col-span-4 glass-card rounded-2xl p-6 animate-fade-in-up opacity-0"
                    style={{ animationDelay: '500ms' }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="icon-container icon-container-blue">
                            <Icons.clock className="h-5 w-5 text-city-blue" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">
                                Atividade Recente
                            </h3>
                            <p className="text-sm text-tech-gray">
                                Últimas ações na plataforma
                            </p>
                        </div>
                    </div>

                    <ActivityList activities={activities as any} />
                </div>

                {/* System Status Card */}
                <div
                    className="lg:col-span-3 glass-card rounded-2xl p-6 animate-fade-in-up opacity-0"
                    style={{ animationDelay: '600ms' }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="icon-container icon-container-green">
                            <Icons.check className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">
                                Status do Sistema
                            </h3>
                            <p className="text-sm text-tech-gray">
                                Serviços ativos
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-medium text-slate-700">
                                    Supabase Auth
                                </span>
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                                Operacional
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-medium text-slate-700">
                                    Anthropic API
                                </span>
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                                Operacional
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-medium text-slate-700">
                                    Banco de Dados
                                </span>
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                                Operacional
                            </span>
                        </div>
                    </div>

                    {/* Status Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-200/50">
                        <p className="text-xs text-tech-gray text-center">
                            Última verificação: agora
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

