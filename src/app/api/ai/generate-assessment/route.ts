import { NextRequest, NextResponse } from 'next/server'
import { generateAssessment } from '@/lib/ai/claude'
import { createClient } from '@/lib/supabase/server'
import { validateProfessorAccess } from '@/lib/auth-guard'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limiter'
import { recordAuditLog } from '@/lib/audit'

export async function POST(req: NextRequest) {
    try {
        const auth = await validateProfessorAccess()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(req, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.AI)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
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

        // Audit log
        await recordAuditLog({
            userId: auth.user!.id,
            action: 'AI_GENERATE_ASSESSMENT',
            resource: 'assessments',
            newData: { topic, assessmentType, classId },
            ip: req.headers.get('x-forwarded-for') || 'unknown'
        })

        return NextResponse.json(assessment)
    } catch (error) {
        console.error('AI Assessment Generation Error:', error)
        return NextResponse.json({ error: 'Erro ao gerar avaliação com IA' }, { status: 500 })
    }
}
