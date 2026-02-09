'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

interface NominationModalProps {
    isOpen: boolean
    onClose: () => void
    cycle: any
}

export function NominationModal({ isOpen, onClose, cycle }: NominationModalProps) {
    const [candidates, setCandidates] = useState<any[]>([])
    const [nominations, setNominations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            const [candRes, nomRes] = await Promise.all([
                fetch('/api/nucleo/candidatos'),
                fetch(`/api/tests/cycles/${cycle?.id}/nominations`)
            ])

            const candData = await candRes.json()
            const nomData = await nomRes.json()

            if (Array.isArray(candData)) setCandidates(candData)
            if (Array.isArray(nomData)) setNominations(nomData)
        } catch (error) {
            console.error('Error fetching nomination data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen && cycle) fetchData()
    }, [isOpen, cycle])

    const handleNominate = async (studentId: string) => {
        setActionLoading(studentId)
        try {
            const response = await fetch(`/api/tests/cycles/${cycle.id}/nominations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId })
            })

            if (!response.ok) throw new Error('Falha ao indicar aluno')

            toast.success('Aluno indicado com sucesso!')
            fetchData()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setActionLoading(null)
        }
    }

    const isNominated = (studentId: string) => {
        return nominations.some(n => n.student_id === studentId)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-city-blue">
                        Indicar Alunos: {cycle?.titulo}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Selecione alunos do ranking para liberar este teste (mesmo sem Score 70).
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Icons.spinner className="h-8 w-8 animate-spin text-city-blue" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Estudante</TableHead>
                                        <TableHead className="text-center">Score</TableHead>
                                        <TableHead className="text-right">Ação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {candidates.map((candidate) => {
                                        const nominated = isNominated(candidate.student_id)
                                        return (
                                            <TableRow key={candidate.student_id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{candidate.student_name}</span>
                                                        <span className="text-xs text-muted-foreground">{candidate.school_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary" className="bg-slate-100">
                                                        {candidate.score_total?.toFixed(1) || '0.0'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {nominated ? (
                                                        <Badge className="bg-green-500 hover:bg-green-600">
                                                            <Icons.check className="mr-1 h-3 w-3" />
                                                            Indicado
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={!!actionLoading}
                                                            onClick={() => handleNominate(candidate.student_id)}
                                                        >
                                                            {actionLoading === candidate.student_id ? (
                                                                <Icons.spinner className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                'Indicar'
                                                            )}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
