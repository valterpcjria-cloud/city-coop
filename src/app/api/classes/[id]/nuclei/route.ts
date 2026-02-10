import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id: classId } = await params

        const { data, error } = await supabase
            .from('nuclei')
            .select(`
                *,
                members:nucleus_members(
                    *,
                    student:students(*)
                )
            `)
            .eq('class_id', classId)

        if (error) throw error
        return NextResponse.json(data)
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
        const { id: classId } = await params
        const body = await request.json()
        const { nucleusName, action, studentId, role } = body

        if (!nucleusName || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // 1. Get or Create Nucleus
        let { data: nucleus, error: fetchError } = await supabase
            .from('nuclei')
            .select('id')
            .eq('class_id', classId)
            .eq('name', nucleusName)
            .maybeSingle()

        if (fetchError) {
            console.error('Error fetching nucleus:', fetchError)
            throw fetchError
        }

        if (!nucleus && action === 'add_member') {
            console.log(`Creating new nucleus: ${nucleusName} for class: ${classId}`)
            const { data: newNucleus, error: createError } = await (supabase as any)
                .from('nuclei')
                .insert({
                    class_id: classId,
                    name: nucleusName,
                    description: `Núcleo de ${nucleusName}`
                })
                .select()
                .single()

            if (createError) {
                console.error('Error creating nucleus:', createError)
                throw createError
            }
            nucleus = newNucleus
        }

        if (!nucleus) {
            return NextResponse.json({ error: 'Nucleus not found and could not be created' }, { status: 404 })
        }

        if (action === 'add_member') {
            if (!studentId) return NextResponse.json({ error: 'Student ID required' }, { status: 400 })

            const { error } = await supabase
                .from('nucleus_members')
                .insert({
                    nucleus_id: (nucleus as any).id,
                    student_id: studentId,
                    role: role || 'membro'
                } as any)

            if (error) throw error

        } else if (action === 'remove_member') {
            if (!studentId) return NextResponse.json({ error: 'Student ID required' }, { status: 400 })

            const { error } = await supabase
                .from('nucleus_members')
                .delete()
                .eq('nucleus_id', (nucleus as any).id)
                .eq('student_id', studentId)

            if (error) throw error
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Error managing nucleus:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
