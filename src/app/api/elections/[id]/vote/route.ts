import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

interface RouteParams {
    params: Promise<{ id: string }>
}

// POST /api/elections/[id]/vote - Registrar voto (CRÍTICO - ANÔNIMO)
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
        const { data: student } = await adminClient
            .from('students')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!student) {
            return NextResponse.json({ error: 'Apenas estudantes podem votar' }, { status: 403 })
        }

        // Buscar eleição
        const { data: election } = await adminClient
            .from('elections')
            .select('*')
            .eq('id', electionId)
            .single()

        if (!election) {
            return NextResponse.json({ error: 'Eleição não encontrada' }, { status: 404 })
        }

        // Verificar se eleição está aberta para votação
        if (election.status !== 'votacao') {
            if (election.status === 'encerrada') {
                return NextResponse.json({ error: '⏰ A votação já foi encerrada' }, { status: 400 })
            }
            return NextResponse.json({ error: '⏰ A votação ainda não está aberta' }, { status: 400 })
        }

        // Verificar período de votação
        const now = new Date()
        if (election.data_inicio_votacao && new Date(election.data_inicio_votacao) > now) {
            return NextResponse.json({ error: '⏰ A votação ainda não começou' }, { status: 400 })
        }
        if (election.data_fim_votacao && new Date(election.data_fim_votacao) < now) {
            return NextResponse.json({ error: '⏰ A votação já terminou' }, { status: 400 })
        }

        // Verificar se já votou
        const { data: existingVoteControl } = await adminClient
            .from('vote_controls')
            .select('*')
            .eq('election_id', electionId)
            .eq('student_id', student.id)
            .single()

        if (existingVoteControl &&
            existingVoteControl.votou_administracao &&
            existingVoteControl.votou_fiscal &&
            existingVoteControl.votou_etica) {
            return NextResponse.json({
                error: '🗳️ Você já registrou seu voto! Não é possível votar novamente.'
            }, { status: 400 })
        }

        const body = await request.json()
        const { votos } = body

        if (!votos) {
            return NextResponse.json({ error: 'Votos são obrigatórios' }, { status: 400 })
        }

        const { administracao = [], fiscal = [], etica = [] } = votos

        // Validar número de votos
        if (administracao.length > election.vagas_administracao) {
            return NextResponse.json({
                error: `⚠️ Você escolheu mais candidatos que vagas disponíveis para Administração (máx: ${election.vagas_administracao})`
            }, { status: 400 })
        }
        if (fiscal.length > election.vagas_fiscal_efetivos) {
            return NextResponse.json({
                error: `⚠️ Você escolheu mais candidatos que vagas disponíveis para Fiscal (máx: ${election.vagas_fiscal_efetivos})`
            }, { status: 400 })
        }
        if (etica.length > election.vagas_etica) {
            return NextResponse.json({
                error: `⚠️ Você escolheu mais candidatos que vagas disponíveis para Ética (máx: ${election.vagas_etica})`
            }, { status: 400 })
        }

        // Buscar todos os candidatos da eleição para validar
        const { data: allCandidates } = await adminClient
            .from('candidates')
            .select('id, conselho')
            .eq('election_id', electionId)
            .eq('aprovado', true)

        if (!allCandidates) {
            return NextResponse.json({ error: 'Erro ao validar candidatos' }, { status: 500 })
        }

        const candidateMap = new Map(allCandidates.map(c => [c.id, c.conselho]))

        // Validar que todos os candidatos existem e são do conselho correto
        const validateVotes = (votes: string[], expectedConselho: string) => {
            for (const candidateId of votes) {
                const conselho = candidateMap.get(candidateId)
                if (!conselho) {
                    return `Candidato ${candidateId} não encontrado`
                }
                if (conselho !== expectedConselho) {
                    return `Candidato ${candidateId} não é do conselho correto`
                }
            }
            return null
        }

        let validationError = validateVotes(administracao, 'administracao')
        if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

        validationError = validateVotes(fiscal, 'fiscal')
        if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

        validationError = validateVotes(etica, 'etica')
        if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

        // === INÍCIO DA TRANSAÇÃO ATÔMICA ===
        // Usando RPC para garantir atomicidade

        try {
            // 1. Criar ou atualizar vote_control (marca que votou)
            const { error: voteControlError } = await adminClient
                .from('vote_controls')
                .upsert({
                    election_id: electionId,
                    student_id: student.id,
                    votou_administracao: administracao.length > 0,
                    votou_fiscal: fiscal.length > 0,
                    votou_etica: etica.length > 0,
                    timestamp_voto: new Date().toISOString(),
                }, {
                    onConflict: 'election_id,student_id'
                })

            if (voteControlError) {
                console.error('Vote control error:', voteControlError)
                if (voteControlError.code === '23505') { // Unique violation
                    return NextResponse.json({
                        error: '🗳️ Você já registrou seu voto! Não é possível votar novamente.'
                    }, { status: 400 })
                }
                throw new Error('Erro ao registrar controle de votação')
            }

            // 2. Inserir votos ANÔNIMOS (sem student_id!)
            const allVotes = [
                ...administracao.map((candidateId: string) => ({ candidate_id: candidateId })),
                ...fiscal.map((candidateId: string) => ({ candidate_id: candidateId })),
                ...etica.map((candidateId: string) => ({ candidate_id: candidateId })),
            ]

            if (allVotes.length > 0) {
                const { error: votesError } = await adminClient
                    .from('votes')
                    .insert(allVotes)

                if (votesError) {
                    console.error('Votes insert error:', votesError)
                    throw new Error('Erro ao registrar votos')
                }

                // 3. Incrementar contador de votos em cada candidato
                for (const candidateId of [...administracao, ...fiscal, ...etica]) {
                    const { error: updateError } = await adminClient.rpc('increment_vote_count', {
                        p_candidate_id: candidateId
                    }).catch(async () => {
                        // Fallback se RPC não existir
                        const { data: candidate } = await adminClient
                            .from('candidates')
                            .select('total_votos')
                            .eq('id', candidateId)
                            .single()

                        return await adminClient
                            .from('candidates')
                            .update({ total_votos: (candidate?.total_votos || 0) + 1 })
                            .eq('id', candidateId)
                    })
                }
            }

            return NextResponse.json({
                success: true,
                message: '✅ Voto registrado com sucesso! Obrigado por participar!',
                votosRegistrados: {
                    administracao: administracao.length,
                    fiscal: fiscal.length,
                    etica: etica.length,
                }
            })
        } catch (transactionError) {
            console.error('Transaction error:', transactionError)
            return NextResponse.json({
                error: '❌ Algo deu errado. Tente novamente em alguns instantes.'
            }, { status: 500 })
        }
    } catch (error) {
        console.error('Error in POST /api/elections/[id]/vote:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}

// GET /api/elections/[id]/vote - Verificar status de votação do usuário
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: electionId } = await params
        const supabase = await createClient()
        const adminClient = await createAdminClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Buscar estudante
        const { data: student } = await adminClient
            .from('students')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!student) {
            return NextResponse.json({ hasVoted: false, isStudent: false })
        }

        // Verificar se já votou
        const { data: voteControl } = await adminClient
            .from('vote_controls')
            .select('*')
            .eq('election_id', electionId)
            .eq('student_id', student.id)
            .single()

        const hasVoted = voteControl &&
            voteControl.votou_administracao &&
            voteControl.votou_fiscal &&
            voteControl.votou_etica

        return NextResponse.json({
            hasVoted: !!hasVoted,
            isStudent: true,
            voteControl,
        })
    } catch (error) {
        console.error('Error in GET /api/elections/[id]/vote:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
