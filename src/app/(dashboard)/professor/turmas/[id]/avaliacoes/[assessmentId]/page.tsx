import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function AssessmentDetailsPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string; assessmentId: string }>
    searchParams: Promise<{ tab?: string }>
}) {
    const supabase = await createClient()
    const { id: classId, assessmentId } = await params
    const { tab } = await searchParams
    const defaultTab = tab === 'results' ? 'results' : 'content'

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) notFound()

    const adminClient = await createAdminClient()

    const { data: teacher } = await adminClient
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!teacher) {
        console.error('[AssessmentDetails] Teacher profile not found for user:', user.id)
        notFound()
    }

    const { data: assessment } = await adminClient
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single() as any

    if (!assessment) {
        console.error('[AssessmentDetails] Assessment not found:', assessmentId)
        notFound()
    }

    if (assessment.class_id !== classId) {
        console.error('[AssessmentDetails] Class mismatch:', { expected: classId, actual: assessment.class_id })
        notFound()
    }

    const { data: responses } = await adminClient
        .from('assessment_responses')
        .select('*, student:students(id, name, email)')
        .eq('assessment_id', assessmentId)

    const { data: allStudents } = await adminClient
        .from('class_students')
        .select('student:students(id, name, email)')
        .eq('class_id', classId)

    const studentResponses = new Map(responses?.map((r: any) => [r.student_id, r]))

    const studentStatusList = allStudents?.map((item: any) => {
        const response = studentResponses.get(item.student.id)
        return {
            student: item.student,
            status: response ? 'entregue' : 'pendente',
            score: response?.score,
            submittedAt: response?.completed_at
        }
    }) || []

    return (
        <div className="space-y-8">
            {/* Header with Brand Gradient */}
            <div className="flex items-center gap-4 p-6 -m-6 mb-0 bg-gradient-to-r from-[#4A90D9]/10 via-white to-[#F5A623]/10 border-b border-[#6B7C93]/10">
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-[#6B7C93]/20 hover:bg-[#4A90D9]/10 hover:border-[#4A90D9]/30" asChild>
                    <Link href={`/professor/turmas/${classId}`}>
                        <Icons.arrowRight className="h-4 w-4 rotate-180 text-[#4A90D9]" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black text-[#4A90D9] tracking-tight">{assessment.title}</h2>
                        <Badge variant="outline" className="font-bold uppercase tracking-wider text-[10px] bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30">
                            {assessment.type}
                        </Badge>
                    </div>
                    <p className="text-[#6B7C93] font-medium text-sm mt-1 flex items-center gap-2">
                        <Icons.calendar className="h-4 w-4 text-[#4A90D9]" />
                        Criado em {format(new Date(assessment.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
            </div>

            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md bg-[#6B7C93]/10 p-1.5 rounded-xl">
                    <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90D9] data-[state=active]:shadow-md font-bold text-xs uppercase tracking-widest px-8 rounded-lg transition-all">
                        Conteúdo
                    </TabsTrigger>
                    <TabsTrigger value="results" className="data-[state=active]:bg-white data-[state=active]:text-[#F5A623] data-[state=active]:shadow-md font-bold text-xs uppercase tracking-widest px-8 rounded-lg transition-all">
                        Resultados
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-8">
                    <div className="max-w-4xl space-y-6">
                        <Card className="border-[#4A90D9]/20 shadow-lg overflow-hidden">
                            <div className="h-1.5 w-full bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8]" />
                            <CardHeader className="bg-gradient-to-r from-[#4A90D9]/5 to-transparent flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold text-[#4A90D9]">Questões Geradas</CardTitle>
                                    <CardDescription className="font-medium text-[#6B7C93]">Total de {assessment.questions?.length || 0} questões.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" className="font-bold gap-2 border-[#4A90D9]/30 text-[#4A90D9] hover:bg-[#4A90D9]/10">
                                    <Icons.settings className="h-4 w-4" />
                                    Editar
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-8">
                                {assessment.questions && Array.isArray(assessment.questions) && assessment.questions.map((q: any, i: number) => (
                                    <div key={i} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="flex items-start gap-4">
                                            <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#4A90D9] to-[#F5A623] text-white text-sm font-black shadow-lg">
                                                {i + 1}
                                            </span>
                                            <div className="space-y-4 flex-1">
                                                <p className="font-bold text-lg text-[#1a2332] leading-snug pt-0.5">{q.text}</p>

                                                {q.type === 'multiple-choice' && q.options && (
                                                    <div className="grid gap-2">
                                                        {q.options.map((opt: string, optIdx: number) => (
                                                            <div
                                                                key={optIdx}
                                                                className={cn(
                                                                    "p-3.5 rounded-xl border text-sm transition-all flex items-center gap-3",
                                                                    q.correctAnswer === optIdx
                                                                        ? "bg-green-50 border-green-200 text-green-800 font-bold shadow-sm"
                                                                        : "bg-white border-[#6B7C93]/15 text-[#6B7C93] hover:border-[#4A90D9]/30"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black uppercase",
                                                                    q.correctAnswer === optIdx
                                                                        ? "bg-green-500 text-white"
                                                                        : "bg-[#6B7C93]/10 text-[#6B7C93]"
                                                                )}>
                                                                    {String.fromCharCode(97 + optIdx)}
                                                                </div>
                                                                <span className="flex-1">{opt}</span>
                                                                {q.correctAnswer === optIdx && (
                                                                    <Icons.check className="h-4 w-4 text-green-600" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {(q.type === 'text' || q.type === 'redacao') && (
                                                    <div className="space-y-4">
                                                        <div className="p-4 rounded-xl border border-dashed border-[#6B7C93]/30 bg-[#4A90D9]/5 text-[#6B7C93] text-sm flex items-center gap-2 italic">
                                                            <Icons.ai className="h-4 w-4 text-[#4A90D9]" />
                                                            Questão dissertativa / Redação. Resposta em formato de texto livre.
                                                        </div>
                                                        {q.answerKey && (
                                                            <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A90D9]/10 to-[#F5A623]/10 border border-[#4A90D9]/20 space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Icons.sparkles className="h-3 w-3 text-[#F5A623]" />
                                                                    <span className="text-[10px] font-bold text-[#4A90D9] uppercase tracking-wider">Gabarito / Critérios Sugeridos</span>
                                                                </div>
                                                                <p className="text-sm text-[#1a2332] leading-relaxed">{q.answerKey}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {i < assessment.questions.length - 1 && <Separator className="bg-[#6B7C93]/10" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="results" className="mt-8">
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card className="border-[#4A90D9]/20 shadow-md overflow-hidden group hover:shadow-lg transition-all">
                                <div className="h-1.5 w-full bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8]" />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-[#6B7C93]">Total de Alunos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-[#4A90D9]">{allStudents?.length || 0}</div>
                                </CardContent>
                            </Card>
                            <Card className="border-green-200 shadow-md overflow-hidden group hover:shadow-lg transition-all">
                                <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-green-400" />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-[#6B7C93]">Entregues</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-green-600">
                                        {responses?.length || 0}
                                    </div>
                                    <p className="text-xs font-bold text-[#6B7C93] mt-1">
                                        {allStudents?.length ? Math.round(((responses?.length || 0) / allStudents.length) * 100) : 0}% da turma
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-[#F5A623]/20 shadow-md overflow-hidden group hover:shadow-lg transition-all">
                                <div className="h-1.5 w-full bg-gradient-to-r from-[#F5A623] to-[#E09000]" />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-[#6B7C93]">Média da Turma</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-[#F5A623]">
                                        {(responses as any[])?.length
                                            ? (((responses as any[]).reduce((acc, curr) => acc + (curr.score || 0), 0)) / (responses?.length || 1)).toFixed(1)
                                            : '-'
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-[#6B7C93]/15 shadow-lg overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-[#4A90D9]/5 to-transparent">
                                <CardTitle className="text-xl font-bold text-[#4A90D9]">Lista de Participação</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-[#6B7C93]/5">
                                        <TableRow>
                                            <TableHead className="font-bold text-[#6B7C93] uppercase tracking-widest text-[10px] pl-6 h-12">Aluno</TableHead>
                                            <TableHead className="font-bold text-[#6B7C93] uppercase tracking-widest text-[10px] h-12">Status</TableHead>
                                            <TableHead className="font-bold text-[#6B7C93] uppercase tracking-widest text-[10px] h-12">Nota</TableHead>
                                            <TableHead className="text-right pr-6 font-bold text-[#6B7C93] uppercase tracking-widest text-[10px] h-12">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {studentStatusList.map((item: any) => (
                                            <TableRow key={item.student.id} className="hover:bg-[#4A90D9]/5 transition-colors border-[#6B7C93]/10">
                                                <TableCell className="font-medium text-[#1a2332] pl-6 py-4">{item.student.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={item.status === 'entregue' ? 'default' : 'secondary'} className={cn(
                                                        "font-bold text-[10px] uppercase",
                                                        item.status === 'pendente' ? 'bg-[#6B7C93]/10 text-[#6B7C93] border-none' : 'bg-green-100 text-green-700 hover:bg-green-200 border-none px-3'
                                                    )}>
                                                        {item.status === 'entregue' ? 'Entregue' : 'Pendente'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-bold text-[#F5A623]">
                                                    {item.score !== undefined ? item.score : '-'}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    {item.status === 'entregue' && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A90D9] hover:text-[#3A7BC8] hover:bg-[#4A90D9]/10 rounded-lg" asChild>
                                                            <Link href={`/professor/turmas/${classId}/avaliacoes/${assessmentId}/respostas/${item.student.id}`}>
                                                                <Icons.arrowRight className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
