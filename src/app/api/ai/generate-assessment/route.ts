import { NextRequest, NextResponse } from 'next/server'
import { generateAssessment } from '@/lib/ai/claude'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await req.json()
        const { guidelines, classId, topic, assessmentType, format, optionsCount, questionsCount } = body

        if (!guidelines) {
            return NextResponse.json({ error: 'Diretrizes são obrigatórias' }, { status: 400 })
        }

        const assessment = await generateAssessment(guidelines, {
            classId,
            topic,
            assessmentType,
            format,
            optionsCount,
            questionsCount
        })

        return NextResponse.json(assessment)
    } catch (error) {
        console.error('AI Assessment Generation Error:', error)
        return NextResponse.json({ error: 'Erro ao gerar avaliação com IA' }, { status: 500 })
    }
}
