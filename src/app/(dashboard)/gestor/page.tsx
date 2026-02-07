import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'

export default async function GestorOverviewPage() {
    const supabase = await createClient()
    const adminAuth = await createAdminClient()

    // Fetch Platform Stats
    const { count: schoolsCount } = await adminAuth.from('schools').select('*', { count: 'exact', head: true })
    const { count: teachersCount } = await adminAuth.from('teachers').select('*', { count: 'exact', head: true })
    const { count: studentsCount } = await adminAuth.from('students').select('*', { count: 'exact', head: true })
    const { count: activeEventsCount } = await adminAuth.from('event_plans').select('*', { count: 'exact', head: true }).eq('status', 'submitted')

    const stats = [
        {
            title: 'Escolas Parceiras',
            value: schoolsCount || 0,
            icon: Icons.bookOpen,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            title: 'Professores',
            value: teachersCount || 0,
            icon: Icons.user,
            color: 'text-orange-600',
            bg: 'bg-orange-100'
        },
        {
            title: 'Estudantes',
            icon: Icons.graduationCap,
            value: studentsCount || 0,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            title: 'Eventos em Revisão',
            value: activeEventsCount || 0,
            icon: Icons.calendar,
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-city-blue">Painel Administrativo</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-tech-gray">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Atividade Recente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-tech-gray">
                            Próximos passos: Implementar listagem de solicitações pendentes e log de auditoria.
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Status do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-sm font-medium">Supabase Auth: Operacional</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-sm font-medium">Anthropic API: Operacional</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-sm font-medium">Bando de Dados: Operacional</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
