import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/elections/[id]/candidates - Listar candidatos
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: electionId } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const conselho = searchParams.get('conselho')

        let query = (supabase
            .from('candidates') as any)
            .select(`
                *,
                student:students(id, name, email)
            `)
            .eq('election_id', electionId)
            .eq('aprovado', true)
            .order('created_at', { ascending: true })

        if (conselho) {
            query = query.eq('conselho', conselho)
        }

        const { data: candidates, error } = await query

        if (error) {
            console.error('Error fetching candidates:', error)
            return NextResponse.json({ error: 'Erro ao buscar candidatos' }, { status: 500 })
        }

        // Buscar eleição para verificar se pode mostrar votos
        const { data: election } = await (supabase
            .from('elections') as any)
            .select('status')
            .eq('id', electionId)
            .single()

        // Só mostrar votos se eleição estiver encerrada
        const showVotes = election?.status === 'encerrada'

        const processedCandidates = candidates.map((c: any) => ({
            ...c,
            total_votos: showVotes ? c.total_votos : undefined,
            resultado: showVotes ? c.resultado : undefined,
        }))

        // Agrupar por conselho
        const grouped = {
            administracao: processedCandidates.filter((c: any) => c.conselho === 'administracao'),
            fiscal: processedCandidates.filter((c: any) => c.conselho === 'fiscal'),
            etica: processedCandidates.filter((c: any) => c.conselho === 'etica'),
        }

        return NextResponse.json({
            candidates: processedCandidates,
            grouped,
            showVotes,
        })
    } catch (error) {
        console.error('Error in GET /api/elections/[id]/candidates:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}

// POST /api/elections/[id]/candidates - Inscrever candidatura
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: electionId } = await params
        const supabase = await createClient()
        const adminClient = await createAdminClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Buscar estudante
        const { data: student } = await (adminClient
            .from('students') as any)
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!student) {
            return NextResponse.json({ error: 'Apenas estudantes podem se candidatar' }, { status: 403 })
        }

        // Buscar eleição
        const { data: election } = await (adminClient
            .from('elections') as any)
            .select('*')
            .eq('id', electionId)
            .single()

        if (!election) {
            return NextResponse.json({ error: 'Eleição não encontrada' }, { status: 404 })
        }

        // Verificar período de inscrições
        if (election.status !== 'inscricoes') {
            return NextResponse.json({ error: '⏰ O período de inscrições não está aberto' }, { status: 400 })
        }

        const now = new Date()
        if (election.data_inicio_inscricoes && new Date(election.data_inicio_inscricoes) > now) {
            return NextResponse.json({ error: '⏰ O período de inscrições ainda não começou' }, { status: 400 })
        }
        if (election.data_fim_inscricoes && new Date(election.data_fim_inscricoes) < now) {
            return NextResponse.json({ error: '⏰ O período de inscrições já terminou' }, { status: 400 })
        }

        const body = await request.json()
        const { conselho, proposta } = body

        // Validações
        if (!conselho || !['administracao', 'fiscal', 'etica'].includes(conselho)) {
            return NextResponse.json({ error: 'Conselho inválido' }, { status: 400 })
        }

        if (!proposta) {
            return NextResponse.json({ error: '📝 A proposta é obrigatória' }, { status: 400 })
        }

        if (proposta.length < 50) {
            return NextResponse.json({ error: '📝 Sua proposta precisa ter pelo menos 50 caracteres' }, { status: 400 })
        }

        if (proposta.length > 500) {
            return NextResponse.json({ error: '📝 Sua proposta não pode ter mais de 500 caracteres' }, { status: 400 })
        }

        // Verificar se já é candidato
        const { data: existingCandidate } = await (adminClient
            .from('candidates') as any)
            .select('id, conselho')
            .eq('election_id', electionId)
            .eq('student_id', student.id)
            .single()

        if (existingCandidate) {
            return NextResponse.json({
                error: `👤 Você já é candidato no Conselho de ${existingCandidate.conselho === 'administracao' ? 'Administração' : existingCandidate.conselho === 'fiscal' ? 'Fiscal' : 'Ética'}`
            }, { status: 400 })
        }

        // Criar candidatura
        const { data: candidate, error } = await (adminClient
            .from('candidates') as any)
            .insert({
                election_id: electionId,
                student_id: student.id,
                conselho,
                proposta,
                aprovado: true,
            })
            .select(`
                *,
                student:students(id, name)
            `)
            .single()

        if (error) {
            console.error('Error creating candidate:', error)
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: '👤 Você já é candidato nesta eleição' }, { status: 400 })
            }
            return NextResponse.json({ error: 'Erro ao registrar candidatura' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            candidate,
            message: '✅ Candidatura registrada com sucesso!'
        }, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/elections/[id]/candidates:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
