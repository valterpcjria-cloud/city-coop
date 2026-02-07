'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'

const statusConfig: Record<string, { label: string; color: string; next: string | null }> = {
    configuracao: { label: 'Configuração', color: 'bg-slate-500', next: 'inscricoes' },
    inscricoes: { label: 'Inscrições', color: 'bg-green-500', next: 'campanha' },
    campanha: { label: 'Campanha', color: 'bg-blue-500', next: 'votacao' },
    votacao: { label: 'Votação', color: 'bg-coop-orange', next: 'encerrada' },
    encerrada: { label: 'Encerrada', color: 'bg-tech-gray', next: null },
}

export default function ManageElectionPage() {
    const params = useParams()
    const router = useRouter()
    const electionId = params.id as string

    const [election, setElection] = useState<any>(null)
    const [candidates, setCandidates] = useState<any>({ administracao: [], fiscal: [], etica: [] })
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

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

    const updateStatus = async (newStatus: string) => {
        if (newStatus === 'encerrada') {
            const confirmed = window.confirm('⚠️ ATENÇÃO: Ao encerrar a eleição, os resultados serão apurados definitivamente. Continuar?')
            if (!confirmed) return
        }

        setUpdating(true)
        try {
            const response = await fetch(`/api/elections/${electionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(`Status atualizado para: ${statusConfig[newStatus].label}`)
                setElection({ ...election, status: newStatus })

                // If closed, finalize results
                if (newStatus === 'encerrada') {
                    await fetch(`/api/elections/${electionId}/results`, { method: 'POST' })
                }
            } else {
                toast.error(data.error || 'Erro ao atualizar status')
            }
        } catch (error) {
            toast.error('Erro ao atualizar status')
        } finally {
            setUpdating(false)
        }
    }

    const deleteElection = async () => {
        const confirmed = window.confirm('⚠️ Tem certeza que deseja excluir esta eleição? Esta ação não pode ser desfeita.')
        if (!confirmed) return

        try {
            const response = await fetch(`/api/elections/${electionId}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Eleição excluída')
                router.push('/professor/eleicoes')
            } else {
                toast.error(data.error || 'Erro ao excluir eleição')
            }
        } catch (error) {
            toast.error('Erro ao excluir eleição')
        }
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
    const totalCandidatos = candidates.administracao.length + candidates.fiscal.length + candidates.etica.length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Button variant="ghost" size="sm" className="mb-2" asChild>
                        <Link href="/professor/eleicoes">
                            <Icons.chevronLeft className="h-4 w-4 mr-1" />
                            Voltar
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold text-city-blue">
                        Gerenciar Eleição
                    </h1>
                    <p className="text-tech-gray">
                        {election.class?.name}
                    </p>
                </div>
                <Badge className={`${status.color} text-white text-sm px-4 py-2`}>
                    {status.label}
                </Badge>
            </div>

            {/* Status Control */}
            <Card className="bg-gradient-to-r from-city-blue/5 to-coop-orange/5 border-city-blue/20">
                <CardHeader>
                    <CardTitle className="text-lg">Controle de Status</CardTitle>
                    <CardDescription>Avance o status da eleição conforme o cronograma</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 flex-wrap">
                        {Object.entries(statusConfig).map(([key, config], index) => (
                            <div key={key} className="flex items-center gap-2">
                                <button
                                    onClick={() => key !== election.status && updateStatus(key)}
                                    disabled={updating}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${election.status === key
                                            ? `${config.color} text-white`
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {config.label}
                                </button>
                                {index < Object.keys(statusConfig).length - 1 && (
                                    <Icons.chevronRight className="h-4 w-4 text-gray-300" />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <span className="text-3xl font-bold text-city-blue">{totalCandidatos}</span>
                        <p className="text-tech-gray text-sm">Candidatos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <span className="text-3xl font-bold text-city-blue">{candidates.administracao.length}</span>
                        <p className="text-tech-gray text-sm">Administração</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <span className="text-3xl font-bold text-city-blue">{candidates.fiscal.length}</span>
                        <p className="text-tech-gray text-sm">Fiscal</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <span className="text-3xl font-bold text-city-blue">{candidates.etica.length}</span>
                        <p className="text-tech-gray text-sm">Ética</p>
                    </CardContent>
                </Card>
            </div>

            {/* Candidates List */}
            <Card>
                <CardHeader>
                    <CardTitle>Candidatos Inscritos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="administracao">
                        <TabsList className="w-full">
                            <TabsTrigger value="administracao" className="flex-1">
                                🏛️ Administração
                            </TabsTrigger>
                            <TabsTrigger value="fiscal" className="flex-1">
                                📊 Fiscal
                            </TabsTrigger>
                            <TabsTrigger value="etica" className="flex-1">
                                ⚖️ Ética
                            </TabsTrigger>
                        </TabsList>

                        {(['administracao', 'fiscal', 'etica'] as const).map(conselho => (
                            <TabsContent key={conselho} value={conselho} className="mt-4">
                                {candidates[conselho].length === 0 ? (
                                    <p className="text-center py-8 text-tech-gray">Nenhum candidato inscrito</p>
                                ) : (
                                    <div className="space-y-3">
                                        {candidates[conselho].map((candidato: any) => (
                                            <div key={candidato.id} className="p-4 bg-slate-50 rounded-lg flex items-start gap-4">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-city-blue">
                                                        {candidato.student?.name}
                                                    </h4>
                                                    <p className="text-sm text-tech-gray mt-1">
                                                        {candidato.proposta}
                                                    </p>
                                                </div>
                                                {election.status === 'encerrada' && (
                                                    <span className="text-sm font-medium">
                                                        {candidato.total_votos} votos
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-4">
                {election.status === 'encerrada' && (
                    <Button variant="outline" asChild>
                        <Link href={`/professor/eleicoes/${electionId}/resultados`}>
                            🏆 Ver Resultados
                        </Link>
                    </Button>
                )}

                {!['votacao', 'encerrada'].includes(election.status) && (
                    <Button variant="destructive" onClick={deleteElection}>
                        <Icons.trash className="h-4 w-4 mr-2" />
                        Excluir Eleição
                    </Button>
                )}
            </div>
        </div>
    )
}
