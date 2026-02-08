import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const body = await request.json()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Insert new plan
        const { data, error } = await (supabase
            .from('event_plans') as any)
            .insert(body)
            .select()
            .single()

        if (error) throw error

        // Trigger AI Evaluation
        try {
            const baseUrl = new URL(request.url).origin
            fetch(`${baseUrl}/api/ai/evaluate-event/${data.id}`, { method: 'POST' }).catch(err => console.error('AI trigger failed', err))
        } catch (e) {
            // ignore
        }

        return NextResponse.json(data)

    } catch (error: any) {
        console.error('Error creating event plan:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
