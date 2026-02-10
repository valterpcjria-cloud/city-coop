import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkIsGestor } from '@/lib/coop-auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id: cycleId } = await params

        const { data, error } = await supabase
            .from('test_nominations')
            .select('*, student:students(name, grade_level)')
            .eq('cycle_id', cycleId)

        if (error) throw error
        return NextResponse.json(data || [])
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id: cycleId } = await params
        const { studentId } = await request.json()

        if (!studentId) {
            return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const isAuthorized = await checkIsGestor(supabase, user)
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Only gestors can nominate students' }, { status: 403 })
        }

        // Get gestor record id
        const { data: gestor } = await supabase
            .from('gestors')
            .select('id')
            .eq('user_id', user.id)
            .single() as any

        if (!gestor) {
            return NextResponse.json({ error: 'Gestor record not found' }, { status: 403 })
        }

        const { data, error } = await (supabase as any)
            .from('test_nominations')
            .upsert({
                student_id: studentId,
                cycle_id: cycleId,
                nominated_by: gestor.id
            })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
