import { createClient } from '@/lib/supabase/server'
import { evaluateEventPlan } from '@/lib/ai/anthropic'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params // Event Plan ID

        // Fetch Plan
        const { data: plan } = await (supabase as any)
            .from('event_plans')
            .select('*')
            .eq('id', id)
            .single()

        if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

        // Generate AI Evaluation
        const feedback = await evaluateEventPlan(plan)

        // Save Feedback
        const { error } = await (supabase as any)
            .from('event_plans')
            .update({
                ai_evaluation: {
                    feedback,
                    evaluated_at: new Date().toISOString()
                }
            })
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true, feedback })

    } catch (error: any) {
        console.error('Error in AI evaluation:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
