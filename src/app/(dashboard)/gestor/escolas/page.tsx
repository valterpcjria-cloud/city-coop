'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { SchoolModal } from '@/components/dashboard/gestor/school-modal'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { School, MapPin, Users, GraduationCap, BookOpen } from 'lucide-react'

interface SchoolData {
    id: string
    name: string
    code: string
    city: string | null
    state: string | null
    address: string | null
    phone: string | null
    email: string | null
    created_at: string
}

export default function GestorSchoolsPage() {
    const [schools, setSchools] = useState<SchoolData[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSchool, setSelectedSchool] = useState<SchoolData | undefined>()
    const [deleting, setDeleting] = useState<string | null>(null)

    const fetchSchools = async () => {
        try {
            const response = await fetch('/api/gestor/schools')
            const data = await response.json()
            if (data.success) {
                setSchools(data.schools || [])
            }
        } catch (error) {
            toast.error('Erro ao carregar escolas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSchools()
    }, [])

    const handleAdd = () => {
        setSelectedSchool(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (school: SchoolData) => {
        setSelectedSchool(school)
        setIsModalOpen(true)
    }

    const handleDelete = async (school: SchoolData) => {
        if (!confirm(`Tem certeza que deseja excluir a escola "${school.name}"?`)) return

        setDeleting(school.id)
        try {
            const response = await fetch(`/api/gestor/schools?id=${school.id}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            toast.success('Escola removida com sucesso!')
            fetchSchools()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setDeleting(null)
        }
    }

    const handleSuccess = () => {
        fetchSchools()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Icons.spinner className="h-8 w-8 animate-spin text-city-blue" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-city-blue">Escolas</h2>
                    <p className="text-tech-gray">Gerencie as instituições parceiras da plataforma.</p>
                </div>
                <Button variant="brand" onClick={handleAdd}>
                    <Icons.add className="mr-2 h-4 w-4" />
                    Nova Escola
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                >
                    <Card className="border-l-4 border-l-city-blue">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total de Escolas</p>
                                    <p className="text-2xl font-bold text-city-blue">{schools.length}</p>
                                </div>
                                <School className="h-8 w-8 text-city-blue/20" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Estados</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {new Set(schools.filter(s => s.state).map(s => s.state)).size}
                                    </p>
                                </div>
                                <MapPin className="h-8 w-8 text-green-500/20" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Cidades</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {new Set(schools.filter(s => s.city).map(s => s.city)).size}
                                    </p>
                                </div>
                                <GraduationCap className="h-8 w-8 text-purple-500/20" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Este Mês</p>
                                    <p className="text-2xl font-bold text-amber-600">
                                        {schools.filter(s => {
                                            const created = new Date(s.created_at)
                                            const now = new Date()
                                            return created.getMonth() === now.getMonth() &&
                                                created.getFullYear() === now.getFullYear()
                                        }).length}
                                    </p>
                                </div>
                                <BookOpen className="h-8 w-8 text-amber-500/20" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Instituições Cadastradas</CardTitle>
                        <CardDescription>
                            Lista de todas as escolas parceiras do programa City Coop.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Cidade/UF</TableHead>
                                    <TableHead>Contato</TableHead>
                                    <TableHead>Data Cadastro</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schools.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <School className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-muted-foreground">Nenhuma escola cadastrada ainda.</p>
                                            <Button variant="link" onClick={handleAdd} className="mt-2">
                                                Cadastrar primeira escola
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    schools.map((school) => (
                                        <TableRow key={school.id}>
                                            <TableCell className="font-medium">{school.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">
                                                    {school.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {school.city && school.state ? (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        {school.city} / {school.state}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">--</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {school.email || school.phone ? (
                                                    <div className="text-sm">
                                                        {school.email && <div className="truncate max-w-[150px]">{school.email}</div>}
                                                        {school.phone && <div className="text-muted-foreground">{school.phone}</div>}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">--</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(school.created_at).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(school)}
                                                    >
                                                        <Icons.settings className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(school)}
                                                        disabled={deleting === school.id}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        {deleting === school.id ? (
                                                            <Icons.spinner className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Icons.trash className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Modal */}
            <SchoolModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                school={selectedSchool}
                onSuccess={handleSuccess}
            />
        </div>
    )
}
