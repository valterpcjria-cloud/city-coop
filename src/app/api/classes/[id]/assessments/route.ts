import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id: classId } = await params

        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('class_id', classId)
            .order('created_at', { ascending: false })

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
        console.log('[API] Creating assessment for class:', classId)

        const body = await request.json()
        const { title, type, description, questions, availableFrom } = body
        console.log('[API] Payload:', { title, type, questionsCount: questions?.length })

        if (!title || !type || !questions) {
            console.error('[API] Missing required fields')
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.error('[API] Unauthorized')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminAuth = await createAdminClient()

        // Verify/Find teacher
        let { data: teacher } = await adminAuth
            .from('teachers')
            .select('id')
            .eq('user_id', user.id)
            .single() as any

        if (!teacher) {
            console.log('[API] Teacher record missing for user:', user.id, '. Attempting auto-provision...')
            const { data: newTeacher, error: provisionError } = await (adminAuth
                .from('teachers') as any)
                .insert({
                    user_id: user.id,
                    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Professor',
                    email: user.email!,
                })
                .select('id')
                .single()

            if (provisionError) {
                console.error('[API] Auto-provisioning failed:', provisionError)
                return NextResponse.json({ error: 'Perfil de professor não encontrado e falha ao criar: ' + provisionError.message }, { status: 403 })
            }
            teacher = newTeacher
            console.log('[API] Auto-provisioned teacher ID:', teacher?.id)
        }

        if (!teacher) {
            return NextResponse.json({ error: 'Professor não identificado' }, { status: 403 })
        }

        console.log('[API] Inserting into DB with teacher ID:', teacher.id)

        const { data, error } = await (adminAuth
            .from('assessments') as any)
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

        if (error) {
            console.error('[API] DB Error:', error)
            throw error
        }

        console.log('[API] Success! Created assessment:', data.id)
        return NextResponse.json({ success: true, assessment: data })

    } catch (error: any) {
        console.error('[API] Catch Error:', error)
        return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 })
    }
}
