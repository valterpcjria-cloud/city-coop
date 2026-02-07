'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icons } from '@/components/ui/icons'

interface Candidate {
    id: string
    conselho: string
    proposta: string
    student: {
        id: string
        name: string
    }
}

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

const statusConfig: Record<string, { label: string; color: string }> = {
    configuracao: { label: 'Configuração', color: 'bg-slate-500' },
    inscricoes: { label: 'Inscrições Abertas', color: 'bg-green-500' },
    campanha: { label: 'Campanha', color: 'bg-blue-500' },
    votacao: { label: 'Votação', color: 'bg-coop-orange' },
    encerrada: { label: 'Encerrada', color: 'bg-tech-gray' },
}

export default function ElectionDetailsPage() {
    const params = useParams()
    const electionId = params.id as string

    const [election, setElection] = useState<Election | null>(null)
    const [candidates, setCandidates] = useState<{
        administracao: Candidate[]
        fiscal: Candidate[]
        etica: Candidate[]
    }>({ administracao: [], fiscal: [], etica: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [electionId])

    const fetchData = async () => {
        try {
            const [electionRes, candidatesRes] = await Promise.all([
                fetch(`/api/elections/${electionId}`),
                fetch(`/api/elections/${electionId}/candidates`)
            ])

            const electionData = await electionRes.json()
            const candidatesData = await candidatesRes.json()

            setElection(electionData.election)
            setCandidates(candidatesData.grouped || { administracao: [], fiscal: [], etica: [] })
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
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

    if (!election) {
        return (
            <div className="text-center py-12">
                <p className="text-tech-gray">Eleição não encontrada</p>
            </div>
        )
    }

    const status = statusConfig[election.status] || statusConfig.configuracao

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Button variant="ghost" size="sm" className="mb-2" asChild>
                        <Link href="/estudante/eleicoes">
                            <Icons.chevronLeft className="h-4 w-4 mr-1" />
                            Voltar
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold text-city-blue">
                        Eleição - {election.class?.name}
                    </h1>
                </div>
                <Badge className={`${status.color} text-white text-sm`}>
                    {status.label}
                </Badge>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <span className="text-3xl">🏛️</span>
                            <h3 className="font-semibold mt-2">Administração</h3>
                            <p className="text-2xl font-bold text-city-blue">{election.vagas_administracao}</p>
                            <p className="text-xs text-tech-gray">vagas</p>
                            <p className="text-sm mt-1">{candidates.administracao.length} candidatos</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <span className="text-3xl">📊</span>
                            <h3 className="font-semibold mt-2">Fiscal</h3>
                            <p className="text-2xl font-bold text-city-blue">{election.vagas_fiscal_efetivos}</p>
                            <p className="text-xs text-tech-gray">+ {election.vagas_fiscal_suplentes} suplentes</p>
                            <p className="text-sm mt-1">{candidates.fiscal.length} candidatos</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <span className="text-3xl">⚖️</span>
                            <h3 className="font-semibold mt-2">Ética</h3>
                            <p className="text-2xl font-bold text-city-blue">{election.vagas_etica}</p>
                            <p className="text-xs text-tech-gray">vagas</p>
                            <p className="text-sm mt-1">{candidates.etica.length} candidatos</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <span className="text-3xl">📅</span>
                            <h3 className="font-semibold mt-2">Votação</h3>
                            <p className="text-sm text-tech-gray">{formatDate(election.data_inicio_votacao)}</p>
                            <p className="text-xs">até</p>
                            <p className="text-sm text-tech-gray">{formatDate(election.data_fim_votacao)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Candidates by Council */}
            <Card>
                <CardHeader>
                    <CardTitle>Candidatos Inscritos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="administracao" className="w-full">
                        <TabsList className="w-full">
                            <TabsTrigger value="administracao" className="flex-1">
                                🏛️ Administração ({candidates.administracao.length})
                            </TabsTrigger>
                            <TabsTrigger value="fiscal" className="flex-1">
                                📊 Fiscal ({candidates.fiscal.length})
                            </TabsTrigger>
                            <TabsTrigger value="etica" className="flex-1">
                                ⚖️ Ética ({candidates.etica.length})
                            </TabsTrigger>
                        </TabsList>

                        {(['administracao', 'fiscal', 'etica'] as const).map(conselho => (
                            <TabsContent key={conselho} value={conselho} className="mt-4">
                                {candidates[conselho].length === 0 ? (
                                    <p className="text-center py-8 text-tech-gray">
                                        Nenhum candidato inscrito
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {candidates[conselho].map(candidato => (
                                            <div key={candidato.id} className="p-4 bg-slate-50 rounded-lg">
                                                <h4 className="font-semibold text-city-blue">
                                                    {candidato.student?.name}
                                                </h4>
                                                <p className="text-sm text-tech-gray mt-1">
                                                    {candidato.proposta}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Actions */}
            {election.status === 'votacao' && (
                <div className="flex justify-center">
                    <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 text-white" asChild>
                        <Link href={`/estudante/eleicoes/${electionId}/votar`}>
                            <Icons.vote className="h-5 w-5 mr-2" />
                            Votar Agora
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
