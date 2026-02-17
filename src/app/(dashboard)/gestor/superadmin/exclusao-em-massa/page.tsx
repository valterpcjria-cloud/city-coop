'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { BulkDeleteDialog } from '@/components/superadmin/bulk-delete-dialog'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function BulkDeletePage() {
    const router = useRouter()
    const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(true)
    const [isLoadingSchools, setIsLoadingSchools] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [municipalities, setMunicipalities] = useState<string[]>([])
    const [selectedMunicipality, setSelectedMunicipality] = useState<string>('')
    const [schools, setSchools] = useState<any[]>([])
    const [selectedSchools, setSelectedSchools] = useState<string[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalItems, setTotalItems] = useState(0)
    const limit = 25

    useEffect(() => {
        fetchMunicipalities()
    }, [])

    const fetchMunicipalities = async () => {
        setIsLoadingMunicipalities(true)
        try {
            const response = await fetch('/api/superadmin/municipalities')
            const data = await response.json()
            if (data.success) {
                setMunicipalities(data.municipalities || [])
            } else {
                toast.error(data.error || 'Erro ao carregar municípios')
                if (response.status === 403) router.push('/gestor')
            }
        } catch (error) {
            toast.error('Erro de conexão com o servidor')
        } finally {
            setIsLoadingMunicipalities(false)
        }
    }

    const fetchSchools = async (city: string, page: number) => {
        setIsLoadingSchools(true)
        try {
            const response = await fetch(`/api/superadmin/municipalities?city=${city}&page=${page}&limit=${limit}`)
            const data = await response.json()
            if (data.success) {
                setSchools(data.schools || [])
                setTotalPages(data.pagination.totalPages)
                setTotalItems(data.pagination.total)
            } else {
                toast.error(data.error || 'Erro ao carregar escolas')
            }
        } catch (error) {
            toast.error('Erro ao buscar escolas')
        } finally {
            setIsLoadingSchools(false)
        }
    }

    useEffect(() => {
        if (selectedMunicipality) {
            fetchSchools(selectedMunicipality, currentPage)
        } else {
            setSchools([])
        }
    }, [selectedMunicipality, currentPage])

    const toggleSchool = (schoolId: string) => {
        setSelectedSchools(prev =>
            prev.includes(schoolId)
                ? prev.filter(id => id !== schoolId)
                : [...prev, schoolId]
        )
    }

    const toggleAllOnPage = () => {
        const pageSchoolIds = schools.map(s => s.id)
        const allSelected = pageSchoolIds.every(id => selectedSchools.includes(id))

        if (allSelected) {
            setSelectedSchools(prev => prev.filter(id => !pageSchoolIds.includes(id)))
        } else {
            setSelectedSchools(prev => [...new Set([...prev, ...pageSchoolIds])])
        }
    }

    const handleBulkDelete = async (confirmText: string) => {
        setIsDeleting(true)
        try {
            const response = await fetch('/api/superadmin/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    municipality: selectedMunicipality,
                    schoolIds: selectedSchools,
                    confirmMunicipality: confirmText
                })
            })

            const data = await response.json()
            if (data.success) {
                toast.success(`Sucesso! ${data.details.schoolsDeleted} escolas e ${data.details.studentsDeleted} alunos removidos.`)
                setSelectedMunicipality('')
                setSelectedSchools([])
                setCurrentPage(1)
                fetchMunicipalities() // Refresh data
            } else {
                toast.error(data.error || 'Erro ao realizar exclusão')
            }
        } catch (error) {
            toast.error('Erro ao processar solicitação')
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoadingMunicipalities) {
        return (
            <div className="space-y-6 container mx-auto py-8">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
        )
    }

    const startItem = ((currentPage - 1) * limit) + 1
    const endItem = Math.min(currentPage * limit, totalItems)

    return (
        <div className="space-y-6 container mx-auto py-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 rounded-2xl">
                        <Icons.trash className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                            Limpeza Crítica de Dados
                        </h1>
                        <p className="text-tech-gray">
                            Ferramenta EXCLUSIVA de Superadmin para remoção em massa.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Filters sidebar */}
                <Card className="lg:col-span-1 shadow-sm border-slate-200/60 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Filtros</CardTitle>
                        <CardDescription>Selecione a abrangência da exclusão</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Município</label>
                            <Select
                                value={selectedMunicipality}
                                onValueChange={(val) => {
                                    setSelectedMunicipality(val)
                                    setSelectedSchools([])
                                    setCurrentPage(1)
                                }}
                            >
                                <SelectTrigger className="premium-input h-12 bg-white">
                                    <SelectValue placeholder="Selecione um município..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {municipalities.map(city => (
                                        <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedMunicipality && (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
                                <div className="flex items-center gap-2 text-amber-800 text-sm font-bold">
                                    <Icons.alertTriangle className="h-4 w-4" />
                                    Atenção
                                </div>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    Ao selecionar um município, você pode optar por apagar <strong>todas</strong> as suas escolas ou apenas as selecionadas na lista ao lado.
                                </p>
                            </div>
                        )}

                        <Button
                            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide"
                            disabled={!selectedMunicipality || isDeleting}
                            onClick={() => setIsDialogOpen(true)}
                        >
                            {selectedSchools.length > 0
                                ? `Excluir ${selectedSchools.length} selecionada(s)`
                                : 'Excluir TODAS do município'}
                        </Button>
                    </CardContent>
                </Card>

                {/* School List */}
                <Card className="lg:col-span-2 shadow-sm border-slate-200/60 min-h-[500px] flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Escolas Encontradas</CardTitle>
                            <CardDescription>
                                {selectedMunicipality
                                    ? `Total: ${totalItems} escolas em ${selectedMunicipality}`
                                    : 'Selecione um município para listar as escolas'}
                            </CardDescription>
                        </div>
                        {selectedMunicipality && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleAllOnPage}
                                className="text-xs font-semibold"
                            >
                                {schools.length > 0 && schools.every(s => selectedSchools.includes(s.id))
                                    ? 'Limpar Página'
                                    : 'Selecionar Página'}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1">
                        {!selectedMunicipality ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                                <Icons.search className="h-12 w-12 opacity-20" />
                                <p className="text-sm font-medium">Aguardando filtro de município...</p>
                            </div>
                        ) : isLoadingSchools ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {schools.map((school) => (
                                    <div
                                        key={school.id}
                                        onClick={() => toggleSchool(school.id)}
                                        className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer group ${selectedSchools.includes(school.id)
                                            ? 'bg-red-50/50 border-red-200 ring-1 ring-red-200'
                                            : 'bg-slate-50 border-slate-200 hover:border-red-200'
                                            }`}
                                    >
                                        <Checkbox
                                            checked={selectedSchools.includes(school.id)}
                                            onCheckedChange={() => toggleSchool(school.id)}
                                            className="mt-1"
                                        />
                                        <div className="space-y-1">
                                            <p className={`text-sm font-bold ${selectedSchools.includes(school.id) ? 'text-red-700' : 'text-slate-700'
                                                }`}>
                                                {school.name}
                                            </p>
                                            <p className="text-xs text-tech-gray font-mono">ID: {school.id.slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t bg-slate-50/20">
                            <p className="text-sm text-slate-500">
                                Mostrando <b>{startItem}</b> a <b>{endItem}</b> de <b>{totalItems}</b>
                            </p>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1 || isLoadingSchools}
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
                                            disabled={isLoadingSchools}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages || isLoadingSchools}
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            <BulkDeleteDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                municipality={selectedMunicipality}
                schoolsCount={totalItems}
                schoolIds={selectedSchools}
                onConfirm={handleBulkDelete}
            />
        </div>
    )
}
