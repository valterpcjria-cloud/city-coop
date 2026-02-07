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

    const { data: teacher } = await adminClient
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single() as any

    if (!teacher) return null

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
            {/* Header with Brand Gradient */}
            <div className="flex items-center justify-between p-6 -m-6 mb-0 bg-gradient-to-r from-[#4A90D9]/10 via-white to-[#F5A623]/10 border-b border-[#6B7C93]/10">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#4A90D9]">Avaliações</h2>
                    <p className="text-[#6B7C93]">Monitore o desempenho e a participação dos alunos em todas as suas turmas.</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-white border-[#4A90D9]/20 shadow-md overflow-hidden group hover:shadow-lg transition-all">
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8]" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-[#6B7C93]">Total de Avaliações</CardTitle>
                        <div className="p-2.5 bg-[#4A90D9]/10 rounded-xl group-hover:bg-[#4A90D9]/20 transition-colors">
                            <Icons.check className="h-5 w-5 text-[#4A90D9]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-[#4A90D9]">{totalAssessments}</div>
                        <p className="text-xs text-[#6B7C93] mt-1">Criadas em todas as turmas</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-[#F5A623]/20 shadow-md overflow-hidden group hover:shadow-lg transition-all">
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#F5A623] to-[#E09000]" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-[#6B7C93]">Participação Global</CardTitle>
                        <div className="p-2.5 bg-[#F5A623]/10 rounded-xl group-hover:bg-[#F5A623]/20 transition-colors">
                            <Icons.user className="h-5 w-5 text-[#F5A623]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-[#F5A623]">{globalParticipation}%</div>
                        <div className="w-full bg-[#6B7C93]/10 h-2 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-[#F5A623] to-[#E09000] h-full rounded-full transition-all duration-500"
                                style={{ width: `${globalParticipation}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {assessments.length === 0 ? (
                <Card className="shadow-md border-dashed border-[#6B7C93]/30 bg-[#4A90D9]/5">
                    <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#6B7C93]/10 mb-6">
                            <Icons.check className="h-10 w-10 text-[#6B7C93]/30" />
                        </div>
                        <h3 className="font-bold text-xl text-[#4A90D9] mb-2">Nenhuma avaliação encontrada</h3>
                        <p className="text-[#6B7C93] max-w-sm mb-6">
                            Crie avaliações dentro de suas turmas para começar a monitorar o progresso dos alunos.
                        </p>
                        <Button variant="brand" asChild>
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
                            <Card key={assessment.id} className="group hover:shadow-xl transition-all duration-300 border-[#6B7C93]/15 overflow-hidden">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#4A90D9]/10 text-[#4A90D9] border border-[#4A90D9]/20">
                                                    {assessment.classes.name}
                                                </span>
                                                <Badge variant="secondary" className="font-bold uppercase tracking-wider text-[10px] bg-[#6B7C93]/10 text-[#6B7C93]">
                                                    {typeLabels[assessment.type] || assessment.type}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-2xl font-black text-[#1a2332] group-hover:text-[#4A90D9] transition-colors">
                                                {assessment.title}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 font-medium text-[#6B7C93]">
                                                <Icons.calendar className="h-4 w-4 text-[#4A90D9]" />
                                                Criado em {format(new Date(assessment.created_at), "dd 'de' MMMM", { locale: ptBR })}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-bold text-[#6B7C93] uppercase tracking-widest text-[10px]">Participação dos Alunos</span>
                                            <span className="font-bold text-[#1a2332]">{participationCount}/{totalStudents} ({participationRate}%)</span>
                                        </div>
                                        <div className="w-full bg-[#6B7C93]/10 h-3 rounded-full overflow-hidden border border-[#6B7C93]/10">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    participationRate > 80 ? "bg-gradient-to-r from-green-500 to-green-400" :
                                                        participationRate > 40 ? "bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8]" : "bg-gradient-to-r from-[#F5A623] to-[#E09000]"
                                                )}
                                                style={{ width: `${participationRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-gradient-to-r from-[#4A90D9]/5 to-[#F5A623]/5 flex justify-end gap-3 py-4 border-t border-[#6B7C93]/10">
                                    <Button variant="ghost" className="font-bold text-[#6B7C93] hover:text-[#4A90D9] hover:bg-[#4A90D9]/10" asChild>
                                        <Link href={`/professor/turmas/${assessment.classes.id}/avaliacoes/${assessment.id}?tab=content`}>
                                            Ver Detalhes
                                        </Link>
                                    </Button>
                                    <Button variant="brand" className="shadow-lg shadow-[#4A90D9]/20" asChild>
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
