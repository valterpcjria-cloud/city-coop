import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const typeLabels: Record<string, string> = {
    cooperativismo: 'Cooperativismo',
    participacao: 'Participação',
    organizacao_nucleos: 'Org. Núcleos',
    planejamento_evento: 'Planejamento',
    gestao_financeira: 'Financeiro',
}

export default async function ProfessorAssessmentsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const adminClient = await createAdminClient()

    // Get teacher record
    const { data: teacher } = await adminClient
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!teacher) return null

    // Get all assessments for teacher's classes
    const { data: assessmentsData } = await adminClient
        .from('assessments')
        .select(`
            *,
            classes!inner (
                id,
                name,
                teacher_id,
                class_students(count)
            ),
            assessment_responses(count)
        `)
        .eq('classes.teacher_id', (teacher as any).id)
        .order('created_at', { ascending: false })

    const assessments = (assessmentsData || []) as any[]

    const totalAssessments = assessments.length

    // Calculate global participation rate
    let totalExpected = 0
    let totalReceived = 0

    assessments.forEach(a => {
        totalExpected += a.classes?.class_students[0]?.count || 0
        totalReceived += a.assessment_responses[0]?.count || 0
    })

    const globalParticipation = totalExpected > 0
        ? Math.round((totalReceived / totalExpected) * 100)
        : 0

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Avaliações</h2>
                    <p className="text-slate-500">Monitore o desempenho e a participação dos alunos em todas as suas turmas.</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-white/50 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden group">
                    <div className="h-1 w-full bg-blue-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total de Avaliações</CardTitle>
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <Icons.check className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{totalAssessments}</div>
                        <p className="text-xs text-slate-500 mt-1">Criadas em todas as turmas</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 backdrop-blur-sm border-indigo-200/60 shadow-sm overflow-hidden group">
                    <div className="h-1 w-full bg-indigo-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-700">Participação Global</CardTitle>
                        <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                            <Icons.user className="h-4 w-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-700">{globalParticipation}%</div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-full rounded-full"
                                style={{ width: `${globalParticipation}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {assessments.length === 0 ? (
                <Card className="shadow-sm border-dashed bg-slate-50/50">
                    <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                            <Icons.check className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 mb-2">Nenhuma avaliação encontrada</h3>
                        <p className="text-slate-500 max-w-sm mb-6">
                            Crie avaliações dentro de suas turmas para começar a monitorar o progresso dos alunos.
                        </p>
                        <Button asChild>
                            <Link href="/professor/turmas">
                                Ir para Minhas Turmas
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {assessments.map((assessment) => {
                        const participationCount = assessment.assessment_responses[0]?.count || 0
                        const totalStudents = assessment.classes?.class_students[0]?.count || 0
                        const participationRate = totalStudents > 0
                            ? Math.round((participationCount / totalStudents) * 100)
                            : 0

                        return (
                            <Card key={assessment.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200/80 overflow-hidden">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                    {assessment.classes.name}
                                                </span>
                                                <Badge variant="secondary" className="font-bold uppercase tracking-wider text-[10px] bg-slate-100 text-slate-600">
                                                    {typeLabels[assessment.type] || assessment.type}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {assessment.title}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 font-medium">
                                                <Icons.calendar className="h-4 w-4" />
                                                Criado em {format(new Date(assessment.created_at), "dd 'de' MMMM", { locale: ptBR })}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-bold text-slate-600 uppercase tracking-widest text-[10px]">Participação dos Alunos</span>
                                            <span className="font-bold text-slate-900">{participationCount}/{totalStudents} ({participationRate}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    participationRate > 80 ? "bg-green-500" :
                                                        participationRate > 40 ? "bg-blue-500" : "bg-orange-500"
                                                )}
                                                style={{ width: `${participationRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50/80 backdrop-blur-sm flex justify-end gap-3 py-4 border-t border-slate-100">
                                    <Button variant="ghost" className="font-bold text-slate-600 hover:text-blue-600" asChild>
                                        <Link href={`/professor/turmas/${assessment.classes.id}/avaliacoes/${assessment.id}?tab=content`}>
                                            Ver Detalhes
                                        </Link>
                                    </Button>
                                    <Button className="bg-slate-900 hover:bg-blue-600 text-white font-bold shadow-lg shadow-slate-200" asChild>
                                        <Link href={`/professor/turmas/${assessment.classes.id}/avaliacoes/${assessment.id}?tab=results`}>
                                            Analisar Resultados
                                            <Icons.arrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
