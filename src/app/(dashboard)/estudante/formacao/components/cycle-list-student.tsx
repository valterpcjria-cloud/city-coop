'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TestConsentModal } from '@/components/coop/test-consent-modal'
import { Icons } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CycleListStudentProps {
    cycles: any[]
    studentId: string
    results: any[]
    currentScore: number
    nominations: any[]
}

export function CycleListStudent({ cycles, studentId, results, currentScore, nominations }: CycleListStudentProps) {
    const router = useRouter()
    const [selectedTest, setSelectedTest] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    const isEligible = currentScore >= 70

    const handleStartClick = (cycle: any) => {
        const isNominated = nominations.some(n => n.cycle_id === cycle.id)

        if (!isEligible && !isNominated) {
            toast.error('Você ainda não atingiu o Score mínimo (70) para participar deste ciclo.')
            return
        }

        const test = cycle.cycle_tests?.[0]
        if (!test) {
            toast.error('Nenhum teste disponível para este ciclo.')
            return
        }

        const existingResult = results.find(r => r.test_id === test.id)
        if (existingResult?.status === 'Concluído') {
            toast.info('Você já concluiu este teste.')
            return
        }

        setSelectedTest({
            id: test.id,
            titulo: test.titulo,
            tempo_limite: test.tempo_limite_minutos
        })
    }

    const handleConfirmStart = async () => {
        if (!selectedTest) return
        setIsLoading(true)

        try {
            const response = await fetch('/api/tests/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testId: selectedTest.id,
                    studentId
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao iniciar teste')
            }

            // Redirect to the test engine
            router.push(`/estudante/formacao/teste/${selectedTest.id}`)
        } catch (error: any) {
            toast.error(error.message)
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            {!isEligible && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-2">
                    <Icons.info className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>
                        <strong>Aviso de Elegibilidade:</strong> Estes testes são exclusivos para alunos que atingiram o Score total mínimo de 70. Continue participando das atividades para aumentar sua pontuação!
                    </p>
                </div>
            )}
            {cycles.map((cycle) => {
                const test = cycle.cycle_tests?.[0]
                const result = test ? results.find(r => r.test_id === test.id) : null
                const isCompleted = result?.status === 'Concluído'
                const isInProgress = result?.status === 'Em Andamento'
                const isNominated = nominations.some(n => n.cycle_id === cycle.id)
                const canAccess = isEligible || isNominated

                return (
                    <div key={cycle.id} className={`flex items-center justify-between p-4 rounded-lg border bg-slate-50 transition-opacity ${!canAccess && !isCompleted ? 'opacity-70' : ''}`}>
                        <div className="space-y-1">
                            <p className="font-bold">Ciclo {cycle.numero_ciclo}: {cycle.titulo}</p>
                            <p className="text-xs text-muted-foreground">{cycle.descricao?.substring(0, 100)}...</p>

                            {test && (
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-[10px]">
                                        {test.num_questoes} Questões
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                        {test.tempo_limite_minutos} min
                                    </Badge>
                                    {isCompleted && (
                                        <Badge className="text-[10px] bg-green-500">
                                            Concluído: {result.score?.toFixed(1)}%
                                        </Badge>
                                    )}
                                    {isNominated && (
                                        <Badge className="text-[10px] bg-amber-500 text-white border-none">
                                            Indicado pelo Gestor
                                        </Badge>
                                    )}
                                    {isInProgress && (
                                        <Badge variant="secondary" className="text-[10px] animate-pulse">
                                            Em Andamento
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <Button
                                size="sm"
                                className={`${isCompleted ? 'bg-slate-200 text-slate-500' : canAccess ? 'bg-city-blue' : 'bg-slate-300'}`}
                                disabled={isCompleted || isLoading}
                                onClick={() => handleStartClick(cycle)}
                            >
                                {isCompleted ? 'Finalizado' : isInProgress ? 'Continuar' : 'Iniciar Teste'}
                            </Button>
                            {!canAccess && !isCompleted && !isInProgress && (
                                <span className="text-[10px] text-amber-600 font-medium">Bloqueado (Score {'<'} 70)</span>
                            )}
                        </div>
                    </div>
                )
            })}

            {cycles.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">Nenhum ciclo ativo no momento.</p>
            )}

            {selectedTest && (
                <TestConsentModal
                    isOpen={!!selectedTest}
                    onClose={() => setSelectedTest(null)}
                    onConfirm={handleConfirmStart}
                    testTitle={selectedTest.titulo}
                    timeLimit={selectedTest.tempo_limite}
                />
            )}
        </div>
    )
}
