'use client'

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface IndicatorData {
    cooperativism_understanding: number
    democratic_functioning: number
    nuclei_organization: number
    financial_management: number
    event_planning: number
}

interface IndicatorsChartProps {
    data: IndicatorData | null
    title?: string
}

export function IndicatorsChart({ data, title = 'Maturidade da Turma' }: IndicatorsChartProps) {
    if (!data) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>Aguardando dados de avaliações.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Sem dados suficientes
                </CardContent>
            </Card>
        )
    }

    const chartData = [
        { subject: 'Cooperativismo', A: data.cooperativism_understanding || 0, fullMark: 100 },
        { subject: 'Democracia', A: data.democratic_functioning || 0, fullMark: 100 },
        { subject: 'Núcleos', A: data.nuclei_organization || 0, fullMark: 100 },
        { subject: 'Financeiro', A: data.financial_management || 0, fullMark: 100 },
        { subject: 'Planejamento', A: data.event_planning || 0, fullMark: 100 },
    ]

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Escala de 0 a 100 pontos por eixo.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Pontuação"
                                dataKey="A"
                                stroke="#2563eb"
                                fill="#3b82f6"
                                fillOpacity={0.5}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
