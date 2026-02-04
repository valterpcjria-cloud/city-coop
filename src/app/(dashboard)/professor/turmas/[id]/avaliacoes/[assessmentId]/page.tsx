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

    // Security check: Verify if the teacher owns this class
    const { data: teacher } = await adminClient
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!teacher) {
        console.error('[AssessmentDetails] Teacher profile not found for user:', user.id)
        notFound()
    }

    // Fetch assessment using adminClient to bypass RLS
    const { data: assessment } = await adminClient
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single() as any

    if (!assessment) {
        console.error('[AssessmentDetails] Assessment not found:', assessmentId)
        notFound()
    }

    // Double check class ownership
    if (assessment.class_id !== classId) {
        console.error('[AssessmentDetails] Class mismatch:', { expected: classId, actual: assessment.class_id })
        notFound()
    }

    // Fetch responses with student info
    const { data: responses } = await adminClient
        .from('assessment_responses')
        .select('*, student:students(id, name, email)')
        .eq('assessment_id', assessmentId)

    // Fetch all students to see who hasn't answered
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
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-200" asChild>
                    <Link href={`/professor/turmas/${classId}`}>
                        <Icons.arrowRight className="h-4 w-4 rotate-180" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{assessment.title}</h2>
                        <Badge variant="outline" className="font-bold uppercase tracking-wider text-[10px] bg-blue-50 text-blue-700 border-blue-100">
                            {assessment.type}
                        </Badge>
                    </div>
                    <p className="text-slate-500 font-medium text-sm mt-1 flex items-center gap-2">
                        <Icons.calendar className="h-4 w-4" />
                        Criado em {format(new Date(assessment.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
            </div>

            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-100/50 p-1">
                    <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest px-8">
                        Conteúdo
                    </TabsTrigger>
                    <TabsTrigger value="results" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest px-8">
                        Resultados
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-8">
                    <div className="max-w-4xl space-y-6">
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                            <div className="h-1 w-full bg-blue-600" />
                            <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-900">Questões Geradas</CardTitle>
                                    <CardDescription className="font-medium">Total de {assessment.questions?.length || 0} questões.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" className="font-bold gap-2">
                                    <Icons.settings className="h-4 w-4" />
                                    Editar
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-8">
                                {assessment.questions && Array.isArray(assessment.questions) && assessment.questions.map((q: any, i: number) => (
                                    <div key={i} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="flex items-start gap-4">
                                            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 text-white text-sm font-black shadow-lg shadow-slate-200">
                                                {i + 1}
                                            </span>
                                            <div className="space-y-4 flex-1">
                                                <p className="font-bold text-lg text-slate-900 leading-snug pt-0.5">{q.text}</p>

                                                {q.type === 'multiple-choice' && q.options && (
                                                    <div className="grid gap-2">
                                                        {q.options.map((opt: string, optIdx: number) => (
                                                            <div
                                                                key={optIdx}
                                                                className={cn(
                                                                    "p-3.5 rounded-xl border text-sm transition-all flex items-center gap-3",
                                                                    q.correctAnswer === optIdx
                                                                        ? "bg-green-50 border-green-200 text-green-800 font-bold shadow-sm"
                                                                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black uppercase",
                                                                    q.correctAnswer === optIdx
                                                                        ? "bg-green-500 text-white"
                                                                        : "bg-slate-100 text-slate-400"
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
                                                        <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 text-sm flex items-center gap-2 italic">
                                                            <Icons.ai className="h-4 w-4" />
                                                            Questão dissertativa / Redação. Resposta em formato de texto livre.
                                                        </div>
                                                        {q.answerKey && (
                                                            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Icons.sparkles className="h-3 w-3 text-indigo-600" />
                                                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Gabarito / Critérios Sugeridos</span>
                                                                </div>
                                                                <p className="text-sm text-indigo-900 leading-relaxed">{q.answerKey}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {i < assessment.questions.length - 1 && <Separator className="bg-slate-100" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="results" className="mt-8">
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card className="border-slate-200/60 shadow-sm overflow-hidden group">
                                <div className="h-1 w-full bg-slate-400 group-hover:bg-blue-500 transition-colors" />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Total de Alunos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-slate-900">{allStudents?.length || 0}</div>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200/60 shadow-sm overflow-hidden group">
                                <div className="h-1 w-full bg-green-400 group-hover:bg-green-500 transition-colors" />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Entregues</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-green-600">
                                        {responses?.length || 0}
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 mt-1">
                                        {allStudents?.length ? Math.round(((responses?.length || 0) / allStudents.length) * 100) : 0}% da turma
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200/60 shadow-sm overflow-hidden group">
                                <div className="h-1 w-full bg-indigo-400 group-hover:bg-indigo-500 transition-colors" />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Média da Turma</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-indigo-700">
                                        {(responses as any[])?.length
                                            ? (((responses as any[]).reduce((acc, curr) => acc + (curr.score || 0), 0)) / (responses?.length || 1)).toFixed(1)
                                            : '-'
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-slate-900">Lista de Participação</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-600 uppercase tracking-widest text-[10px] pl-6 h-12">Aluno</TableHead>
                                            <TableHead className="font-bold text-slate-600 uppercase tracking-widest text-[10px] h-12">Status</TableHead>
                                            <TableHead className="font-bold text-slate-600 uppercase tracking-widest text-[10px] h-12">Nota</TableHead>
                                            <TableHead className="text-right pr-6 font-bold text-slate-600 uppercase tracking-widest text-[10px] h-12">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {studentStatusList.map((item: any) => (
                                            <TableRow key={item.student.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                                                <TableCell className="font-medium text-slate-900 pl-6 py-4">{item.student.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={item.status === 'entregue' ? 'default' : 'secondary'} className={cn(
                                                        "font-bold text-[10px] uppercase",
                                                        item.status === 'pendente' ? 'bg-slate-100 text-slate-500 border-none' : 'bg-green-100 text-green-700 hover:bg-green-200 border-none px-3'
                                                    )}>
                                                        {item.status === 'entregue' ? 'Entregue' : 'Pendente'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-bold text-slate-900">
                                                    {item.score !== undefined ? item.score : '-'}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    {item.status === 'entregue' && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg" asChild>
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
