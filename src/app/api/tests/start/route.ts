import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { testId, studentId } = await request.json()

        // Check if there is already a result for this test
        const { data: existing } = await supabase
            .from('student_test_results')
            .select('status')
            .eq('student_id', studentId)
            .eq('test_id', testId)
            .single() as any

        if (existing && existing.status === 'Concluído') {
            return NextResponse.json({ error: 'Você já concluiu este teste.' }, { status: 400 })
        }

        if (existing && existing.status === 'Em Andamento') {
            return NextResponse.json({ success: true, message: 'Retornando ao teste em andamento.' })
        }

        // Create or Upsert initial result record (Consent/Start)
        const { data, error } = await (supabase as any)
            .from('student_test_results')
            .upsert({
                student_id: studentId,
                test_id: testId,
                status: 'Em Andamento',
                inicio_em: new Date().toISOString()
            }, { onConflict: 'student_id,test_id' })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
