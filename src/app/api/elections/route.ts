import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/elections - Listar eleições
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const classId = searchParams.get('class_id')

        const adminClient = await createAdminClient()

        // 1. Identify user role and relevant IDs
        const [teacherRes, managerRes] = await Promise.all([
            adminClient.from('teachers').select('id').eq('user_id', user.id).maybeSingle() as any,
            adminClient.from('managers').select('id, is_superadmin').eq('user_id', user.id).maybeSingle() as any
        ])

        const teacher = teacherRes.data
        const manager = managerRes.data
        const isSuperadmin = (user as any).app_metadata?.role === 'superadmin' || manager?.is_superadmin

        let query = (supabase
            .from('elections') as any)
            .select(`
                *,
                class:classes(id, name, code, teacher_id)
            `)
            .order('created_at', { ascending: false })

        // 2. Apply filters based on role
        if (teacher && !isSuperadmin) {
            // Professor: only show elections for their classes
            query = query.eq('classes.teacher_id', teacher.id)
        } else if (!manager && !isSuperadmin) {
            // Student: query should ideally be filtered by their class_id if not provided
            // For now, if classId is provided, we use it. If not, results might be limited by RLS.
        }

        if (classId) {
            query = query.eq('class_id', classId)
        }

        const { data: elections, error } = await query

        if (error) {
            console.error('Error fetching elections:', error)
            return NextResponse.json({ error: 'Erro ao buscar eleições' }, { status: 500 })
        }

        // 3. Post-filter for Students if necessary (if RLS is not fully configured for this join)
        // (Assuming RLS handles student visibility of their own class)

        return NextResponse.json({ elections })
    } catch (error) {
        console.error('Error in GET /api/elections:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}

// POST /api/elections - Criar nova eleição (apenas professor)
export async function POST(request: NextRequest) {
    try {
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
            return NextResponse.json({ error: 'Apenas professores podem criar eleições' }, { status: 403 })
        }

        const body = await request.json()
        const {
            class_id,
            data_inicio_inscricoes,
            data_fim_inscricoes,
            data_inicio_campanha,
            data_fim_campanha,
            data_inicio_votacao,
            data_fim_votacao,
            vagas_administracao = 3,
            vagas_fiscal_efetivos = 3,
            vagas_fiscal_suplentes = 3,
            vagas_etica = 3,
        } = body

        // Validações
        if (!class_id) {
            return NextResponse.json({ error: 'ID da turma é obrigatório' }, { status: 400 })
        }

        // Verificar se professor é responsável pela turma
        const { data: classData } = await (adminClient
            .from('classes') as any)
            .select('id, teacher_id')
            .eq('id', class_id)
            .eq('teacher_id', teacher.id)
            .single()

        if (!classData) {
            return NextResponse.json({ error: 'Você não é responsável por esta turma' }, { status: 403 })
        }

        // Validar datas
        if (data_inicio_inscricoes && data_fim_inscricoes) {
            if (new Date(data_inicio_inscricoes) >= new Date(data_fim_inscricoes)) {
                return NextResponse.json({ error: 'Data de início de inscrições deve ser anterior ao fim' }, { status: 400 })
            }
        }

        if (data_inicio_votacao && data_fim_votacao) {
            if (new Date(data_inicio_votacao) >= new Date(data_fim_votacao)) {
                return NextResponse.json({ error: 'Data de início de votação deve ser anterior ao fim' }, { status: 400 })
            }
        }

        // Validar vagas
        if (vagas_administracao < 1 || vagas_fiscal_efetivos < 1 || vagas_etica < 1) {
            return NextResponse.json({ error: 'Número de vagas deve ser pelo menos 1' }, { status: 400 })
        }

        // Criar eleição
        const { data: election, error } = await (adminClient
            .from('elections') as any)
            .insert({
                class_id,
                status: 'configuracao',
                data_inicio_inscricoes,
                data_fim_inscricoes,
                data_inicio_campanha,
                data_fim_campanha,
                data_inicio_votacao,
                data_fim_votacao,
                vagas_administracao,
                vagas_fiscal_efetivos,
                vagas_fiscal_suplentes,
                vagas_etica,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating election:', error)
            return NextResponse.json({ error: 'Erro ao criar eleição' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            election,
            message: 'Eleição criada com sucesso!'
        }, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/elections:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
