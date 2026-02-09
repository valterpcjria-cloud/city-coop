'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface CycleFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    cycle?: any // If provided, we are editing
}

export function CycleFormModal({ isOpen, onClose, onSuccess, cycle }: CycleFormModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        numero_ciclo: '',
        titulo: '',
        descricao: '',
        data_inicio: '',
        data_fim: ''
    })

    useEffect(() => {
        if (cycle) {
            setFormData({
                numero_ciclo: cycle.numero_ciclo?.toString() || '',
                titulo: cycle.titulo || '',
                descricao: cycle.descricao || '',
                data_inicio: cycle.data_inicio || '',
                data_fim: cycle.data_fim || ''
            })
        } else {
            setFormData({
                numero_ciclo: '',
                titulo: '',
                descricao: '',
                data_inicio: '',
                data_fim: ''
            })
        }
    }, [cycle, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const method = cycle ? 'PATCH' : 'POST'
        const url = cycle ? `/api/tests/cycles/${cycle.id}` : '/api/tests/cycles'

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    numero_ciclo: parseInt(formData.numero_ciclo)
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Erro ao salvar ciclo')
            }

            toast.success(cycle ? 'Ciclo atualizado!' : 'Ciclo criado com sucesso!')
            onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{cycle ? 'Editar Ciclo de Formação' : 'Novo Ciclo de Formação'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="index" className="text-right">Ciclo #</Label>
                        <Input
                            id="index"
                            type="number"
                            min="1"
                            max="6"
                            placeholder="1-6"
                            className="col-span-3"
                            value={formData.numero_ciclo}
                            onChange={(e) => setFormData({ ...formData, numero_ciclo: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="titulo" className="text-right">Título</Label>
                        <Input
                            id="titulo"
                            placeholder="Ex: História do Cooperativismo"
                            className="col-span-3"
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="descricao" className="text-right">Descrição</Label>
                        <Textarea
                            id="descricao"
                            placeholder="Descreva o objetivo deste ciclo..."
                            className="col-span-3"
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start">Data Início</Label>
                            <Input
                                id="start"
                                type="date"
                                value={formData.data_inicio}
                                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end">Data Fim</Label>
                            <Input
                                id="end"
                                type="date"
                                value={formData.data_fim}
                                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-city-blue" disabled={isLoading}>
                            {isLoading ? 'Salvando...' : 'Salvar Ciclo'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
