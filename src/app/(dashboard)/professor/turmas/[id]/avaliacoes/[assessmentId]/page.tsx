import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function AssessmentDetailsPage({
    params
}: {
    params: { id: string; assessmentId: string }
}) {
    const supabase = await createClient()
    const { id: classId, assessmentId } = await (params as any)

    const { data: assessment } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single()

    if (!assessment) notFound()

    // Fetch responses with student info
    const { data: responses } = await supabase
        .from('assessment_responses')
        .select('*, student:students(name, email)')
        .eq('assessment_id', assessmentId)

    // Fetch all students to see who hasn't answered
    const { data: allStudents } = await supabase
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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/professor/turmas/${classId}`}>
                        <Icons.arrowRight className="h-4 w-4 rotate-180" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold tracking-tight">{assessment.title}</h2>
                        <Badge>{assessment.type}</Badge>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">
                        Criado em {format(new Date(assessment.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allStudents?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Entregues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {responses?.length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {allStudents?.length ? Math.round(((responses?.length || 0) / allStudents.length) * 100) : 0}% da turma
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Média da Turma</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {responses?.length
                                ? (responses.reduce((acc, curr) => acc + (curr.score || 0), 0) / responses.length).toFixed(1)
                                : '-'
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Situação dos Alunos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Aluno</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Nota</TableHead>
                                <TableHead>Data de Entrega</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentStatusList.map((item: any) => (
                                <TableRow key={item.student.id}>
                                    <TableCell className="font-medium">{item.student.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === 'entregue' ? 'default' : 'secondary'} className={item.status === 'pendente' ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-green-100 text-green-700 hover:bg-green-200 border-none'}>
                                            {item.status === 'entregue' ? 'Entregue' : 'Pendente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {item.score !== undefined ? (
                                            <span className="font-bold">{item.score}</span>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {item.submittedAt
                                            ? format(new Date(item.submittedAt), "dd/MM/yyyy HH:mm")
                                            : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.status === 'entregue' && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/professor/turmas/${classId}/avaliacoes/${assessmentId}/respostas/${item.student.id}`}>
                                                    Ver Respostas
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
    )
}
