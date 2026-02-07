'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'

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
    created_at: string
    class: {
        id: string
        name: string
        code: string
    }
}

const statusConfig: Record<string, { label: string; color: string }> = {
    configuracao: { label: 'Configuração', color: 'bg-slate-500' },
    inscricoes: { label: 'Inscrições', color: 'bg-green-500' },
    campanha: { label: 'Campanha', color: 'bg-blue-500' },
    votacao: { label: 'Votação', color: 'bg-coop-orange' },
    encerrada: { label: 'Encerrada', color: 'bg-tech-gray' },
}

export default function TeacherElectionsPage() {
    const [elections, setElections] = useState<Election[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchElections()
    }, [])

    const fetchElections = async () => {
        try {
            const response = await fetch('/api/elections')
            const data = await response.json()
            setElections(data.elections || [])
        } catch (error) {
            console.error('Error fetching elections:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
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
                        Gerenciar Eleições
                    </h1>
                    <p className="text-tech-gray mt-1">
                        Configure e acompanhe as eleições dos Conselhos
                    </p>
                </div>
                <Button asChild className="bg-gradient-to-r from-city-blue to-coop-orange text-white">
                    <Link href="/professor/eleicoes/nova">
                        <Icons.add className="h-5 w-5 mr-2" />
                        Nova Eleição
                    </Link>
                </Button>
            </div>

            {/* Elections List */}
            {elections.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Icons.vote className="h-12 w-12 text-tech-gray/50 mb-4" />
                        <h3 className="text-lg font-semibold text-tech-gray">Nenhuma eleição criada</h3>
                        <p className="text-sm text-tech-gray/70 mb-4">
                            Crie a primeira eleição para sua turma
                        </p>
                        <Button asChild>
                            <Link href="/professor/eleicoes/nova">
                                <Icons.add className="h-4 w-4 mr-2" />
                                Criar Eleição
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {elections.map((election) => {
                        const status = statusConfig[election.status] || statusConfig.configuracao

                        return (
                            <Card key={election.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl text-city-blue">
                                                Eleição - {election.class?.name}
                                            </CardTitle>
                                            <CardDescription>
                                                Criada em {formatDate(election.created_at)}
                                            </CardDescription>
                                        </div>
                                        <Badge className={`${status.color} text-white`}>
                                            {status.label}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Quick Info */}
                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                        <div className="bg-slate-50 p-2 rounded text-center">
                                            <span className="block font-bold text-city-blue">{election.vagas_administracao}</span>
                                            <span className="text-xs text-tech-gray">Admin.</span>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded text-center">
                                            <span className="block font-bold text-city-blue">{election.vagas_fiscal_efetivos}+{election.vagas_fiscal_suplentes}</span>
                                            <span className="text-xs text-tech-gray">Fiscal</span>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded text-center">
                                            <span className="block font-bold text-city-blue">{election.vagas_etica}</span>
                                            <span className="text-xs text-tech-gray">Ética</span>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded text-center">
                                            <span className="block font-bold">{formatDate(election.data_inicio_votacao)}</span>
                                            <span className="text-xs text-tech-gray">Votação</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/professor/eleicoes/${election.id}`}>
                                                Gerenciar
                                            </Link>
                                        </Button>
                                        {election.status === 'encerrada' && (
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/professor/eleicoes/${election.id}/resultados`}>
                                                    Ver Resultados
                                                </Link>
                                            </Button>
                                        )}
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
