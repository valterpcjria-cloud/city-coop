import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { testId, studentId, answers } = await request.json()

        // 1. Fetch correct answers
        const { data: questions, error: qError } = await (supabase as any)
            .from('test_questions')
            .select('id, resposta_correta')
            .eq('test_id', testId) as any

        if (qError) throw qError

        // 2. Calculate Score
        let correctCount = 0
        questions.forEach((q: any) => {
            if (answers[q.id] === q.resposta_correta) {
                correctCount++
            }
        })

        const scorePercentage = (correctCount / questions.length) * 100

        // 3. Save result
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

        // 4. Update Conhecimento Score in student_scores
        // We'll take the average of all completed tests for this student
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

        return NextResponse.json({ success: true, score: scorePercentage })
    } catch (error: any) {
        console.error('Submit error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
