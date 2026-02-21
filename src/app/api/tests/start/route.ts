import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startTestSchema, getZodErrorResponse } from '@/lib/validators'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // 1. Validate request body
        const validation = startTestSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(getZodErrorResponse(validation.error), { status: 400 })
        }

        const { testId, studentId } = validation.data
        const supabase = await createClient()

        // 2. Check if there is already a result for this test
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

        // 3. Create or Upsert initial result record (Consent/Start)
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
        return NextResponse.json({ error: error.message || 'Erro interno ao iniciar teste' }, { status: 500 })
    }
}
