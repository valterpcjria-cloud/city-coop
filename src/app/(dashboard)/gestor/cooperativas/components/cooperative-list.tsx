'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/ui/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cooperative } from '@/types/coop-mgmt'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export interface CooperativeListProps {
    onEdit: (coop: Cooperative) => void
    refreshTrigger: number
}

export function CooperativeList({ onEdit, refreshTrigger }: CooperativeListProps) {
    const [cooperatives, setCooperatives] = useState<Cooperative[]>([])
    const [loading, setLoading] = useState(true)
    const [coopToDelete, setCoopToDelete] = useState<string | null>(null)

    const fetchCooperatives = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/cooperatives')
            const data = await response.json()
            if (Array.isArray(data)) {
                setCooperatives(data)
            } else {
                setCooperatives([])
            }
        } catch (error) {
            console.error('Error fetching cooperatives:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCooperatives()
    }, [refreshTrigger])

    const handleDelete = async () => {
        if (!coopToDelete) return
        try {
            const response = await fetch(`/api/cooperatives/${coopToDelete}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Erro ao excluir cooperativa')
            toast.success('Cooperativa removida com sucesso')
            fetchCooperatives()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setCoopToDelete(null)
        }
    }

    if (loading) return <p className="text-sm text-muted-foreground animate-pulse">Carregando cooperativas...</p>

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cooperatives.map((coop) => (
                    <Card key={coop.id} className="overflow-hidden relative">
                        <CardHeader className="p-4 bg-slate-50 border-b">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base font-bold text-city-blue truncate">
                                    {coop.nome_fantasia || coop.razao_social}
                                </CardTitle>
                                <Badge variant={coop.ativo ? 'default' : 'secondary'}>
                                    {coop.ativo ? 'Ativa' : 'Inativa'}
                                </Badge>
                            </div>
                            <div className="absolute top-2 right-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Icons.settings className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(coop)}>
                                            <Icons.settings className="mr-2 h-4 w-4" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => setCoopToDelete(coop.id)}
                                        >
                                            <Icons.trash className="mr-2 h-4 w-4" />
                                            Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <div className="flex items-center text-sm">
                                <Icons.target className="mr-2 h-4 w-4 text-coop-orange" />
                                <span>{coop.ramo_cooperativista}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <Icons.settings className="mr-2 h-4 w-4 text-tech-gray" />
                                <span>{coop.cidade} - {coop.estado}</span>
                            </div>
                            <div className="pt-2 flex justify-end space-x-2">
                                <Button variant="outline" size="sm">Oportunidades</Button>
                                <Button size="sm" className="bg-city-blue">Matching</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {cooperatives.length === 0 && (
                    <Card className="col-span-full py-12 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center space-y-2">
                            <Icons.building className="h-10 w-10 text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground">Nenhuma cooperativa parceira cadastrada.</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <AlertDialog open={!!coopToDelete} onOpenChange={() => setCoopToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Cooperativa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso removerá permanentemente a cooperativa e todas as suas oportunidades vinculadas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                            Confirmar Exclusão
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
