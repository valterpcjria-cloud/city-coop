import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateStudentIndicators } from '@/lib/indicators'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id: classId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Only teachers should trigger this manually for whole class, 
        // or automatic trigger on individual grading.
        // For now, let's allow teachers to "Refresh Indicators" for the whole class.

        const { data: students } = await (supabase
            .from('class_students') as any)
            .select('student_id')
            .eq('class_id', classId)

        if (students) {
            for (const s of students) {
                await calculateStudentIndicators(s.student_id, classId)
            }
        }

        return NextResponse.json({ success: true, message: 'Indicators updated' })

    } catch (error: any) {
        console.error('Error recalculating:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
