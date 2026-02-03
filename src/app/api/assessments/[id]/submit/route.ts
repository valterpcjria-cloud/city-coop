import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()
        const { id: assessmentId } = params
        const body = await request.json()
        const { answers } = body

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

        // Check if already submitted
        const { data: existing } = await supabase
            .from('assessment_responses')
            .select('id')
            .eq('assessment_id', assessmentId)
            .eq('student_id', student.id)
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
        }

        // Insert response
        const { data, error } = await supabase
            .from('assessment_responses')
            .insert({
                assessment_id: assessmentId,
                student_id: student.id,
                answers: answers,
                score: null // Will be updated by teacher or AI
            })
            .select()
            .single()

        if (error) throw error

        // Trigger AI Grading
        try {
            const baseUrl = new URL(request.url).origin
            fetch(`${baseUrl}/api/ai/evaluate-assessment/${data.id}`, { method: 'POST' }).catch(err => console.error('AI grading failed', err))
        } catch (e) {
            // ignore
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Error submitting assessment:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
