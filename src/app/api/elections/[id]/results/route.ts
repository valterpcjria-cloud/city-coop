import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/elections/[id]/results - Obter resultados da eleição
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: electionId } = await params
        const supabase = await createClient()
        const adminClient = await createAdminClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Buscar eleição
        const { data: election } = await adminClient
            .from('elections')
            .select(`
                *,
                class:classes(id, name, code, teacher_id)
            `)
            .eq('id', electionId)
            .single()

        if (!election) {
            return NextResponse.json({ error: 'Eleição não encontrada' }, { status: 404 })
        }

        // Verificar se é professor da turma
        const { data: teacher } = await adminClient
            .from('teachers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        const isTeacher = teacher && (election.class as any)?.teacher_id === teacher.id

        // Só mostrar resultados se eleição encerrada OU se for professor
        if (election.status !== 'encerrada' && !isTeacher) {
            return NextResponse.json({
                error: 'Resultados disponíveis apenas após encerramento da eleição',
                status: election.status
            }, { status: 403 })
        }

        // Buscar candidatos com votos
        const { data: candidates } = await adminClient
            .from('candidates')
            .select(`
                *,
                student:students(id, name, email)
            `)
            .eq('election_id', electionId)
            .order('total_votos', { ascending: false })

        if (!candidates) {
            return NextResponse.json({ error: 'Erro ao buscar candidatos' }, { status: 500 })
        }

        // Buscar estatísticas de votação
        const { data: voteControls } = await adminClient
            .from('vote_controls')
            .select('*')
            .eq('election_id', electionId)

        const totalVotantes = voteControls?.length || 0

        // Processar resultados por conselho
        const processResults = (conselho: string, vagas: number, vagasSuplentes: number = 0) => {
            const conselhoCandiates = candidates.filter(c => c.conselho === conselho)

            return conselhoCandiates.map((candidato, index) => {
                let resultado: string | null = null

                if (election.status === 'encerrada') {
                    if (index < vagas) {
                        resultado = 'eleito_efetivo'
                    } else if (conselho === 'fiscal' && index < vagas + vagasSuplentes) {
                        resultado = 'eleito_suplente'
                    } else {
                        resultado = 'nao_eleito'
                    }
                }

                return {
                    ...candidato,
                    resultado,
                    posicao: index + 1,
                }
            })
        }

        const resultados = {
            administracao: processResults('administracao', election.vagas_administracao),
            fiscal: processResults('fiscal', election.vagas_fiscal_efetivos, election.vagas_fiscal_suplentes),
            etica: processResults('etica', election.vagas_etica),
        }

        // Se eleição encerrada, atualizar resultados no banco
        if (election.status === 'encerrada') {
            for (const conselho of Object.values(resultados)) {
                for (const candidato of conselho) {
                    if (candidato.resultado) {
                        await adminClient
                            .from('candidates')
                            .update({ resultado: candidato.resultado })
                            .eq('id', candidato.id)
                    }
                }
            }
        }

        return NextResponse.json({
            election,
            resultados,
            estatisticas: {
                totalVotantes,
                totalCandidatos: candidates.length,
                porConselho: {
                    administracao: resultados.administracao.length,
                    fiscal: resultados.fiscal.length,
                    etica: resultados.etica.length,
                }
            },
            isTeacher,
        })
    } catch (error) {
        console.error('Error in GET /api/elections/[id]/results:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}

// POST /api/elections/[id]/results - Encerrar eleição e apurar resultados
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: electionId } = await params
        const supabase = await createClient()
        const adminClient = await createAdminClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Verificar se é professor
        const { data: teacher } = await adminClient
            .from('teachers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!teacher) {
            return NextResponse.json({ error: 'Apenas professores podem encerrar eleições' }, { status: 403 })
        }

        // Buscar eleição
        const { data: election } = await adminClient
            .from('elections')
            .select(`
                *,
                class:classes(id, name, teacher_id)
            `)
            .eq('id', electionId)
            .single()

        if (!election) {
            return NextResponse.json({ error: 'Eleição não encontrada' }, { status: 404 })
        }

        if ((election.class as any)?.teacher_id !== teacher.id) {
            return NextResponse.json({ error: 'Você não é responsável por esta eleição' }, { status: 403 })
        }

        if (election.status === 'encerrada') {
            return NextResponse.json({ error: 'Eleição já está encerrada' }, { status: 400 })
        }

        // Atualizar status para encerrada
        const { error: updateError } = await adminClient
            .from('elections')
            .update({ status: 'encerrada' })
            .eq('id', electionId)

        if (updateError) {
            console.error('Error closing election:', updateError)
            return NextResponse.json({ error: 'Erro ao encerrar eleição' }, { status: 500 })
        }

        // Buscar candidatos e calcular resultados
        const { data: candidates } = await adminClient
            .from('candidates')
            .select('*')
            .eq('election_id', electionId)
            .order('total_votos', { ascending: false })

        if (candidates) {
            // Calcular e atualizar resultados
            const updateResults = async (conselho: string, vagas: number, vagasSuplentes: number = 0) => {
                const conselhoCandidates = candidates.filter(c => c.conselho === conselho)

                for (let i = 0; i < conselhoCandidates.length; i++) {
                    let resultado: string
                    if (i < vagas) {
                        resultado = 'eleito_efetivo'
                    } else if (conselho === 'fiscal' && i < vagas + vagasSuplentes) {
                        resultado = 'eleito_suplente'
                    } else {
                        resultado = 'nao_eleito'
                    }

                    await adminClient
                        .from('candidates')
                        .update({ resultado })
                        .eq('id', conselhoCandidates[i].id)
                }
            }

            await updateResults('administracao', election.vagas_administracao)
            await updateResults('fiscal', election.vagas_fiscal_efetivos, election.vagas_fiscal_suplentes)
            await updateResults('etica', election.vagas_etica)
        }

        return NextResponse.json({
            success: true,
            message: '✅ Eleição encerrada e resultados apurados com sucesso!'
        })
    } catch (error) {
        console.error('Error in POST /api/elections/[id]/results:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
