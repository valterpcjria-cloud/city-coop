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

interface Student {
    id: string
    name: string
    email: string | null
    grade_level: string
    school_name: string | null
    school_id: string | null
    class_name: string | null
    class_id: string | null
    nucleus_name: string | null
    nucleus_role: string | null
}

const exportColumns = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'grade_level', label: 'Série' },
    { key: 'school_name', label: 'Escola' },
    { key: 'class_name', label: 'Turma' },
    { key: 'nucleus_name', label: 'Núcleo' },
    { key: 'nucleus_role', label: 'Função no Núcleo' },
]

export default function StudentsReportPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [filterValues, setFilterValues] = useState<Record<string, string>>({})
    const [schoolOptions, setSchoolOptions] = useState<{ value: string; label: string }[]>([])
    const [classOptions, setClassOptions] = useState<{ value: string; label: string }[]>([])
    const [nucleusOptions, setNucleusOptions] = useState<{ value: string; label: string }[]>([])

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/gestor/reports/students')
                const data = await res.json()
                if (data.success) {
                    setStudents(data.students)
                    setFilteredStudents(data.students)

                    // Extract unique values for filters
                    const schools = [...new Set(data.students.map((s: Student) => s.school_name).filter(Boolean))]
                    setSchoolOptions(schools.map(s => ({ value: s as string, label: s as string })))

                    const classes = [...new Set(data.students.map((s: Student) => s.class_name).filter(Boolean))]
                    setClassOptions(classes.map(c => ({ value: c as string, label: c as string })))

                    const nuclei = [...new Set(data.students.map((s: Student) => s.nucleus_name).filter(Boolean))]
                    setNucleusOptions(nuclei.map(n => ({ value: n as string, label: n as string })))
                }
            } catch (error) {
                console.error('Error fetching students:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const gradeOptions = [
        { value: '9EF', label: '9º Ano (EF)' },
        { value: '1EM', label: '1º Ano (EM)' },
        { value: '2EM', label: '2º Ano (EM)' },
        { value: '3EM', label: '3º Ano (EM)' },
        { value: 'EJA', label: 'EJA' },
    ]

    const filters: FilterOption[] = [
        {
            id: 'school',
            label: 'Escola',
            type: 'select',
            options: schoolOptions,
            placeholder: 'Selecione a escola',
        },
        {
            id: 'class',
            label: 'Turma',
            type: 'select',
            options: classOptions,
            placeholder: 'Selecione a turma',
        },
        {
            id: 'grade',
            label: 'Série',
            type: 'select',
            options: gradeOptions,
            placeholder: 'Selecione a série',
        },
        {
            id: 'nucleus',
            label: 'Núcleo',
            type: 'select',
            options: nucleusOptions,
            placeholder: 'Selecione o núcleo',
        },
        {
            id: 'name',
            label: 'Nome do Aluno',
            type: 'text',
            placeholder: 'Buscar por nome...',
        },
    ]

    const handleFilterChange = (key: string, value: string) => {
        setFilterValues(prev => ({ ...prev, [key]: value }))
    }

    const applyFilters = () => {
        let result = [...students]

        if (filterValues.school && filterValues.school !== 'all') {
            result = result.filter(s => s.school_name === filterValues.school)
        }
        if (filterValues.class && filterValues.class !== 'all') {
            result = result.filter(s => s.class_name === filterValues.class)
        }
        if (filterValues.grade && filterValues.grade !== 'all') {
            result = result.filter(s => s.grade_level === filterValues.grade)
        }
        if (filterValues.nucleus && filterValues.nucleus !== 'all') {
            result = result.filter(s => s.nucleus_name === filterValues.nucleus)
        }
        if (filterValues.name) {
            result = result.filter(s =>
                s.name.toLowerCase().includes(filterValues.name.toLowerCase())
            )
        }

        setFilteredStudents(result)
    }

    const resetFilters = () => {
        setFilterValues({})
        setFilteredStudents(students)
    }

    const getNucleusColor = (nucleus: string | null) => {
        const colors: Record<string, string> = {
            'Entretenimento': 'bg-purple-100 text-purple-800',
            'Logística': 'bg-blue-100 text-blue-800',
            'Operacional': 'bg-green-100 text-green-800',
            'Financeiro': 'bg-yellow-100 text-yellow-800',
            'Comunicação': 'bg-pink-100 text-pink-800',
            'Parcerias': 'bg-indigo-100 text-indigo-800',
        }
        return colors[nucleus || ''] || 'bg-gray-100 text-gray-800'
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
                        <h1 className="text-2xl font-bold tracking-tight">Relatório de Alunos</h1>
                        <p className="text-muted-foreground">
                            {filteredStudents.length} aluno(s) encontrado(s) | Dados cruzados: Escola, Turma, Núcleo
                        </p>
                    </div>
                </div>
                <ExportButtons
                    data={filteredStudents}
                    filename="relatorio-alunos"
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
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Série</TableHead>
                                        <TableHead>Escola</TableHead>
                                        <TableHead>Turma</TableHead>
                                        <TableHead>Núcleo</TableHead>
                                        <TableHead>Função</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                Nenhum aluno encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredStudents.map((student, index) => (
                                            <motion.tr
                                                key={student.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.02 * index }}
                                                className="border-b hover:bg-slate-50/50 transition-colors"
                                            >
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell className="text-muted-foreground">{student.email || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{student.grade_level}</Badge>
                                                </TableCell>
                                                <TableCell>{student.school_name || '-'}</TableCell>
                                                <TableCell>{student.class_name || '-'}</TableCell>
                                                <TableCell>
                                                    {student.nucleus_name ? (
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getNucleusColor(student.nucleus_name)}`}>
                                                            {student.nucleus_name}
                                                        </span>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {student.nucleus_role === 'coordenador' ? (
                                                        <Badge className="bg-coop-orange text-white">Coordenador</Badge>
                                                    ) : student.nucleus_role === 'membro' ? (
                                                        <Badge variant="secondary">Membro</Badge>
                                                    ) : '-'}
                                                </TableCell>
                                            </motion.tr>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
