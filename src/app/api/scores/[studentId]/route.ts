import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { studentId: string } }
) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('student_scores')
            .select('*')
            .eq('student_id', params.studentId)
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
