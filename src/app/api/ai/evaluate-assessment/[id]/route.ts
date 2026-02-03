import { createClient } from '@/lib/supabase/server'
import { anthropic, SYSTEM_PROMPT_COOP } from '@/lib/ai/anthropic'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: { id: string } } // Response ID
) {
    try {
        const supabase = await createClient()
        const { id } = params

        // Fetch Response + Assessment Questions
        const { data: response } = await supabase
            .from('assessment_responses')
            .select(`
            *,
            assessment:assessments(title, questions, type)
        `)
            .eq('id', id)
            .single()

        if (!response) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // If already has feedback, skip? Or force? Let's force.

        const prompt = `
    Analise as respostas de um aluno para a avaliação: "${response.assessment.title}" (${response.assessment.type}).
    
    Perguntas e Respostas:
    ${response.assessment.questions.map((q: any, i: number) => `Q${i + 1}: ${q.text}\nR: ${response.answers[i] || "Não respondeu"}`).join('\n\n')}
    
    Tarefas:
    1. Para cada resposta, dê um breve comentário (Correto/Incorreto e porquê).
    2. Sugira uma nota de 0 a 100 baseada na qualidade geral.
    
    Responda em JSON formato: { "feedback_per_question": ["..."], "suggested_score": 85, "general_feedback": "..." }
    `

        const msg = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1500,
            temperature: 0.5, // Less creative for grading
            system: SYSTEM_PROMPT_COOP + " Retorne APENAS o JSON.",
            messages: [{ role: 'user', content: prompt }]
        });

        const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
        // Simple json parse attempt (in probd use specific parser/retry)
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        const jsonContent = (jsonStart !== -1 && jsonEnd !== -1) ? JSON.parse(text.substring(jsonStart, jsonEnd + 1)) : {};

        // Update with feedback
        const { error } = await supabase
            .from('assessment_responses')
            .update({
                ai_feedback: jsonContent,
                score: jsonContent.suggested_score // Auto-grade!
            })
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true, ai: jsonContent })

    } catch (error: any) {
        console.error('Error in assessment grading:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
