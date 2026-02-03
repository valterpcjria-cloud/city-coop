import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()
        const { id: classId } = params // Next 15 might require await
        const body = await request.json()
        const { title, type, description, questions, availableFrom } = body

        if (!title || !type || !questions) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Verify teacher
        const { data: teacher } = await supabase.from('teachers').select('id').eq('user_id', user.id).single()
        if (!teacher) return NextResponse.json({ error: 'Not a teacher' }, { status: 403 })

        const { data, error } = await supabase
            .from('assessments')
            .insert({
                class_id: classId,
                title,
                type,
                questions,
                created_by: teacher.id,
                available_from: availableFrom
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, assessment: data })

    } catch (error: any) {
        console.error('Error creating assessment:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
