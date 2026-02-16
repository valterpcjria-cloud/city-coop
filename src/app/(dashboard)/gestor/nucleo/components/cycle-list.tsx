'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/ui/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { CycleFormModal } from "./cycle-form-modal"
import { ConfirmModal } from "@/components/shared/confirm-modal"
import { useActionToast } from "@/hooks/use-action-toast"
import { NominationModal } from "./nomination-modal"

export function CycleList() {
    const [cycles, setCycles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCycle, setSelectedCycle] = useState<any>(null)
    const [cycleToDelete, setCycleToDelete] = useState<string | null>(null)
    const [isNominationOpen, setIsNominationOpen] = useState(false)
    const { executeAction } = useActionToast()

    const fetchCycles = async () => {
        try {
            const response = await fetch('/api/tests/cycles')
            const data = await response.json()
            if (Array.isArray(data)) {
                setCycles(data)
            } else {
                setCycles([])
            }
        } catch (error) {
            console.error('Error fetching cycles:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCycles()
    }, [])

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        await executeAction(
            async () => {
                const response = await fetch(`/api/tests/cycles/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ativo: !currentStatus })
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Falha ao atualizar status')
                }

                setCycles(prev => prev.map(c => c.id === id ? { ...c, ativo: !currentStatus } : c))
            },
            {
                loadingMessage: 'Atualizando status...',
                successMessage: currentStatus ? 'Ciclo bloqueado!' : 'Ciclo liberado!',
                errorMessage: 'Falha ao atualizar status do ciclo'
            }
        )
    }

    const handleDelete = async () => {
        if (!cycleToDelete) return

        await executeAction(
            async () => {
                const response = await fetch(`/api/tests/cycles/${cycleToDelete}`, { method: 'DELETE' })
                if (!response.ok) throw new Error('Falha ao excluir ciclo')
                fetchCycles()
            },
            {
                loadingMessage: 'Excluindo ciclo...',
                successMessage: 'Ciclo excluído com sucesso!',
                errorMessage: 'Erro ao excluir ciclo'
            }
        )
        setCycleToDelete(null)
    }

    if (loading) return <p className="text-sm text-muted-foreground animate-pulse">Carregando ciclos...</p>

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    size="sm"
                    className="bg-city-blue"
                    onClick={() => {
                        setSelectedCycle(null)
                        setIsModalOpen(true)
                    }}
                >
                    <Icons.add className="mr-2 h-4 w-4" />
                    Novo Ciclo
                </Button>
            </div>

            <div className="grid gap-4">
                {cycles.map((cycle) => (
                    <Card key={cycle.id} className={cycle.ativo ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-slate-300 opacity-80'}>
                        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                            <div className="space-y-1">
                                <CardTitle className="text-lg">Ciclo {cycle.numero_ciclo}: {cycle.titulo}</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Badge variant={cycle.ativo ? 'default' : 'secondary'} className={cycle.ativo ? 'bg-green-500' : ''}>
                                        {cycle.ativo ? 'Liberado (Ativo)' : 'Bloqueado (Inativo)'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {cycle.data_inicio ? new Date(cycle.data_inicio).toLocaleDateString() : 'N/A'} - {cycle.data_fim ? new Date(cycle.data_fim).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant={cycle.ativo ? 'outline' : 'default'}
                                    className={!cycle.ativo ? 'bg-city-blue' : ''}
                                    onClick={() => toggleStatus(cycle.id, cycle.ativo || false)}
                                >
                                    {cycle.ativo ? 'Bloquear' : 'Liberar para Alunos'}
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-city-blue text-city-blue hover:bg-city-blue/10"
                                    onClick={() => {
                                        setSelectedCycle(cycle)
                                        setIsNominationOpen(true)
                                    }}
                                >
                                    <Icons.users className="mr-2 h-4 w-4" />
                                    Indicar Alunos
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSelectedCycle(cycle)
                                        setIsModalOpen(true)
                                    }}
                                >
                                    <Icons.settings className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setCycleToDelete(cycle.id)}
                                >
                                    <Icons.trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-4">
                            <p className="text-sm text-muted-foreground">{cycle.descricao}</p>

                            {cycle.cycle_tests?.[0] && cycle.cycle_tests[0].test_questions?.length > 0 && (
                                <div className="pt-4 border-t">
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="questions" className="border-none">
                                            <AccordionTrigger className="py-2 hover:no-underline border rounded-lg px-4 bg-slate-50">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                    <Icons.checkSquare className="h-4 w-4 text-city-blue" />
                                                    Ver Questões do Teste ({cycle.cycle_tests[0].test_questions.length})
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-4 space-y-4">
                                                {cycle.cycle_tests[0].test_questions.map((q: any, idx: number) => (
                                                    <div key={idx} className="p-4 rounded-lg bg-white border border-slate-100 shadow-sm space-y-3">
                                                        <div className="flex items-start gap-2">
                                                            <span className="font-bold text-city-blue">{idx + 1}.</span>
                                                            <p className="text-sm font-medium leading-relaxed">{q.questao_texto}</p>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                                                            {['A', 'B', 'C', 'D'].map(letter => {
                                                                const isCorrect = q.resposta_correta === letter
                                                                const optionText = q[`opcao_${letter.toLowerCase()}`]
                                                                return (
                                                                    <div key={letter} className={`text-xs p-2 rounded border flex items-center gap-2 ${isCorrect ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                                                        <span className="uppercase font-bold">{letter})</span>
                                                                        {optionText}
                                                                        {isCorrect && <Icons.check className="h-3 w-3 ml-auto" />}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {cycles.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        Nenhum ciclo de formação cadastrado.
                    </p>
                )}
                {/* CRUD Modals */}
                <CycleFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchCycles}
                    cycle={selectedCycle}
                />

                <ConfirmModal
                    isOpen={!!cycleToDelete}
                    onClose={() => setCycleToDelete(null)}
                    onConfirm={handleDelete}
                    title="Excluir Ciclo?"
                    description="Esta ação não pode ser desfeita. Isso excluirá permanentemente o ciclo e todos os testes vinculados."
                    confirmText="Confirmar Exclusão"
                    variant="destructive"
                />

                <NominationModal
                    isOpen={isNominationOpen}
                    onClose={() => setIsNominationOpen(false)}
                    cycle={selectedCycle}
                />
            </div>
        </div>
    )
}
