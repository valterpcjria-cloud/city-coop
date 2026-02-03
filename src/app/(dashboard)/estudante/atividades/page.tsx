import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function StudentActivitiesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get student and class
    const { data: student } = await supabase
        .from('students')
        .select('id, classes:class_students(class_id)')
        .eq('user_id', user.id)
        .single() as any

    if (!student || !student.classes.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <p className="text-muted-foreground">Você não está vinculado a nenhuma turma.</p>
            </div>
        )
    }

    const classId = student.classes[0].class_id

    // Fetch assessments for the class
    const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false })

    // Fetch student responses
    const { data: responses } = await supabase
        .from('assessment_responses')
        .select('assessment_id, score, completed_at')
        .eq('student_id', student.id)

    const responseMap = new Map(responses?.map((r: any) => [r.assessment_id, r]))

    const pendingAssessments = assessments?.filter((a: any) => !responseMap.has(a.id)) || []
    const completedAssessments = assessments?.filter((a: any) => responseMap.has(a.id)) || []

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Minhas Atividades</h2>
                <p className="text-slate-500">Tarefas e avaliações pendentes.</p>
            </div>

            {/* Pending */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Icons.clock className="h-5 w-5 text-orange-500" />
                    Pendentes ({pendingAssessments.length})
                </h3>

                {pendingAssessments.length === 0 ? (
                    <Card className="border-dashed bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <Icons.check className="h-8 w-8 mb-2 text-green-500 opacity-50" />
                            <p>Tudo em dia! Nenhuma atividade pendente.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pendingAssessments.map((assessment: any) => (
                            <Card key={assessment.id} className="border-l-4 border-l-orange-400">
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{assessment.title}</CardTitle>
                                    <CardDescription>
                                        Disponível desde {format(new Date(assessment.created_at), "dd/MM", { locale: ptBR })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <Badge variant="outline">{assessment.type}</Badge>
                                    </div>
                                    <Button className="w-full" asChild>
                                        <Link href={`/estudante/atividades/${assessment.id}`}>
                                            Iniciar Avaliação
                                            <Icons.arrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed */}
            {completedAssessments.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-600">
                        <Icons.check className="h-5 w-5" />
                        Concluídas ({completedAssessments.length})
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-80 hover:opacity-100 transition-opacity">
                        {completedAssessments.map((assessment: any) => {
                            const response = responseMap.get(assessment.id)
                            return (
                                <Card key={assessment.id} className="bg-slate-50">
                                    <CardHeader>
                                        <CardTitle className="text-base text-slate-700">{assessment.title}</CardTitle>
                                        <CardDescription>
                                            Entregue em {format(new Date(response.completed_at), "dd/MM/yyyy", { locale: ptBR })}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary">{assessment.type}</Badge>
                                            <span className="font-bold text-slate-700">Nota: {response.score ?? '-'}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
