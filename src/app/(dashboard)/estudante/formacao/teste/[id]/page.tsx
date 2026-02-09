import { createClient } from '@/lib/supabase/server'
import { TestEngine } from '@/components/coop/test-engine'
import { redirect } from 'next/navigation'

interface TestPageProps {
    params: { id: string }
}

export default async function TestPage({ params }: TestPageProps) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 1. Get Student ID
    const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single() as any

    if (!student) return <div>Estudante não encontrado</div>

    // 2. Fetch Test and Questions
    const { data: test, error } = await supabase
        .from('cycle_tests')
        .select('*, questions:test_questions(*)')
        .eq('id', params.id)
        .single() as any

    if (error || !test) return <div>Teste não encontrado</div>

    // 3. Verify if test is "In Progress"
    const { data: attempt } = await supabase
        .from('student_test_results')
        .select('status')
        .eq('student_id', student.id)
        .eq('test_id', test.id)
        .single()

    if (!attempt || attempt.status !== 'Em Andamento') {
        redirect('/estudante/formacao')
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <TestEngine
                testId={test.id}
                testTitle={test.titulo}
                questions={test.questions || []}
                timeLimitMinutes={test.tempo_limite_minutos || 30}
                studentId={student.id}
            />
        </div>
    )
}
