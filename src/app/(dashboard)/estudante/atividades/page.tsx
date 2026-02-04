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

    const { data: student } = await supabase
        .from('students')
        .select('id, classes:class_students(class_id)')
        .eq('user_id', user.id)
        .single() as any

    if (!student || !student.classes.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <p className="text-[#6B7C93]">Você não está vinculado a nenhuma turma.</p>
            </div>
        )
    }

    const classId = student.classes[0].class_id

    const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false })

    const { data: responses } = await supabase
        .from('assessment_responses')
        .select('assessment_id, score, completed_at')
        .eq('student_id', student.id)

    const responseMap = new Map(responses?.map((r: any) => [r.assessment_id, r]))

    const pendingAssessments = assessments?.filter((a: any) => !responseMap.has(a.id)) || []
    const completedAssessments = assessments?.filter((a: any) => responseMap.has(a.id)) || []

    return (
        <div className="space-y-8">
            {/* Header with Brand Gradient */}
            <div className="p-6 -m-6 mb-0 bg-gradient-to-r from-[#4A90D9]/10 via-white to-[#F5A623]/10 border-b border-[#6B7C93]/10">
                <h2 className="text-3xl font-bold tracking-tight text-[#4A90D9]">Minhas Atividades</h2>
                <p className="text-[#6B7C93]">Tarefas e avaliações pendentes.</p>
            </div>

            {/* Pending */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-[#F5A623]">
                    <div className="p-1.5 rounded-full bg-[#F5A623]/10">
                        <Icons.clock className="h-4 w-4" />
                    </div>
                    Pendentes ({pendingAssessments.length})
                </h3>

                {pendingAssessments.length === 0 ? (
                    <Card className="border-dashed border-[#6B7C93]/30 bg-[#4A90D9]/5">
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="p-3 rounded-full bg-green-100 mb-3">
                                <Icons.check className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-[#6B7C93] font-medium">Tudo em dia! Nenhuma atividade pendente.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pendingAssessments.map((assessment: any) => (
                            <Card key={assessment.id} className="border-l-4 border-l-[#F5A623] hover:shadow-lg transition-all duration-200">
                                <CardHeader>
                                    <CardTitle className="line-clamp-1 text-[#1a2332]">{assessment.title}</CardTitle>
                                    <CardDescription className="text-[#6B7C93]">
                                        Disponível desde {format(new Date(assessment.created_at), "dd/MM", { locale: ptBR })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <Badge variant="outline" className="border-[#4A90D9] text-[#4A90D9]">{assessment.type}</Badge>
                                    </div>
                                    <Button className="w-full" variant="brand" asChild>
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
                    <h3 className="text-lg font-bold flex items-center gap-2 text-green-600">
                        <div className="p-1.5 rounded-full bg-green-100">
                            <Icons.check className="h-4 w-4" />
                        </div>
                        Concluídas ({completedAssessments.length})
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {completedAssessments.map((assessment: any) => {
                            const response = responseMap.get(assessment.id)
                            return (
                                <Card key={assessment.id} className="bg-[#4A90D9]/5 border-[#6B7C93]/10 hover:shadow transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-base text-[#4A90D9]">{assessment.title}</CardTitle>
                                        <CardDescription className="text-[#6B7C93]">
                                            Entregue em {format(new Date(response.completed_at), "dd/MM/yyyy", { locale: ptBR })}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary" className="bg-[#6B7C93]/10 text-[#6B7C93]">{assessment.type}</Badge>
                                            <span className="font-bold text-[#F5A623]">Nota: {response.score ?? '-'}</span>
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
