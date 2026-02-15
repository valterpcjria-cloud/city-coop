import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function ProfessorDashboardPage() {
    const supabase = await createClient()
    const adminAuth = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Get Teacher Profile and initial counts in parallel
    const { data: teacher } = await adminAuth
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single() as any

    // Fetch classes and initial status count
    const [classesRes, teacherClassesRes] = await Promise.all([
        adminAuth
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('teacher_id', teacher?.id)
            .eq('status', 'active'),
        teacher ? adminAuth.from('classes').select('id').eq('teacher_id', teacher.id) : Promise.resolve({ data: [] })
    ])

    const classesCount = classesRes.count
    const classIds = (teacherClassesRes.data as any[])?.map(c => c.id) || []

    // Fetch student count if classes exist
    const { count: realStudentsCount } = classIds.length > 0
        ? await adminAuth
            .from('class_students')
            .select('*', { count: 'exact', head: true })
            .in('class_id', classIds)
        : { count: 0 }

    return (
        <div className="space-y-6">
            {/* Header with Brand Gradient */}
            <div className="flex items-center justify-between p-6 -m-6 mb-0 bg-gradient-to-r from-[#4A90D9]/10 via-white to-[#F5A623]/10 border-b border-tech-gray/10">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-city-blue">Visão Geral</h2>
                    <p className="text-tech-gray">Bem-vindo ao City Coop. Acompanhe suas turmas e atividades.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-gradient-to-r from-city-blue to-city-blue-dark hover:from-city-blue-dark hover:to-city-blue text-white shadow-lg transition-all duration-200" asChild>
                        <Link href="/professor/turmas/nova">
                            <Icons.add className="mr-2 h-4 w-4" />
                            Nova Turma
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card glass className="border-l-4 border-l-city-blue hover:-translate-y-1 group transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-tech-gray">Turmas Ativas</CardTitle>
                        <div className="p-2 rounded-full bg-city-blue/10 group-hover:bg-city-blue/20 transition-colors">
                            <Icons.menu className="h-4 w-4 text-city-blue" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-city-blue">{classesCount || 0}</div>
                        <p className="text-xs text-tech-gray">
                            Turmas sob sua coordenação
                        </p>
                    </CardContent>
                </Card>
                <Card glass className="border-l-4 border-l-coop-orange hover:-translate-y-1 group transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-tech-gray">Estudantes</CardTitle>
                        <div className="p-2 rounded-full bg-coop-orange/10 group-hover:bg-coop-orange/20 transition-colors">
                            <Icons.user className="h-4 w-4 text-coop-orange" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-coop-orange">{realStudentsCount || 0}</div>
                        <p className="text-xs text-tech-gray">
                            Total de alunos matriculados
                        </p>
                    </CardContent>
                </Card>
                <Card glass className="border-l-4 border-l-tech-gray hover:-translate-y-1 group transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-tech-gray">Avaliações Pendentes</CardTitle>
                        <div className="p-2 rounded-full bg-tech-gray/10 group-hover:bg-tech-gray/20 transition-colors">
                            <Icons.check className="h-4 w-4 text-tech-gray" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-tech-gray">0</div>
                        <p className="text-xs text-tech-gray">
                            Aguardando correção
                        </p>
                    </CardContent>
                </Card>
                <Card glass className="border-l-4 border-l-green-500 hover:-translate-y-1 group transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-tech-gray">Eventos Aprovados</CardTitle>
                        <div className="p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                            <Icons.calendar className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">0</div>
                        <p className="text-xs text-tech-gray">
                            Prontos para execução
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card glass className="col-span-4 hover:shadow-xl transition-all">
                    <CardHeader className="border-b border-tech-gray/10 bg-gradient-to-r from-city-blue/5 to-transparent">
                        <CardTitle className="text-city-blue">Turmas Recentes</CardTitle>
                        <CardDescription className="text-tech-gray">
                            Você não tem turmas ativas no momento.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-gradient-to-br from-city-blue/10 to-coop-orange/10 p-5 rounded-full mb-4 animate-in zoom-in duration-500">
                                <Icons.menu className="h-10 w-10 text-city-blue" />
                            </div>
                            <h3 className="font-semibold text-lg text-city-blue mb-1">Nenhuma turma encontrada</h3>
                            <p className="text-tech-gray mb-6 max-w-sm">
                                Comece criando sua primeira turma para gerenciar os estudantes e suas cooperativas.
                            </p>
                            <Button className="bg-coop-orange hover:bg-coop-orange-dark text-white shadow-md hover:scale-105 transition-transform" asChild>
                                <Link href="/professor/turmas/nova">
                                    <Icons.add className="mr-2 h-4 w-4" />
                                    Criar minha primeira turma
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card glass className="col-span-3 hover:shadow-xl transition-all">
                    <CardHeader className="border-b border-tech-gray/10 bg-gradient-to-r from-coop-orange/5 to-transparent">
                        <CardTitle className="text-coop-orange font-bold">Atividades Recentes</CardTitle>
                        <CardDescription className="text-tech-gray">
                            Últimas ações realizadas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-city-blue/20 to-coop-orange/20 flex items-center justify-center mr-4">
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-city-blue to-coop-orange" />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="h-4 bg-tech-gray/10 rounded w-3/4 animate-pulse" />
                                        <div className="h-3 bg-tech-gray/5 rounded w-1/2 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
