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
import { Badge } from '@/components/ui/badge'

interface EventData {
    id: string
    title: string
    class_name: string | null
    school_name: string | null
    status: string
    budget_total: number | null
    created_at: string
}

const exportColumns = [
    { key: 'title', label: 'Título' },
    { key: 'class_name', label: 'Turma' },
    { key: 'school_name', label: 'Escola' },
    { key: 'status', label: 'Status' },
    { key: 'budget_total', label: 'Orçamento (R$)' },
    { key: 'created_at', label: 'Data Criação' },
]

export default function EventsReportPage() {
    const [events, setEvents] = useState<EventData[]>([])
    const [filteredEvents, setFilteredEvents] = useState<EventData[]>([])
    const [loading, setLoading] = useState(true)
    const [filterValues, setFilterValues] = useState<Record<string, string>>({})
    const [schoolOptions, setSchoolOptions] = useState<{ value: string; label: string }[]>([])

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/gestor/reports/events')
                const data = await res.json()
                if (data.success) {
                    setEvents(data.events)
                    setFilteredEvents(data.events)
                    const schools = [...new Set(data.events.map((e: EventData) => e.school_name).filter(Boolean))]
                    setSchoolOptions(schools.map(s => ({ value: s as string, label: s as string })))
                }
            } catch (error) {
                console.error('Error fetching events:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const statusOptions = [
        { value: 'draft', label: 'Rascunho' },
        { value: 'submitted', label: 'Submetido' },
        { value: 'approved', label: 'Aprovado' },
        { value: 'rejected', label: 'Rejeitado' },
        { value: 'executed', label: 'Executado' },
    ]

    const filters: FilterOption[] = [
        { id: 'school', label: 'Escola', type: 'select', options: schoolOptions, placeholder: 'Selecione a escola' },
        { id: 'status', label: 'Status', type: 'select', options: statusOptions, placeholder: 'Selecione o status' },
        { id: 'dateFrom', label: 'Data Início', type: 'date' },
        { id: 'dateTo', label: 'Data Fim', type: 'date' },
    ]

    const handleFilterChange = (key: string, value: string) => {
        setFilterValues(prev => ({ ...prev, [key]: value }))
    }

    const applyFilters = () => {
        let result = [...events]
        if (filterValues.school && filterValues.school !== 'all') result = result.filter(e => e.school_name === filterValues.school)
        if (filterValues.status && filterValues.status !== 'all') result = result.filter(e => e.status === filterValues.status)
        if (filterValues.dateFrom) result = result.filter(e => new Date(e.created_at) >= new Date(filterValues.dateFrom))
        if (filterValues.dateTo) result = result.filter(e => new Date(e.created_at) <= new Date(filterValues.dateTo))
        setFilteredEvents(result)
    }

    const resetFilters = () => {
        setFilterValues({})
        setFilteredEvents(events)
    }

    const getStatusBadge = (status: string) => {
        const map: Record<string, { label: string; className: string }> = {
            draft: { label: 'Rascunho', className: 'bg-gray-100 text-gray-800' },
            submitted: { label: 'Submetido', className: 'bg-yellow-100 text-yellow-800' },
            approved: { label: 'Aprovado', className: 'bg-green-100 text-green-800' },
            rejected: { label: 'Rejeitado', className: 'bg-red-100 text-red-800' },
            executed: { label: 'Executado', className: 'bg-blue-100 text-blue-800' },
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
                        <h1 className="text-2xl font-bold tracking-tight">Relatório de Eventos</h1>
                        <p className="text-muted-foreground">{filteredEvents.length} evento(s) encontrado(s)</p>
                    </div>
                </div>
                <ExportButtons data={filteredEvents.map(e => ({ ...e, budget_total: e.budget_total ? `R$ ${e.budget_total.toLocaleString('pt-BR')}` : '-', created_at: new Date(e.created_at).toLocaleDateString('pt-BR') }))} filename="relatorio-eventos" columns={exportColumns} />
            </div>

            <ReportFilters filters={filters} values={filterValues} onChange={handleFilterChange} onApply={applyFilters} onReset={resetFilters} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="shadow-lg border-0">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead>Título</TableHead>
                                    <TableHead>Turma</TableHead>
                                    <TableHead>Escola</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Orçamento</TableHead>
                                    <TableHead>Data</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum evento encontrado</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEvents.map((event, index) => {
                                        const badge = getStatusBadge(event.status)
                                        return (
                                            <motion.tr key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * index }} className="border-b hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="font-medium">{event.title}</TableCell>
                                                <TableCell>{event.class_name || '-'}</TableCell>
                                                <TableCell>{event.school_name || '-'}</TableCell>
                                                <TableCell><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span></TableCell>
                                                <TableCell className="text-right font-mono">{event.budget_total ? `R$ ${event.budget_total.toLocaleString('pt-BR')}` : '-'}</TableCell>
                                                <TableCell>{new Date(event.created_at).toLocaleDateString('pt-BR')}</TableCell>
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
