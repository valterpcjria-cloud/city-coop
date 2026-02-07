'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'

interface CandidateResult {
    id: string
    proposta: string
    total_votos: number
    resultado: string | null
    posicao: number
    student: {
        id: string
        name: string
    }
}

interface ResultsData {
    election: any
    resultados: {
        administracao: CandidateResult[]
        fiscal: CandidateResult[]
        etica: CandidateResult[]
    }
    estatisticas: {
        totalVotantes: number
        totalCandidatos: number
    }
}

const resultBadge: Record<string, { label: string; color: string }> = {
    eleito_efetivo: { label: 'ELEITO', color: 'bg-green-500' },
    eleito_suplente: { label: 'SUPLENTE', color: 'bg-blue-500' },
    nao_eleito: { label: 'Não eleito', color: 'bg-gray-400' },
}

export default function TeacherResultsPage() {
    const params = useParams()
    const electionId = params.id as string

    const [data, setData] = useState<ResultsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [generatingAta, setGeneratingAta] = useState(false)

    useEffect(() => {
        fetchResults()
    }, [electionId])

    const fetchResults = async () => {
        try {
            const response = await fetch(`/api/elections/${electionId}/results`)
            const result = await response.json()
            setData(result)
        } catch (err) {
            console.error('Error fetching results:', err)
        } finally {
            setLoading(false)
        }
    }

    const generateAta = async () => {
        setGeneratingAta(true)
        try {
            toast.info('🤖 Gerando Ata Eleitoral com IA...')
            // TODO: Implement AI-generated ata
            setTimeout(() => {
                toast.success('✅ Ata eleitoral gerada! (Implementação pendente)')
                setGeneratingAta(false)
            }, 2000)
        } catch (error) {
            toast.error('Erro ao gerar ata')
            setGeneratingAta(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Icons.spinner className="h-8 w-8 animate-spin text-city-blue" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-tech-gray">Resultados não disponíveis</p>
            </div>
        )
    }

    const renderConselho = (titulo: string, emoji: string, candidatos: CandidateResult[]) => (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-city-blue/10 to-coop-orange/10">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <span className="text-2xl">{emoji}</span>
                    {titulo}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                {candidatos.length === 0 ? (
                    <p className="text-center py-4 text-tech-gray">Nenhum candidato</p>
                ) : (
                    <div className="space-y-3">
                        {candidatos.map((candidato) => {
                            const badge = candidato.resultado ? resultBadge[candidato.resultado] : null
                            const isEleito = candidato.resultado === 'eleito_efetivo' || candidato.resultado === 'eleito_suplente'

                            return (
                                <div
                                    key={candidato.id}
                                    className={`p-4 rounded-lg border-2 ${isEleito ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-2xl font-bold ${isEleito ? 'text-green-600' : 'text-tech-gray'
                                                }`}>
                                                {candidato.posicao}º
                                            </span>
                                            <div>
                                                <h4 className="font-semibold text-city-blue">
                                                    {candidato.student?.name}
                                                </h4>
                                                <p className="text-sm text-tech-gray">
                                                    {candidato.total_votos} voto{candidato.total_votos !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        {badge && (
                                            <Badge className={`${badge.color} text-white`}>
                                                {badge.label}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Button variant="ghost" size="sm" className="mb-2" asChild>
                        <Link href={`/professor/eleicoes/${electionId}`}>
                            <Icons.chevronLeft className="h-4 w-4 mr-1" />
                            Voltar
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold text-city-blue flex items-center gap-3">
                        🏆 Resultados da Eleição
                    </h1>
                    <p className="text-tech-gray mt-1">
                        {data.election.class?.name}
                    </p>
                </div>
                <Button
                    onClick={generateAta}
                    disabled={generatingAta}
                    className="bg-gradient-to-r from-city-blue to-coop-orange text-white"
                >
                    {generatingAta ? (
                        <>
                            <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                            Gerando...
                        </>
                    ) : (
                        <>
                            <Icons.ai className="h-4 w-4 mr-2" />
                            Gerar Ata com IA
                        </>
                    )}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-city-blue/10 to-city-blue/5">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-city-blue">
                                {data.estatisticas.totalVotantes}
                            </p>
                            <p className="text-tech-gray">Votantes</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-coop-orange/10 to-coop-orange/5">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-coop-orange">
                                {data.estatisticas.totalCandidatos}
                            </p>
                            <p className="text-tech-gray">Candidatos</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-100 to-green-50">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-green-600">
                                {data.resultados.administracao.filter(c => c.resultado?.includes('eleito')).length +
                                    data.resultados.fiscal.filter(c => c.resultado?.includes('eleito')).length +
                                    data.resultados.etica.filter(c => c.resultado?.includes('eleito')).length}
                            </p>
                            <p className="text-tech-gray">Eleitos</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Results by Council */}
            <div className="space-y-6">
                {renderConselho('Conselho de Administração', '🏛️', data.resultados.administracao)}
                {renderConselho('Conselho Fiscal', '📊', data.resultados.fiscal)}
                {renderConselho('Conselho de Ética', '⚖️', data.resultados.etica)}
            </div>
        </div>
    )
}
