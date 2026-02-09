'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function CandidatesRanking() {
    const [candidates, setCandidates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCandidates() {
            try {
                const response = await fetch('/api/nucleo/candidatos')
                const data = await response.json()
                if (Array.isArray(data)) {
                    setCandidates(data)
                } else {
                    setCandidates([])
                }
            } catch (error) {
                console.error('Error fetching candidates:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchCandidates()
    }, [])

    if (loading) return <p className="text-sm text-muted-foreground animate-pulse">Carregando ranking...</p>

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Estudante</TableHead>
                        <TableHead>Escola</TableHead>
                        <TableHead className="text-center">Score Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.map((candidate) => (
                        <TableRow key={candidate.student_id}>
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span>{candidate.student_name}</span>
                                    <span className="text-xs text-muted-foreground">{candidate.grade_level}</span>
                                </div>
                            </TableCell>
                            <TableCell>{candidate.school_name}</TableCell>
                            <TableCell className="text-center font-bold text-city-blue">
                                {candidate.score_total?.toFixed(1) || '0.0'}
                            </TableCell>
                            <TableCell>
                                <Badge variant={
                                    candidate.status_candidatura === 'Apto' ? 'default' :
                                        candidate.status_candidatura === 'Em Observação' ? 'secondary' : 'destructive'
                                } className={candidate.status_candidatura === 'Apto' ? 'bg-green-500' : ''}>
                                    {candidate.status_candidatura}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                                    Ver Perfil
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                    {candidates.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                Nenhum candidato encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
