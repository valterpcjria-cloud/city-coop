import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Separator } from '@/components/ui/separator'
import { GradingForm } from '@/components/assessments/grading-form'

export default async function StudentResponsePage({
    params
}: {
    params: Promise<{ id: string; assessmentId: string; studentId: string }>
}) {
    const supabase = await createClient()
    const { id: classId, assessmentId, studentId } = await params

    const { data: response } = await supabase
        .from('assessment_responses')
        .select('*, student:students(name, email), assessment:assessments(*)')
        .eq('assessment_id', assessmentId)
        .eq('student_id', studentId)
        .single() as any

    if (!response) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold">Resposta não encontrada</h2>
                <p>O aluno ainda não enviou esta avaliação.</p>
                <Button asChild className="mt-4">
                    <Link href={`/professor/turmas/${classId}/avaliacoes/${assessmentId}`}>Voltar</Link>
                </Button>
            </div>
        )
    }

    const questions = response.assessment.questions || []
    const answers = response.answers || {}

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/professor/turmas/${classId}/avaliacoes/${assessmentId}`}>
                            <Icons.arrowRight className="h-4 w-4 rotate-180" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">{response.student.name}</h2>
                        <p className="text-muted-foreground">{response.assessment.title}</p>
                    </div>
                </div>

                <GradingForm responseId={response.id} currentScore={response.score} />
            </div>

            <div className="space-y-6">
                {questions.map((q: any, i: number) => (
                    <Card key={i}>
                        <CardHeader className="bg-slate-50/50 pb-3">
                            <CardTitle className="text-base font-medium">Questão {i + 1}: {q.text}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="bg-white p-4 rounded-md border text-slate-800">
                                {answers[i] || <span className="text-muted-foreground italic">Sem resposta</span>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
