'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'

interface Candidate {
    id: string
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
    vagas_etica: number
}

interface Conselho {
    id: 'administracao' | 'fiscal' | 'etica'
    nome: string
    vagas: number
}

export default function VotingWizardPage() {
    const params = useParams()
    const router = useRouter()
    const electionId = params.id as string

    const [step, setStep] = useState(1) // 1=Admin, 2=Fiscal, 3=Ética, 4=Confirmação
    const [election, setElection] = useState<Election | null>(null)
    const [candidates, setCandidates] = useState<{
        administracao: Candidate[]
        fiscal: Candidate[]
        etica: Candidate[]
    }>({ administracao: [], fiscal: [], etica: [] })
    const [votos, setVotos] = useState<{
        administracao: string[]
        fiscal: string[]
        etica: string[]
    }>({ administracao: [], fiscal: [], etica: [] })
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const conselhos: Conselho[] = [
        { id: 'administracao', nome: 'Conselho de Administração', vagas: election?.vagas_administracao || 3 },
        { id: 'fiscal', nome: 'Conselho Fiscal', vagas: election?.vagas_fiscal_efetivos || 3 },
        { id: 'etica', nome: 'Conselho de Ética', vagas: election?.vagas_etica || 3 },
    ]

    useEffect(() => {
        fetchData()
    }, [electionId])

    const fetchData = async () => {
        try {
            // Fetch election details
            const electionRes = await fetch(`/api/elections/${electionId}`)
            const electionData = await electionRes.json()

            if (!electionData.election || electionData.election.status !== 'votacao') {
                toast.error('Esta eleição não está aberta para votação')
                router.push('/estudante/eleicoes')
                return
            }

            setElection(electionData.election)

            // Check if already voted
            const voteRes = await fetch(`/api/elections/${electionId}/vote`)
            const voteData = await voteRes.json()

            if (voteData.hasVoted) {
                toast.info('Você já votou nesta eleição')
                router.push('/estudante/eleicoes')
                return
            }

            // Fetch candidates
            const candidatesRes = await fetch(`/api/elections/${electionId}/candidates`)
            const candidatesData = await candidatesRes.json()

            setCandidates(candidatesData.grouped || { administracao: [], fiscal: [], etica: [] })
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Erro ao carregar dados da eleição')
        } finally {
            setLoading(false)
        }
    }

    const conselhoAtual = conselhos[step - 1]

    const toggleVoto = (candidatoId: string) => {
        if (!conselhoAtual) return

        const conselhoId = conselhoAtual.id
        const votosAtuais = votos[conselhoId]

        if (votosAtuais.includes(candidatoId)) {
            // Desmarcar
            setVotos({
                ...votos,
                [conselhoId]: votosAtuais.filter(id => id !== candidatoId)
            })
        } else {
            // Marcar (se não exceder vagas)
            if (votosAtuais.length < conselhoAtual.vagas) {
                setVotos({
                    ...votos,
                    [conselhoId]: [...votosAtuais, candidatoId]
                })
            } else {
                toast.warning(`Você só pode escolher até ${conselhoAtual.vagas} candidatos!`)
            }
        }
    }

    const proximoPasso = () => {
        if (step < 4) setStep(step + 1)
    }

    const voltarPasso = () => {
        if (step > 1) setStep(step - 1)
    }

    const confirmarVoto = async () => {
        setSubmitting(true)
        try {
            const response = await fetch(`/api/elections/${electionId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ votos })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('✅ Voto registrado com sucesso!')
                router.push('/estudante/eleicoes')
            } else {
                toast.error(data.error || 'Erro ao registrar voto')
            }
        } catch (error) {
            console.error('Error submitting vote:', error)
            toast.error('Erro ao registrar voto')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Icons.spinner className="h-8 w-8 animate-spin text-city-blue" />
            </div>
        )
    }

    // Renderizar steps 1, 2, 3 (votação por conselho)
    if (step <= 3 && conselhoAtual) {
        const candidatosDoConselho = candidates[conselhoAtual.id] || []
        const votosEscolhidos = votos[conselhoAtual.id]

        return (
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Progress */}
                <Card className="border-city-blue/20 bg-gradient-to-r from-city-blue/5 to-coop-orange/5">
                    <CardContent className="pt-6">
                        <div className="flex justify-between mb-3 text-sm font-medium">
                            {conselhos.map((c, i) => (
                                <span key={c.id} className={
                                    step > i + 1 ? 'text-green-600' :
                                        step === i + 1 ? 'text-city-blue' : 'text-tech-gray'
                                }>
                                    {step > i + 1 && <Icons.check className="inline h-4 w-4 mr-1" />}
                                    {c.nome.split(' ').slice(-1)[0]}
                                </span>
                            ))}
                            <span className={step === 4 ? 'text-city-blue' : 'text-tech-gray'}>
                                Confirmação
                            </span>
                        </div>
                        <Progress value={(step / 4) * 100} className="h-2" />
                    </CardContent>
                </Card>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-city-blue mb-2">
                        {conselhoAtual.nome}
                    </h1>
                    <p className="text-tech-gray">
                        Escolha até <span className="font-bold text-coop-orange">{conselhoAtual.vagas}</span> candidatos
                        <span className="mx-2">|</span>
                        Você escolheu: <span className="font-bold text-city-blue">{votosEscolhidos.length}</span> de {conselhoAtual.vagas}
                    </p>
                </div>

                {/* Candidates */}
                {candidatosDoConselho.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                            <Icons.user className="h-12 w-12 text-tech-gray/50 mx-auto mb-4" />
                            <p className="text-tech-gray">Nenhum candidato inscrito neste conselho</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {candidatosDoConselho.map(candidato => (
                            <Card
                                key={candidato.id}
                                onClick={() => toggleVoto(candidato.id)}
                                className={`cursor-pointer transition-all hover:shadow-md ${votosEscolhidos.includes(candidato.id)
                                        ? 'border-2 border-city-blue bg-city-blue/5 ring-2 ring-city-blue/20'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${votosEscolhidos.includes(candidato.id)
                                                ? 'bg-city-blue border-city-blue'
                                                : 'border-gray-300'
                                            }`}>
                                            {votosEscolhidos.includes(candidato.id) && (
                                                <Icons.check className="h-4 w-4 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-city-blue mb-2">
                                                {candidato.student?.name || 'Candidato'}
                                            </h3>
                                            <p className="text-tech-gray text-sm leading-relaxed">
                                                {candidato.proposta}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                    <Button
                        onClick={voltarPasso}
                        disabled={step === 1}
                        variant="outline"
                        size="lg"
                    >
                        <Icons.chevronLeft className="h-5 w-5 mr-2" />
                        Voltar
                    </Button>

                    <Button
                        onClick={proximoPasso}
                        size="lg"
                        className="bg-gradient-to-r from-city-blue to-coop-orange text-white"
                    >
                        {step === 3 ? 'Revisar Votos' : 'Próximo Conselho'}
                        <Icons.chevronRight className="h-5 w-5 ml-2" />
                    </Button>
                </div>
            </div>
        )
    }

    // Step 4: Confirmação
    if (step === 4) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-city-blue mb-2">
                        Confirme seus Votos
                    </h1>
                    <p className="text-tech-gray">
                        Revise suas escolhas antes de confirmar
                    </p>
                </div>

                {/* Summary */}
                <div className="space-y-4">
                    {conselhos.map(conselho => {
                        const votosConselho = votos[conselho.id]
                        const candidatosConselho = candidates[conselho.id]

                        return (
                            <Card key={conselho.id} className="bg-slate-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg text-city-blue">
                                        {conselho.nome}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {votosConselho.length === 0 ? (
                                        <p className="text-tech-gray/70 italic">Nenhum candidato selecionado</p>
                                    ) : (
                                        <ul className="space-y-1">
                                            {votosConselho.map(candidatoId => {
                                                const candidato = candidatosConselho.find(c => c.id === candidatoId)
                                                return (
                                                    <li key={candidatoId} className="flex items-center gap-2">
                                                        <Icons.check className="h-4 w-4 text-green-500" />
                                                        <span className="font-medium">{candidato?.student?.name}</span>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    )}
                                    <p className="text-xs text-tech-gray mt-2">
                                        {votosConselho.length} de {conselho.vagas} votos utilizados
                                    </p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Warning */}
                <Card className="bg-amber-50 border-amber-400">
                    <CardContent className="py-4">
                        <p className="text-amber-800 font-semibold flex items-center gap-2">
                            <span className="text-xl">⚠️</span>
                            ATENÇÃO: Após confirmar, você NÃO poderá alterar seu voto!
                        </p>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <Button
                        onClick={voltarPasso}
                        variant="outline"
                        size="lg"
                        className="flex-1"
                    >
                        <Icons.chevronLeft className="h-5 w-5 mr-2" />
                        Revisar Votos
                    </Button>

                    <Button
                        onClick={confirmarVoto}
                        disabled={submitting}
                        size="lg"
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold"
                    >
                        {submitting ? (
                            <>
                                <Icons.spinner className="h-5 w-5 mr-2 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                ✅ CONFIRMAR TODOS OS VOTOS
                            </>
                        )}
                    </Button>
                </div>
            </div>
        )
    }

    return null
}
