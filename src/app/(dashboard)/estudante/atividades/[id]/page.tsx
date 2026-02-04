import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { TakeAssessmentForm } from '@/components/assessments/take-assessment-form'

export default async function TakeAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: assessment } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', id)
        .single() as any

    if (!assessment) notFound()

    // Verify if already submitted
    const { data: student } = await supabase.from('students').select('id').eq('user_id', user.id).single() as any

    if (student) {
        const { data: existingResponse } = await supabase
            .from('assessment_responses')
            .select('id')
            .eq('assessment_id', id)
            .eq('student_id', student.id)
            .single()

        if (existingResponse) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                    <div className="bg-green-100 p-4 rounded-full">
                        <Icons.check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold">Avaliação já enviada</h2>
                    <p className="text-muted-foreground">Você já completou esta atividade.</p>
                    <Button asChild>
                        <Link href="/estudante/atividades">Voltar</Link>
                    </Button>
                </div>
            )
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/estudante/atividades">
                        <Icons.arrowRight className="h-4 w-4 rotate-180" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{assessment.title}</h1>
                    <p className="text-muted-foreground">Responda as questões abaixo com atenção.</p>
                </div>
            </div>

            <TakeAssessmentForm assessment={assessment} studentId={student?.id} />
        </div>
    )
}
