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
    const [isLoadingResults, setIsLoadingResults] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [municipalities, setMunicipalities] = useState<string[]>([])
    const [selectedMunicipality, setSelectedMunicipality] = useState<string>('')
    const [deletionType, setDeletionType] = useState<'schools' | 'students' | 'teachers'>('schools')
    const [results, setResults] = useState<any[]>([])
    const [selectedIds, setSelectedIds] = useState<string[]>([])
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

    const fetchResults = async (city: string, type: string, page: number) => {
        setIsLoadingResults(true)
        try {
            const response = await fetch(`/api/superadmin/municipalities?city=${city}&type=${type}&page=${page}&limit=${limit}`)
            const data = await response.json()
            if (data.success) {
                setResults(data.results || [])
                setTotalPages(data.pagination.totalPages)
                setTotalItems(data.pagination.total)
            } else {
                toast.error(data.error || 'Erro ao carregar dados')
            }
        } catch (error) {
            toast.error('Erro ao buscar dados')
        } finally {
            setIsLoadingResults(false)
        }
    }

    useEffect(() => {
        if (selectedMunicipality) {
            fetchResults(selectedMunicipality, deletionType, currentPage)
        } else {
            setResults([])
        }
    }, [selectedMunicipality, deletionType, currentPage])

    const toggleItem = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        )
    }

    const toggleAllOnPage = () => {
        const pageIds = results.map(r => r.id)
        const allSelected = pageIds.every(id => selectedIds.includes(id))

        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)))
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...pageIds])])
        }
    }

    const handleBulkDelete = async (confirmText: string) => {
        setIsDeleting(true)
        try {
            const body: any = {
                municipality: selectedMunicipality,
                type: deletionType,
                confirmMunicipality: confirmText
            }

            if (deletionType === 'schools') body.schoolIds = selectedIds
            else if (deletionType === 'students') body.studentIds = selectedIds
            else if (deletionType === 'teachers') body.teacherIds = selectedIds

            const response = await fetch('/api/superadmin/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await response.json()
            if (data.success) {
                toast.success(data.message)
                setSelectedMunicipality('')
                setSelectedIds([])
                setCurrentPage(1)
                fetchMunicipalities()
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

    const getTargetTitle = () => {
        if (deletionType === 'students') return 'Estudantes Encontrados'
        if (deletionType === 'teachers') return 'Professores Encontrados'
        return 'Escolas Encontradas'
    }

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
                        <CardTitle className="text-lg">Configurações</CardTitle>
                        <CardDescription>Defina o que você deseja apagar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Município</label>
                            <Select
                                value={selectedMunicipality}
                                onValueChange={(val) => {
                                    setSelectedMunicipality(val)
                                    setSelectedIds([])
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

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Tipo de Exclusão</label>
                            <Select
                                value={deletionType}
                                onValueChange={(val: any) => {
                                    setDeletionType(val)
                                    setSelectedIds([])
                                    setCurrentPage(1)
                                }}
                            >
                                <SelectTrigger className="premium-input h-12 bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="schools">Escolas (Completo)</SelectItem>
                                    <SelectItem value="students">Apenas Estudantes</SelectItem>
                                    <SelectItem value="teachers">Apenas Professores</SelectItem>
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
                                    Você está prestes a excluir <strong>{deletionType === 'schools' ? 'Escolas' : deletionType === 'students' ? 'Estudantes' : 'Professores'}</strong> em <strong>{selectedMunicipality}</strong>.
                                </p>
                            </div>
                        )}

                        <Button
                            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide"
                            disabled={!selectedMunicipality || isDeleting}
                            onClick={() => setIsDialogOpen(true)}
                        >
                            {selectedIds.length > 0
                                ? `Excluir ${selectedIds.length} selecionado(s)`
                                : 'Excluir TUDO do município'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Results List */}
                <Card className="lg:col-span-2 shadow-sm border-slate-200/60 min-h-[500px] flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">{getTargetTitle()}</CardTitle>
                            <CardDescription>
                                {selectedMunicipality
                                    ? `Total: ${totalItems} registros em ${selectedMunicipality}`
                                    : 'Selecione um município para listar os registros'}
                            </CardDescription>
                        </div>
                        {selectedMunicipality && totalItems > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleAllOnPage}
                                className="text-xs font-semibold"
                            >
                                {results.length > 0 && results.every(r => selectedIds.includes(r.id))
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
                        ) : isLoadingResults ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <p className="text-sm font-medium">Nenhum registro encontrado para este tipo no município.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleItem(item.id)}
                                        className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer group ${selectedIds.includes(item.id)
                                            ? 'bg-red-50/50 border-red-200 ring-1 ring-red-200'
                                            : 'bg-slate-50 border-slate-200 hover:border-red-200'
                                            }`}
                                    >
                                        <Checkbox
                                            checked={selectedIds.includes(item.id)}
                                            onCheckedChange={() => toggleItem(item.id)}
                                            className="mt-1"
                                        />
                                        <div className="space-y-1 overflow-hidden">
                                            <p className={`text-sm font-bold truncate ${selectedIds.includes(item.id) ? 'text-red-700' : 'text-slate-700'
                                                }`}>
                                                {item.name}
                                            </p>
                                            {item.schools && (
                                                <p className="text-[10px] text-tech-gray font-medium flex items-center gap-1">
                                                    <Icons.school className="h-3 w-3" />
                                                    {item.schools.name}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-slate-400 font-mono">ID: {item.id.slice(0, 8)}...</p>
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
                                    disabled={currentPage === 1 || isLoadingResults}
                                >
                                    Anterior
                                </Button>
                                <div className="flex gap-1 overflow-x-auto max-w-[200px] no-scrollbar">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <Button
                                            key={i + 1}
                                            variant={currentPage === i + 1 ? 'brand' : 'outline'}
                                            size="sm"
                                            className="w-8 h-8 p-0 shrink-0"
                                            onClick={() => setCurrentPage(i + 1)}
                                            disabled={isLoadingResults}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages || isLoadingResults}
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
                schoolIds={selectedIds}
                type={deletionType}
                onConfirm={handleBulkDelete}
            />
        </div>
    )
}
