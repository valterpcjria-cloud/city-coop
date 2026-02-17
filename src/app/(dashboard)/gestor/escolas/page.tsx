'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { SchoolModal } from '@/components/dashboard/gestor/school-modal'
import { ConfirmModal } from '@/components/shared/confirm-modal'
import { useActionToast } from '@/hooks/use-action-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { School, MapPin, Users, GraduationCap, BookOpen, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SchoolData {
    id: string
    name: string
    code: string
    inep_code: string | null
    administrative_category: string | null
    education_stages: string[] | null
    location_type: string | null
    director_name: string | null
    cep: string | null
    city: string | null
    state: string | null
    neighborhood: string | null
    address: string | null
    address_number: string | null
    address_complement: string | null
    phone: string | null
    secondary_phone: string | null
    email: string | null
    website: string | null
    created_at: string
}

export default function GestorSchoolsPage() {
    const [schools, setSchools] = useState<SchoolData[]>([])
    const [loading, setLoading] = useState(true)
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSchool, setSelectedSchool] = useState<SchoolData | undefined>()
    const [schoolToDelete, setSchoolToDelete] = useState<SchoolData | null>(null)
    const { executeAction } = useActionToast()

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [newThisMonth, setNewThisMonth] = useState(0)
    const limit = 25

    // Cached data for prefetching
    const [prefetchCache, setPrefetchCache] = useState<Record<number, { schools: SchoolData[], totalItems: number, totalPages: number, newThisMonth: number }>>({})

    const fetchSchools = async (page: number = 1, isPrefetch = false, ignoreCache = false) => {
        if (!isPrefetch) setLoading(true)

        try {
            // Check cache first (ignore if explicitly told to ignoreCache)
            if (!isPrefetch && !ignoreCache && prefetchCache[page]) {
                const cached = prefetchCache[page]
                setSchools(cached.schools)
                setTotalPages(cached.totalPages)
                setTotalItems(cached.totalItems)
                setNewThisMonth(cached.newThisMonth)
                setLoading(false)
                setIsInitialLoading(false)
                return
            }

            const response = await fetch(`/api/gestor/schools?page=${page}&limit=${limit}`)
            if (!response.ok) throw new Error('Falha ao carregar dados')
            const data = await response.json()

            if (data.success) {
                const newData = {
                    schools: data.schools || [],
                    totalItems: data.pagination.total,
                    totalPages: data.pagination.totalPages,
                    newThisMonth: data.pagination.newThisMonth || 0
                }

                if (isPrefetch) {
                    setPrefetchCache(prev => ({ ...prev, [page]: newData }))
                } else {
                    setSchools(newData.schools)
                    setTotalPages(newData.totalPages)
                    setTotalItems(newData.totalItems)
                    setNewThisMonth(newData.newThisMonth)
                    setCurrentPage(data.pagination.page)
                    setPrefetchCache(prev => ({ ...prev, [page]: newData }))
                }
            }
        } catch (error) {
            if (!isPrefetch) toast.error('Erro ao carregar escolas')
        } finally {
            if (!isPrefetch) {
                setLoading(false)
                setIsInitialLoading(false)
            }
        }
    }

    useEffect(() => {
        fetchSchools(currentPage)
    }, [currentPage])

    const handlePrefetch = (page: number) => {
        if (page > 0 && page <= totalPages && !prefetchCache[page]) {
            fetchSchools(page, true)
        }
    }

    const handleAdd = () => {
        setSelectedSchool(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (school: SchoolData) => {
        setSelectedSchool(school)
        setIsModalOpen(true)
    }

    const handleDelete = async () => {
        if (!schoolToDelete) return

        await executeAction(
            async () => {
                const response = await fetch(`/api/gestor/schools?id=${schoolToDelete.id}`, {
                    method: 'DELETE'
                })

                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error || 'Erro ao excluir escola')
                }

                setPrefetchCache({})
                fetchSchools(currentPage, false, true)
            },
            {
                loadingMessage: 'Excluindo escola...',
                successMessage: 'Escola removida com sucesso!',
                errorMessage: 'Erro ao excluir escola'
            }
        )
        setSchoolToDelete(null)
    }

    const handleSuccess = () => {
        setPrefetchCache({})
        fetchSchools(currentPage, false, true)
    }

    if (isInitialLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Icons.spinner className="h-8 w-8 animate-spin text-city-blue" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-2xl font-bold tracking-tight text-city-blue">Escolas</h2>
                    <p className="text-tech-gray">Gerencie as instituições parceiras da plataforma.</p>
                </motion.div>
                <div className="flex items-center gap-2">
                    <Link href="/gestor/escolas/importar">
                        <Button variant="outline">
                            <Icons.upload className="mr-2 h-4 w-4" />
                            Importar Escolas
                        </Button>
                    </Link>
                    <Button variant="brand" onClick={handleAdd}>
                        <Icons.add className="mr-2 h-4 w-4" />
                        Nova Escola
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                    <Card className="border-l-4 border-l-city-blue shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Total de Escolas</p>
                                    <p className="text-2xl font-bold text-city-blue">{totalItems}</p>
                                </div>
                                <div className="h-10 w-10 bg-city-blue/10 rounded-full flex items-center justify-center">
                                    <School className="h-5 w-5 text-city-blue" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Estados</p>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {new Set(schools.filter(s => s.state).map(s => s.state)).size}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-emerald-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-l-4 border-l-violet-500 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Cidades</p>
                                    <p className="text-2xl font-bold text-violet-600">
                                        {new Set(schools.filter(s => s.city).map(s => s.city)).size}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-violet-50 rounded-full flex items-center justify-center">
                                    <GraduationCap className="h-5 w-5 text-violet-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-l-4 border-l-orange-500 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Novas este Mês</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {newThisMonth}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-orange-50 rounded-full flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-orange-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="overflow-hidden shadow-premium bg-white/80 backdrop-blur-sm">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Instituições Cadastradas</CardTitle>
                                <CardDescription>Gerenciamento centralizado de escolas.</CardDescription>
                            </div>
                            {loading && (
                                <div className="flex items-center gap-2 text-xs text-city-blue font-medium">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Carregando...
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative">
                            <AnimatePresence>
                                {loading && (
                                    <motion.div
                                        initial={{ scaleX: 0, opacity: 0 }}
                                        animate={{ scaleX: 1, opacity: 1 }}
                                        exit={{ scaleX: 0, opacity: 0 }}
                                        className="absolute top-0 left-0 right-0 h-0.5 bg-city-blue origin-left z-20"
                                    />
                                )}
                            </AnimatePresence>

                            <Table>
                                <TableHeader className="bg-slate-50/30">
                                    <TableRow>
                                        <TableHead className="w-[30%]">Nome</TableHead>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Cidade/UF</TableHead>
                                        <TableHead>Contato</TableHead>
                                        <TableHead>Data Cadastro</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="wait">
                                        {schools.length === 0 && !loading ? (
                                            <motion.tr
                                                key="empty"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <TableCell colSpan={6} className="text-center py-16">
                                                    <div className="flex flex-col items-center">
                                                        <School className="h-10 w-10 text-slate-300 mb-2" />
                                                        <p className="text-slate-500">Nenhuma escola cadastrada.</p>
                                                        <Button variant="link" onClick={handleAdd}>Cadastrar primeira escola</Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ) : (
                                            schools.map((school, idx) => (
                                                <motion.tr
                                                    key={`${currentPage}-${school.id}`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ delay: idx * 0.01, duration: 0.2 }}
                                                    className={cn("group transition-colors hover:bg-slate-50", loading && "opacity-60")}
                                                >
                                                    <TableCell className={cn("font-semibold text-slate-700", loading && "opacity-60")}>{school.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-mono">{school.code}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {school.city && school.state ? (
                                                            <span className="flex items-center gap-1 text-slate-600 text-sm">
                                                                <MapPin className="h-3 w-3" /> {school.city} / {school.state}
                                                            </span>
                                                        ) : '--'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <div className="text-slate-600 truncate max-w-[150px]">{school.email || '--'}</div>
                                                            <div className="text-slate-400 text-xs">{school.phone || ''}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-500">
                                                        {new Date(school.created_at).toLocaleDateString('pt-BR')}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(school)} className="h-8 w-8 p-0">
                                                                <Icons.settings className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setSchoolToDelete(school)}
                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                                            >
                                                                <Icons.trash className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t bg-slate-50/20">
                                <p className="text-sm text-slate-500">
                                    Mostrando <b>{((currentPage - 1) * limit) + 1}</b> a <b>{Math.min(currentPage * limit, totalItems)}</b> de <b>{totalItems}</b>
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1 || loading}
                                        onMouseEnter={() => handlePrefetch(currentPage - 1)}
                                    >
                                        Anterior
                                    </Button>
                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <Button
                                                key={i + 1}
                                                variant={currentPage === i + 1 ? 'brand' : 'outline'}
                                                size="sm"
                                                className="w-8 h-8 p-0"
                                                onClick={() => setCurrentPage(i + 1)}
                                                onMouseEnter={() => handlePrefetch(i + 1)}
                                                disabled={loading}
                                            >
                                                {i + 1}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                        disabled={currentPage === totalPages || loading}
                                        onMouseEnter={() => handlePrefetch(currentPage + 1)}
                                    >
                                        Próxima
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <SchoolModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                school={selectedSchool}
                onSuccess={handleSuccess}
            />

            <ConfirmModal
                isOpen={!!schoolToDelete}
                onClose={() => setSchoolToDelete(null)}
                onConfirm={handleDelete}
                title="Excluir Escola?"
                description={`Tem certeza que deseja excluir "${schoolToDelete?.name}"? Todas as turmas e dados vinculados serão afetados.`}
                confirmText="Confirmar Exclusão"
                variant="destructive"
            />
        </div>
    )
}
