import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/elections/[id] - Buscar eleição por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { data: election, error } = await (supabase
            .from('elections') as any)
            .select(`
                *,
                class:classes(id, name, code, teacher_id, schools(id, name))
            `)
            .eq('id', id)
            .single()

        if (error || !election) {
            return NextResponse.json({ error: 'Eleição não encontrada' }, { status: 404 })
        }

        // Authorization Check
        const adminClient = await createAdminClient()
        const [teacherRes, managerRes, studentRes] = await Promise.all([
            adminClient.from('teachers').select('id').eq('user_id', user.id).maybeSingle() as any,
            adminClient.from('managers').select('id, is_superadmin').eq('user_id', user.id).maybeSingle() as any,
            adminClient.from('students').select('id').eq('user_id', user.id).maybeSingle() as any
        ])

        const teacher = teacherRes.data
        const manager = managerRes.data
        const student = studentRes.data
        const isSuperadmin = (user as any).app_metadata?.role === 'superadmin' || manager?.is_superadmin

        // 1. gestor/superadmin -> allow
        if (manager || isSuperadmin) {
            return NextResponse.json({ election })
        }

        // 2. professor -> must be owner of the class
        if (teacher) {
            if (election.class?.teacher_id === teacher.id) {
                return NextResponse.json({ election })
            }
            return NextResponse.json({ error: 'Você não tem permissão para visualizar esta eleição' }, { status: 403 })
        }

        // 3. student -> must be in the class
        if (student) {
            const { data: enrollment } = await adminClient
                .from('class_students')
                .select('id')
                .eq('class_id', election.class_id)
                .eq('student_id', student.id)
                .maybeSingle()

            if (enrollment) {
                return NextResponse.json({ election })
            }
            return NextResponse.json({ error: 'Você não faz parte da turma desta eleição' }, { status: 403 })
        }

        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    } catch (error) {
        console.error('Error in GET /api/elections/[id]:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}

// PATCH /api/elections/[id] - Atualizar eleição
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const adminClient = await createAdminClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Verificar se é professor
        const { data: teacher } = await (adminClient
            .from('teachers') as any)
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!teacher) {
            return NextResponse.json({ error: 'Apenas professores podem atualizar eleições' }, { status: 403 })
        }

        // Verificar se eleição existe e pertence ao professor
        const { data: election } = await (adminClient
            .from('elections') as any)
            .select(`
                *,
                class:classes(id, teacher_id)
            `)
            .eq('id', id)
            .single()

        if (!election) {
            return NextResponse.json({ error: 'Eleição não encontrada' }, { status: 404 })
        }

        if ((election.class as any)?.teacher_id !== teacher.id) {
            return NextResponse.json({ error: 'Você não é responsável por esta eleição' }, { status: 403 })
        }

        const body = await request.json()
        const allowedFields = [
            'status',
            'data_inicio_inscricoes',
            'data_fim_inscricoes',
            'data_inicio_campanha',
            'data_fim_campanha',
            'data_inicio_votacao',
            'data_fim_votacao',
            'vagas_administracao',
            'vagas_fiscal_efetivos',
            'vagas_fiscal_suplentes',
            'vagas_etica',
        ]

        const updateData: Record<string, any> = {}
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field]
            }
        }

        const { data: updatedElection, error } = await (adminClient
            .from('elections') as any)
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating election:', error)
            return NextResponse.json({ error: 'Erro ao atualizar eleição' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            election: updatedElection,
            message: 'Eleição atualizada com sucesso!'
        })
    } catch (error) {
        console.error('Error in PATCH /api/elections/[id]:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}

// DELETE /api/elections/[id] - Excluir eleição
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const adminClient = await createAdminClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Verificar se é professor
        const { data: teacher } = await (adminClient
            .from('teachers') as any)
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!teacher) {
            return NextResponse.json({ error: 'Apenas professores podem excluir eleições' }, { status: 403 })
        }

        // Verificar se eleição existe e pertence ao professor
        const { data: election } = await (adminClient
            .from('elections') as any)
            .select(`
                *,
                class:classes(id, teacher_id)
            `)
            .eq('id', id)
            .single()

        if (!election) {
            return NextResponse.json({ error: 'Eleição não encontrada' }, { status: 404 })
        }

        if ((election.class as any)?.teacher_id !== teacher.id) {
            return NextResponse.json({ error: 'Você não é responsável por esta eleição' }, { status: 403 })
        }

        // Não permitir excluir eleição em andamento
        if (['votacao', 'encerrada'].includes(election.status)) {
            return NextResponse.json({ error: 'Não é possível excluir eleição em votação ou encerrada' }, { status: 400 })
        }

        const { error } = await (adminClient
            .from('elections') as any)
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting election:', error)
            return NextResponse.json({ error: 'Erro ao excluir eleição' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Eleição excluída com sucesso!'
        })
    } catch (error) {
        console.error('Error in DELETE /api/elections/[id]:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
