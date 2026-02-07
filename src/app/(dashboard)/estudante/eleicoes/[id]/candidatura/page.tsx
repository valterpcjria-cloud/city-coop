'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'

export default function CandidaturaPage() {
    const params = useParams()
    const router = useRouter()
    const electionId = params.id as string

    const [conselho, setConselho] = useState<string>('')
    const [proposta, setProposta] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const conselhos = [
        {
            id: 'administracao',
            nome: 'Conselho de Administração',
            descricao: 'Responsável pela gestão e administração da cooperativa',
            icon: '🏛️',
        },
        {
            id: 'fiscal',
            nome: 'Conselho Fiscal',
            descricao: 'Fiscaliza as contas e operações financeiras',
            icon: '📊',
        },
        {
            id: 'etica',
            nome: 'Conselho de Ética',
            descricao: 'Zela pelos princípios e valores cooperativistas',
            icon: '⚖️',
        },
    ]

    const handleSubmit = async () => {
        if (!conselho) {
            toast.error('Selecione um conselho para se candidatar')
            return
        }

        if (proposta.length < 50) {
            toast.error('Sua proposta precisa ter pelo menos 50 caracteres')
            return
        }

        if (proposta.length > 500) {
            toast.error('Sua proposta não pode ter mais de 500 caracteres')
            return
        }

        setSubmitting(true)
        try {
            const response = await fetch(`/api/elections/${electionId}/candidates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conselho, proposta })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('✅ Candidatura registrada com sucesso!')
                router.push('/estudante/eleicoes')
            } else {
                toast.error(data.error || 'Erro ao registrar candidatura')
            }
        } catch (error) {
            console.error('Error submitting candidacy:', error)
            toast.error('Erro ao registrar candidatura')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-city-blue mb-2">
                    Candidatura Eleitoral
                </h1>
                <p className="text-tech-gray">
                    Candidate-se para representar sua cooperativa em um dos conselhos
                </p>
            </div>

            {/* Conselho Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Escolha o Conselho</CardTitle>
                    <CardDescription>
                        Você pode se candidatar a apenas um conselho por eleição
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {conselhos.map(c => (
                        <div
                            key={c.id}
                            onClick={() => setConselho(c.id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${conselho === c.id
                                    ? 'border-city-blue bg-city-blue/5 ring-2 ring-city-blue/20'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{c.icon}</span>
                                <div>
                                    <h3 className="font-semibold text-city-blue">{c.nome}</h3>
                                    <p className="text-sm text-tech-gray">{c.descricao}</p>
                                </div>
                                {conselho === c.id && (
                                    <Icons.check className="ml-auto h-5 w-5 text-city-blue" />
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Proposta */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Sua Proposta</CardTitle>
                    <CardDescription>
                        Descreva suas ideias e o que você pretende fazer pelo conselho
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="proposta">Proposta (50-500 caracteres)</Label>
                        <Textarea
                            id="proposta"
                            value={proposta}
                            onChange={(e) => setProposta(e.target.value)}
                            placeholder="Descreva sua proposta para o conselho..."
                            className="min-h-[150px] resize-none"
                            maxLength={500}
                        />
                        <div className="flex justify-between text-xs text-tech-gray">
                            <span className={proposta.length < 50 ? 'text-red-500' : 'text-green-500'}>
                                Mínimo: 50 caracteres
                            </span>
                            <span className={proposta.length > 500 ? 'text-red-500' : ''}>
                                {proposta.length}/500 caracteres
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => router.back()}
                >
                    Cancelar
                </Button>
                <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-city-blue to-coop-orange text-white"
                    onClick={handleSubmit}
                    disabled={submitting || !conselho || proposta.length < 50}
                >
                    {submitting ? (
                        <>
                            <Icons.spinner className="h-5 w-5 mr-2 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Icons.check className="h-5 w-5 mr-2" />
                            Confirmar Candidatura
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
