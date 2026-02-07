import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { getAIModel } from '@/lib/ai/models'
import { SYSTEM_PROMPT_COOP } from '@/lib/ai/anthropic'
import { z } from 'zod'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Response ID
) {
    try {
        const supabase = await createClient()
        const { id } = await params

        // Fetch Response + Assessment Questions
        const { data: response } = await (supabase as any)
            .from('assessment_responses')
            .select(`
            *,
            assessment:assessments(title, questions, type)
        `)
            .eq('id', id)
            .single()

        if (!response) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        const prompt = `
Analise as respostas de um aluno para a avaliação: "${response.assessment.title}" (${response.assessment.type}).

Perguntas e Respostas:
${response.assessment.questions.map((q: any, i: number) => {
            const studentAnswer = response.answers[i];
            if (q.type === 'multiple-choice') {
                const isCorrect = studentAnswer === q.correctAnswer?.toString();
                return `Q${i + 1} (Objetiva): ${q.text}
        Alternativas: ${q.options?.join(', ')}
        Resposta Correta: ${q.options?.[q.correctAnswer] || q.correctAnswer}
        Resposta do Aluno: ${q.options?.[studentAnswer] || studentAnswer}
        Status: ${isCorrect ? 'CORRETO' : 'INCORRETO'}`;
            }
            return `Q${i + 1} (Dissertativa): ${q.text}\nResposta do Aluno: ${studentAnswer || "Não respondeu"}`;
        }).join('\n\n')}

Tarefas:
1. Para cada resposta, dê um breve comentário (Correto/Incorreto e porquê). 
2. Nas questões OBJETIVAS, se o Status for INCORRETO, explique por que a outra alternativa era a certa.
3. Calcule uma nota de 0 a 100 baseada na precisão (objetivas) e qualidade (dissertativas).`

        const model = await getAIModel()
        const { object } = await generateObject({
            model,
            system: SYSTEM_PROMPT_COOP + " Forneça feedback construtivo.",
            prompt,
            schema: z.object({
                feedback_per_question: z.array(z.string()),
                suggested_score: z.number().min(0).max(100),
                general_feedback: z.string()
            })
        })

        // Update with feedback
        const { error } = await (supabase as any)
            .from('assessment_responses')
            .update({
                ai_feedback: object,
                score: object.suggested_score // Auto-grade!
            })
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true, ai: object })

    } catch (error: any) {
        console.error('Error in assessment grading:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
