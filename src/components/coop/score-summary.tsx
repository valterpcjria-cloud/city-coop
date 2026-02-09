'use client'

import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ScoreSummaryProps {
    scores: {
        conhecimento_score: number
        engajamento_score: number
        colaboracao_score: number
        perfil_cooperativista_score: number
        score_total: number
    }
}

export function ScoreSummary({ scores }: ScoreSummaryProps) {
    const data = [
        { subject: 'Conhecimento', value: scores.conhecimento_score, fullMark: 100 },
        { subject: 'Engajamento', value: scores.engajamento_score, fullMark: 100 },
        { subject: 'Colaboração', value: scores.colaboracao_score, fullMark: 100 },
        { subject: 'Perfil', value: scores.perfil_cooperativista_score, fullMark: 100 },
    ]

    return (
        <Card className="w-full h-full min-h-[400px]">
            <CardHeader>
                <CardTitle>Perfil Multidimensional</CardTitle>
                <CardDescription>Score Total: {scores.score_total.toFixed(1)} / 100</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Radar
                            name="Score"
                            dataKey="value"
                            stroke="#4A90D9"
                            fill="#4A90D9"
                            fillOpacity={0.6}
                        />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
