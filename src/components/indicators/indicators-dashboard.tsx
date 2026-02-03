'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { IndicatorsChart } from '@/components/indicators/indicators-chart'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface IndicatorsDashboardProps {
    classId: string
    averageData: any
    studentsData: any[]
}

export function IndicatorsDashboard({ classId, averageData, studentsData }: IndicatorsDashboardProps) {
    const router = useRouter()
    const [isUpdating, setIsUpdating] = useState(false)

    const handleRecalculate = async () => {
        setIsUpdating(true)
        try {
            await fetch(`/api/classes/${classId}/indicators/recalculate`, { method: 'POST' })
            toast.success('Indicadores atualizados!')
            router.refresh()
        } catch (error) {
            toast.error('Erro ao atualizar')
        } finally {
            setIsUpdating(false)
        }
    }

    const overallScore = averageData
        ? Math.round(
            (averageData.cooperativismo +
                averageData.participacao +
                averageData.organizacao +
                averageData.financeiro +
                averageData.planejamento) / 5
        )
        : 0

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Painel de Maturidade</h3>
                    <p className="text-sm text-slate-500">Acompanhe o desenvolvimento das competências coop.</p>
                </div>
                <div className="flex items-center gap-4">
                    {overallScore >= 70 && (
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                            <Icons.check className="h-4 w-4" />
                            Aprovado para Evento
                        </div>
                    )}
                    <Button variant="outline" size="sm" onClick={handleRecalculate} disabled={isUpdating}>
                        <Icons.refresh className={`mr-2 h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`} />
                        Atualizar Dados
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Chart */}
                <IndicatorsChart
                    data={averageData ? {
                        cooperativism_understanding: averageData.cooperativismo,
                        democratic_functioning: averageData.participacao,
                        nuclei_organization: averageData.organizacao,
                        financial_management: averageData.financeiro,
                        event_planning: averageData.planejamento
                    } : null}
                    title="Média da Turma"
                />

                {/* KPI Cards */}
                <div className="grid gap-4 grid-cols-2">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700">Média Geral</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-blue-900">{overallScore}</div>
                            <p className="text-xs text-blue-600 mt-1">Pontos (0-100)</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Top Competência</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-slate-800">
                                {/* Simple logic to find max */}
                                {averageData ? (
                                    Object.entries(averageData).reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b)[0]
                                ) : '-'}
                            </div>
                        </CardContent>
                    </Card>
                    {/* More KPIs... */}
                </div>
            </div>

            {/* Student List with Individual Scores */}
            <Card>
                <CardHeader>
                    <CardTitle>Desempenho por Aluno</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">
                        Tabela detalhada em breve.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
