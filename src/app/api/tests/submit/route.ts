import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { submitTestSchema, getZodErrorResponse } from '@/lib/validators'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // 1. Validate request body
        const validation = submitTestSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(getZodErrorResponse(validation.error), { status: 400 })
        }

        const { testId, studentId, answers } = validation.data
        const supabase = await createClient()

        // 2. Fetch correct answers
        const { data: questions, error: qError } = await (supabase as any)
            .from('test_questions')
            .select('id, resposta_correta')
            .eq('test_id', testId) as any

        if (qError) throw qError
        if (!questions || questions.length === 0) {
            return NextResponse.json({ error: 'Nenhuma questão encontrada para este teste' }, { status: 404 })
        }

        // 3. Calculate Score
        let correctCount = 0
        questions.forEach((q: any) => {
            if (answers[q.id] === q.resposta_correta) {
                correctCount++
            }
        })

        const scorePercentage = (correctCount / questions.length) * 100

        // 4. Save result
        const { error: resError } = await (supabase as any)
            .from('student_test_results')
            .update({
                respostas: answers,
                score: scorePercentage,
                fim_em: new Date().toISOString(),
                status: 'Concluído'
            })
            .eq('student_id', studentId)
            .eq('test_id', testId)
            .eq('status', 'Em Andamento')

        if (resError) throw resError

        // 5. Update Conhecimento Score in student_scores
        const { data: allResults } = await (supabase as any)
            .from('student_test_results')
            .select('score')
            .eq('student_id', studentId)
            .eq('status', 'Concluído') as any

        const avgScore = allResults && allResults.length > 0
            ? allResults.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / allResults.length
            : scorePercentage

        await (supabase as any)
            .from('student_scores')
            .upsert({
                student_id: studentId,
                conhecimento_score: avgScore,
                ultima_atualizacao: new Date().toISOString()
            }, { onConflict: 'student_id' })

        // 6. Proactive Revalidation
        revalidatePath('/estudante/formacao')
        revalidatePath('/professor/estudantes')

        return NextResponse.json({ success: true, score: scorePercentage })
    } catch (error: any) {
        console.error('Submit error:', error.message)
        return NextResponse.json({ error: error.message || 'Erro interno do servidor ao enviar teste' }, { status: 500 })
    }
}
