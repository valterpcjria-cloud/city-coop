'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { ReportFilters, FilterOption } from '@/components/reports/report-filters'
import { ExportButtons } from '@/components/reports/export-buttons'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import Link from 'next/link'

interface ElectionData {
    id: string
    class_name: string | null
    school_name: string | null
    status: string
    voting_start: string | null
    voting_end: string | null
    total_candidates: number
    total_votes: number
}

const exportColumns = [
    { key: 'class_name', label: 'Turma' },
    { key: 'school_name', label: 'Escola' },
    { key: 'status', label: 'Status' },
    { key: 'voting_start', label: 'Início Votação' },
    { key: 'voting_end', label: 'Fim Votação' },
    { key: 'total_candidates', label: 'Candidatos' },
    { key: 'total_votes', label: 'Votos' },
]

export default function ElectionsReportPage() {
    const [elections, setElections] = useState<ElectionData[]>([])
    const [filteredElections, setFilteredElections] = useState<ElectionData[]>([])
    const [loading, setLoading] = useState(true)
    const [filterValues, setFilterValues] = useState<Record<string, string>>({})
    const [schoolOptions, setSchoolOptions] = useState<{ value: string; label: string }[]>([])

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/gestor/reports/elections')
                const data = await res.json()
                if (data.success) {
                    setElections(data.elections)
                    setFilteredElections(data.elections)
                    const schools = [...new Set(data.elections.map((e: ElectionData) => e.school_name).filter(Boolean))]
                    setSchoolOptions(schools.map(s => ({ value: s as string, label: s as string })))
                }
            } catch (error) {
                console.error('Error fetching elections:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const statusOptions = [
        { value: 'configuracao', label: 'Configuração' },
        { value: 'inscricoes', label: 'Inscrições' },
        { value: 'campanha', label: 'Campanha' },
        { value: 'votacao', label: 'Votação' },
        { value: 'encerrada', label: 'Encerrada' },
    ]

    const filters: FilterOption[] = [
        { id: 'school', label: 'Escola', type: 'select', options: schoolOptions, placeholder: 'Selecione a escola' },
        { id: 'status', label: 'Status', type: 'select', options: statusOptions, placeholder: 'Selecione o status' },
    ]

    const handleFilterChange = (key: string, value: string) => {
        setFilterValues(prev => ({ ...prev, [key]: value }))
    }

    const applyFilters = () => {
        let result = [...elections]
        if (filterValues.school && filterValues.school !== 'all') result = result.filter(e => e.school_name === filterValues.school)
        if (filterValues.status && filterValues.status !== 'all') result = result.filter(e => e.status === filterValues.status)
        setFilteredElections(result)
    }

    const resetFilters = () => {
        setFilterValues({})
        setFilteredElections(elections)
    }

    const getStatusBadge = (status: string) => {
        const map: Record<string, { label: string; className: string }> = {
            configuracao: { label: 'Configuração', className: 'bg-gray-100 text-gray-800' },
            inscricoes: { label: 'Inscrições', className: 'bg-blue-100 text-blue-800' },
            campanha: { label: 'Campanha', className: 'bg-yellow-100 text-yellow-800' },
            votacao: { label: 'Votação', className: 'bg-green-100 text-green-800' },
            encerrada: { label: 'Encerrada', className: 'bg-purple-100 text-purple-800' },
        }
        return map[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Icons.spinner className="h-8 w-8 animate-spin text-city-blue" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/gestor/relatorios"><Button variant="ghost" size="icon"><Icons.chevronLeft className="h-5 w-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Relatório de Eleições</h1>
                        <p className="text-muted-foreground">{filteredElections.length} eleição(ões) encontrada(s)</p>
                    </div>
                </div>
                <ExportButtons
                    data={filteredElections.map(e => ({
                        ...e,
                        voting_start: e.voting_start ? new Date(e.voting_start).toLocaleDateString('pt-BR') : '-',
                        voting_end: e.voting_end ? new Date(e.voting_end).toLocaleDateString('pt-BR') : '-'
                    }))}
                    filename="relatorio-eleicoes"
                    columns={exportColumns}
                />
            </div>

            <ReportFilters filters={filters} values={filterValues} onChange={handleFilterChange} onApply={applyFilters} onReset={resetFilters} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="shadow-lg border-0">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead>Turma</TableHead>
                                    <TableHead>Escola</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Início Votação</TableHead>
                                    <TableHead>Fim Votação</TableHead>
                                    <TableHead className="text-center">Candidatos</TableHead>
                                    <TableHead className="text-center">Votos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredElections.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma eleição encontrada</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredElections.map((election, index) => {
                                        const badge = getStatusBadge(election.status)
                                        return (
                                            <motion.tr key={election.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * index }} className="border-b hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="font-medium">{election.class_name || '-'}</TableCell>
                                                <TableCell>{election.school_name || '-'}</TableCell>
                                                <TableCell><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span></TableCell>
                                                <TableCell>{election.voting_start ? new Date(election.voting_start).toLocaleDateString('pt-BR') : '-'}</TableCell>
                                                <TableCell>{election.voting_end ? new Date(election.voting_end).toLocaleDateString('pt-BR') : '-'}</TableCell>
                                                <TableCell className="text-center"><span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">{election.total_candidates}</span></TableCell>
                                                <TableCell className="text-center"><span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">{election.total_votes}</span></TableCell>
                                            </motion.tr>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
