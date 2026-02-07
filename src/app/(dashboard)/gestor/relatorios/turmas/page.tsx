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

interface ClassData {
    id: string
    name: string
    school_name: string | null
    teacher_name: string | null
    modality: string
    status: string
    student_count: number
}

const exportColumns = [
    { key: 'name', label: 'Nome da Turma' },
    { key: 'school_name', label: 'Escola' },
    { key: 'teacher_name', label: 'Professor' },
    { key: 'modality', label: 'Modalidade' },
    { key: 'status', label: 'Status' },
    { key: 'student_count', label: 'Nº Alunos' },
]

export default function ClassesReportPage() {
    const [classes, setClasses] = useState<ClassData[]>([])
    const [filteredClasses, setFilteredClasses] = useState<ClassData[]>([])
    const [loading, setLoading] = useState(true)
    const [filterValues, setFilterValues] = useState<Record<string, string>>({})
    const [schoolOptions, setSchoolOptions] = useState<{ value: string; label: string }[]>([])
    const [teacherOptions, setTeacherOptions] = useState<{ value: string; label: string }[]>([])

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/gestor/reports/classes')
                const data = await res.json()
                if (data.success) {
                    setClasses(data.classes)
                    setFilteredClasses(data.classes)

                    const schools = [...new Set(data.classes.map((c: ClassData) => c.school_name).filter(Boolean))]
                    setSchoolOptions(schools.map(s => ({ value: s as string, label: s as string })))

                    const teachers = [...new Set(data.classes.map((c: ClassData) => c.teacher_name).filter(Boolean))]
                    setTeacherOptions(teachers.map(t => ({ value: t as string, label: t as string })))
                }
            } catch (error) {
                console.error('Error fetching classes:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const statusOptions = [
        { value: 'active', label: 'Ativa' },
        { value: 'completed', label: 'Finalizada' },
        { value: 'cancelled', label: 'Cancelada' },
    ]

    const modalityOptions = [
        { value: 'trimestral', label: 'Trimestral' },
        { value: 'semestral', label: 'Semestral' },
    ]

    const filters: FilterOption[] = [
        { id: 'school', label: 'Escola', type: 'select', options: schoolOptions, placeholder: 'Selecione a escola' },
        { id: 'teacher', label: 'Professor', type: 'select', options: teacherOptions, placeholder: 'Selecione o professor' },
        { id: 'status', label: 'Status', type: 'select', options: statusOptions, placeholder: 'Selecione o status' },
        { id: 'modality', label: 'Modalidade', type: 'select', options: modalityOptions, placeholder: 'Selecione a modalidade' },
    ]

    const handleFilterChange = (key: string, value: string) => {
        setFilterValues(prev => ({ ...prev, [key]: value }))
    }

    const applyFilters = () => {
        let result = [...classes]
        if (filterValues.school && filterValues.school !== 'all') result = result.filter(c => c.school_name === filterValues.school)
        if (filterValues.teacher && filterValues.teacher !== 'all') result = result.filter(c => c.teacher_name === filterValues.teacher)
        if (filterValues.status && filterValues.status !== 'all') result = result.filter(c => c.status === filterValues.status)
        if (filterValues.modality && filterValues.modality !== 'all') result = result.filter(c => c.modality === filterValues.modality)
        setFilteredClasses(result)
    }

    const resetFilters = () => {
        setFilterValues({})
        setFilteredClasses(classes)
    }

    const getStatusBadge = (status: string) => {
        const map: Record<string, { label: string; className: string }> = {
            active: { label: 'Ativa', className: 'bg-green-100 text-green-800' },
            completed: { label: 'Finalizada', className: 'bg-blue-100 text-blue-800' },
            cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
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
                    <Link href="/gestor/relatorios">
                        <Button variant="ghost" size="icon"><Icons.chevronLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Relatório de Turmas</h1>
                        <p className="text-muted-foreground">{filteredClasses.length} turma(s) encontrada(s)</p>
                    </div>
                </div>
                <ExportButtons data={filteredClasses} filename="relatorio-turmas" columns={exportColumns} />
            </div>

            <ReportFilters filters={filters} values={filterValues} onChange={handleFilterChange} onApply={applyFilters} onReset={resetFilters} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="shadow-lg border-0">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Escola</TableHead>
                                    <TableHead>Professor</TableHead>
                                    <TableHead>Modalidade</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Alunos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClasses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma turma encontrada</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredClasses.map((cls, index) => {
                                        const badge = getStatusBadge(cls.status)
                                        return (
                                            <motion.tr key={cls.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * index }} className="border-b hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="font-medium">{cls.name}</TableCell>
                                                <TableCell>{cls.school_name || '-'}</TableCell>
                                                <TableCell>{cls.teacher_name || '-'}</TableCell>
                                                <TableCell><Badge variant="outline">{cls.modality}</Badge></TableCell>
                                                <TableCell><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span></TableCell>
                                                <TableCell className="text-center"><span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">{cls.student_count}</span></TableCell>
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
