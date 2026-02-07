'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface School {
    id: string
    name: string
    code: string
    city: string | null
    state: string | null
    teacherCount: number
    studentCount: number
    classCount: number
}

const exportColumns = [
    { key: 'name', label: 'Nome' },
    { key: 'code', label: 'Código' },
    { key: 'city', label: 'Cidade' },
    { key: 'state', label: 'Estado' },
    { key: 'teacherCount', label: 'Professores' },
    { key: 'studentCount', label: 'Alunos' },
    { key: 'classCount', label: 'Turmas' },
]

export default function SchoolsReportPage() {
    const [schools, setSchools] = useState<School[]>([])
    const [filteredSchools, setFilteredSchools] = useState<School[]>([])
    const [loading, setLoading] = useState(true)
    const [filterValues, setFilterValues] = useState<Record<string, string>>({})
    const [stateOptions, setStateOptions] = useState<{ value: string; label: string }[]>([])

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/gestor/reports/schools')
                const data = await res.json()
                if (data.success) {
                    setSchools(data.schools)
                    setFilteredSchools(data.schools)

                    // Extract unique states for filter
                    const states = [...new Set(data.schools.map((s: School) => s.state).filter(Boolean))]
                    setStateOptions(states.map(s => ({ value: s as string, label: s as string })))
                }
            } catch (error) {
                console.error('Error fetching schools:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filters: FilterOption[] = [
        {
            id: 'state',
            label: 'Estado',
            type: 'select',
            options: stateOptions,
            placeholder: 'Selecione o estado',
        },
        {
            id: 'city',
            label: 'Cidade',
            type: 'text',
            placeholder: 'Buscar por cidade...',
        },
        {
            id: 'name',
            label: 'Nome da Escola',
            type: 'text',
            placeholder: 'Buscar por nome...',
        },
    ]

    const handleFilterChange = (key: string, value: string) => {
        setFilterValues(prev => ({ ...prev, [key]: value }))
    }

    const applyFilters = () => {
        let result = [...schools]

        if (filterValues.state && filterValues.state !== 'all') {
            result = result.filter(s => s.state === filterValues.state)
        }
        if (filterValues.city) {
            result = result.filter(s =>
                s.city?.toLowerCase().includes(filterValues.city.toLowerCase())
            )
        }
        if (filterValues.name) {
            result = result.filter(s =>
                s.name.toLowerCase().includes(filterValues.name.toLowerCase())
            )
        }

        setFilteredSchools(result)
    }

    const resetFilters = () => {
        setFilterValues({})
        setFilteredSchools(schools)
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/gestor/relatorios">
                        <Button variant="ghost" size="icon">
                            <Icons.chevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Relatório de Escolas</h1>
                        <p className="text-muted-foreground">
                            {filteredSchools.length} escola(s) encontrada(s)
                        </p>
                    </div>
                </div>
                <ExportButtons
                    data={filteredSchools}
                    filename="relatorio-escolas"
                    columns={exportColumns}
                />
            </div>

            {/* Filters */}
            <ReportFilters
                filters={filters}
                values={filterValues}
                onChange={handleFilterChange}
                onApply={applyFilters}
                onReset={resetFilters}
            />

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="shadow-lg border-0">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Cidade</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-center">Professores</TableHead>
                                    <TableHead className="text-center">Alunos</TableHead>
                                    <TableHead className="text-center">Turmas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSchools.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            Nenhuma escola encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSchools.map((school, index) => (
                                        <motion.tr
                                            key={school.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 * index }}
                                            className="border-b hover:bg-slate-50/50 transition-colors"
                                        >
                                            <TableCell className="font-medium">{school.name}</TableCell>
                                            <TableCell>{school.code}</TableCell>
                                            <TableCell>{school.city || '-'}</TableCell>
                                            <TableCell>{school.state || '-'}</TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                    {school.teacherCount}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                    {school.studentCount}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                                                    {school.classCount}
                                                </span>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
