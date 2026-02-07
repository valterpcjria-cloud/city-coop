'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { getSupabaseClient } from '@/lib/supabase/client'

interface Election {
    id: string
    status: string
    vagas_administracao: number
    vagas_fiscal_efetivos: number
    vagas_fiscal_suplentes: number
    vagas_etica: number
    data_inicio_inscricoes: string | null
    data_fim_inscricoes: string | null
    data_inicio_votacao: string | null
    data_fim_votacao: string | null
    class: {
        id: string
        name: string
        code: string
    }
}

interface VoteStatus {
    hasVoted: boolean
    isStudent: boolean
}

interface CandidateStatus {
    isCandidate: boolean
    conselho?: string
}

const statusConfig: Record<string, { label: string; color: string; description: string }> = {
    configuracao: {
        label: 'Configuração',
        color: 'bg-slate-500',
        description: 'Eleição em fase de configuração'
    },
    inscricoes: {
        label: 'Inscrições Abertas',
        color: 'bg-green-500',
        description: 'Período de candidaturas'
    },
    campanha: {
        label: 'Campanha',
        color: 'bg-blue-500',
        description: 'Período de campanha eleitoral'
    },
    votacao: {
        label: 'Votação Aberta',
        color: 'bg-coop-orange',
        description: 'Vote agora!'
    },
    encerrada: {
        label: 'Encerrada',
        color: 'bg-tech-gray',
        description: 'Resultados disponíveis'
    },
}

export default function StudentElectionsPage() {
    const [elections, setElections] = useState<Election[]>([])
    const [voteStatuses, setVoteStatuses] = useState<Record<string, VoteStatus>>({})
    const [candidateStatuses, setCandidateStatuses] = useState<Record<string, CandidateStatus>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchElections()
    }, [])

    const fetchElections = async () => {
        try {
            const response = await fetch('/api/elections')
            const data = await response.json()

            if (data.elections) {
                setElections(data.elections)

                // Fetch vote status for each election
                for (const election of data.elections) {
                    fetchVoteStatus(election.id)
                    fetchCandidateStatus(election.id)
                }
            }
        } catch (error) {
            console.error('Error fetching elections:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchVoteStatus = async (electionId: string) => {
        try {
            const response = await fetch(`/api/elections/${electionId}/vote`)
            const data = await response.json()
            setVoteStatuses(prev => ({
                ...prev,
                [electionId]: data
            }))
        } catch (error) {
            console.error('Error fetching vote status:', error)
        }
    }

    const fetchCandidateStatus = async (electionId: string) => {
        try {
            const supabase = getSupabaseClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            const response = await fetch(`/api/elections/${electionId}/candidates`)
            const data = await response.json()

            if (data.candidates) {
                // Check if current user is a candidate
                const { data: student } = await supabase
                    .from('students')
                    .select('id')
                    .eq('user_id', user.id)
                    .single() as any

                if (student) {
                    const myCandidate = data.candidates.find((c: any) => c.student_id === student.id)
                    setCandidateStatuses(prev => ({
                        ...prev,
                        [electionId]: {
                            isCandidate: !!myCandidate,
                            conselho: myCandidate?.conselho
                        }
                    }))
                }
            }
        } catch (error) {
            console.error('Error fetching candidate status:', error)
        }
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Icons.spinner className="h-8 w-8 animate-spin text-city-blue" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-city-blue flex items-center gap-3">
                        <Icons.vote className="h-8 w-8 text-coop-orange" />
                        Eleições
                    </h1>
                    <p className="text-tech-gray mt-1">
                        Participe das eleições dos Conselhos da sua cooperativa
                    </p>
                </div>
            </div>

            {/* Elections List */}
            {elections.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Icons.vote className="h-12 w-12 text-tech-gray/50 mb-4" />
                        <h3 className="text-lg font-semibold text-tech-gray">Nenhuma eleição disponível</h3>
                        <p className="text-sm text-tech-gray/70">
                            Não há eleições ativas no momento
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {elections.map((election) => {
                        const status = statusConfig[election.status] || statusConfig.configuracao
                        const voteStatus = voteStatuses[election.id]
                        const candidateStatus = candidateStatuses[election.id]

                        return (
                            <Card key={election.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-bold text-city-blue">
                                                Eleição - {election.class?.name || 'Turma'}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {status.description}
                                            </CardDescription>
                                        </div>
                                        <Badge className={`${status.color} text-white`}>
                                            {status.label}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="text-tech-gray block mb-1">Conselho Administração</span>
                                            <span className="font-bold text-city-blue">{election.vagas_administracao} vagas</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="text-tech-gray block mb-1">Conselho Fiscal</span>
                                            <span className="font-bold text-city-blue">
                                                {election.vagas_fiscal_efetivos} + {election.vagas_fiscal_suplentes} suplentes
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="text-tech-gray block mb-1">Conselho de Ética</span>
                                            <span className="font-bold text-city-blue">{election.vagas_etica} vagas</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="text-tech-gray block mb-1">Status do Voto</span>
                                            {voteStatus?.hasVoted ? (
                                                <span className="font-bold text-green-600 flex items-center gap-1">
                                                    <Icons.check className="h-4 w-4" /> Você votou
                                                </span>
                                            ) : (
                                                <span className="font-bold text-coop-orange">Pendente</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Candidate Status */}
                                    {candidateStatus?.isCandidate && (
                                        <div className="bg-gradient-to-r from-city-blue/10 to-coop-orange/10 p-4 rounded-lg border border-city-blue/20">
                                            <p className="font-semibold text-city-blue flex items-center gap-2">
                                                <Icons.user className="h-5 w-5" />
                                                Você é candidato(a) ao Conselho de {
                                                    candidateStatus.conselho === 'administracao' ? 'Administração' :
                                                        candidateStatus.conselho === 'fiscal' ? 'Fiscal' : 'Ética'
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {/* Dates */}
                                    <div className="flex flex-wrap gap-4 text-xs text-tech-gray">
                                        {election.data_inicio_inscricoes && (
                                            <span>
                                                📝 Inscrições: {formatDate(election.data_inicio_inscricoes)} - {formatDate(election.data_fim_inscricoes)}
                                            </span>
                                        )}
                                        {election.data_inicio_votacao && (
                                            <span>
                                                🗳️ Votação: {formatDate(election.data_inicio_votacao)} - {formatDate(election.data_fim_votacao)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        {election.status === 'inscricoes' && !candidateStatus?.isCandidate && (
                                            <Button asChild className="bg-gradient-to-r from-city-blue to-coop-orange text-white">
                                                <Link href={`/estudante/eleicoes/${election.id}/candidatura`}>
                                                    <Icons.add className="h-4 w-4 mr-2" />
                                                    Candidatar-se
                                                </Link>
                                            </Button>
                                        )}

                                        {election.status === 'votacao' && !voteStatus?.hasVoted && (
                                            <Button asChild className="bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse">
                                                <Link href={`/estudante/eleicoes/${election.id}/votar`}>
                                                    <Icons.vote className="h-4 w-4 mr-2" />
                                                    Votar Agora
                                                </Link>
                                            </Button>
                                        )}

                                        {election.status === 'encerrada' && (
                                            <Button asChild variant="outline">
                                                <Link href={`/estudante/eleicoes/${election.id}/resultados`}>
                                                    Ver Resultados
                                                </Link>
                                            </Button>
                                        )}

                                        <Button asChild variant="outline">
                                            <Link href={`/estudante/eleicoes/${election.id}`}>
                                                Ver Detalhes
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
