'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/ui/icons'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function MatchingDashboard() {
    const [matches, setMatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchMatches() {
            try {
                // This will call the view vw_matching_opportunities
                const response = await fetch('/api/matching/opportunities')
                const data = await response.json()
                if (Array.isArray(data)) {
                    setMatches(data)
                } else {
                    setMatches([])
                }
            } catch (error) {
                console.error('Error fetching matches:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchMatches()
    }, [])

    if (loading) return <p className="text-sm text-muted-foreground animate-pulse">Calculando matches...</p>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Matching de Oportunidades</CardTitle>
                <CardDescription>Sugestões baseadas em score multidimensional e geolocalização.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Estudante</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Cooperativa</TableHead>
                            <TableHead>Oportunidade</TableHead>
                            <TableHead>Distância</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {matches.map((match, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="font-medium">{match.student_name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-city-blue border-city-blue/30">
                                        {match.score_total?.toFixed(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell>{match.coop_name}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{match.tipo_oportunidade}</Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {match.distancia_km ? `${match.distancia_km.toFixed(1)} km` : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="ghost" className="text-city-blue hover:text-city-blue/80">
                                        Conectar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {matches.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhuma sugestão de matching disponível no momento.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
