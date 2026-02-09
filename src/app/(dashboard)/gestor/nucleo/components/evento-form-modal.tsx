'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface EventoFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    evento?: any
}

const TIPO_EVENTO = [
    'Cultural', 'Esportivo', 'Educacional', 'Social', 'Ambiental', 'Outro'
]

export function EventoFormModal({ isOpen, onClose, onSuccess, evento }: EventoFormModalProps) {
    const [loading, setLoading] = useState(false)
    const [nucleos, setNucleos] = useState<any[]>([])
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        tipo_evento: '',
        nucleo_escolar_id: '',
        data_planejada: '',
        local: '',
    })

    useEffect(() => {
        async function fetchNucleos() {
            try {
                const res = await fetch('/api/nucleo')
                const data = await res.json()
                if (Array.isArray(data)) setNucleos(data)
            } catch (error) {
                console.error('Error fetching nucleos:', error)
            }
        }
        if (isOpen) {
            fetchNucleos()
            if (evento) {
                setFormData({
                    titulo: evento.titulo || '',
                    descricao: evento.descricao || '',
                    tipo_evento: evento.tipo_evento || '',
                    nucleo_escolar_id: evento.nucleo_escolar_id || '',
                    data_planejada: evento.data_planejada ? new Date(evento.data_planejada).toISOString().split('T')[0] : '',
                    local: evento.local || '',
                })
            } else {
                setFormData({
                    titulo: '',
                    descricao: '',
                    tipo_evento: '',
                    nucleo_escolar_id: '',
                    data_planejada: '',
                    local: '',
                })
            }
        }
    }, [isOpen, evento])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.titulo || !formData.nucleo_escolar_id || !formData.tipo_evento) {
            toast.error('Preencha os campos obrigatórios')
            return
        }

        setLoading(true)
        try {
            const method = evento ? 'PATCH' : 'POST'
            const url = evento ? `/api/nucleo/eventos/${evento.id}` : '/api/nucleo/eventos'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Falha ao salvar evento')
            }

            toast.success(evento ? 'Evento atualizado!' : 'Evento criado com sucesso!')
            onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-city-blue">
                        {evento ? 'Editar Evento' : 'Novo Co-Evento'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="titulo">Título do Evento *</Label>
                        <Input
                            id="titulo"
                            placeholder="Ex: Mutirão de Limpeza Ambiental"
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nucleo">Núcleo Organizador *</Label>
                            <Select
                                value={formData.nucleo_escolar_id}
                                onValueChange={(val) => setFormData({ ...formData, nucleo_escolar_id: val })}
                            >
                                <SelectTrigger id="nucleo">
                                    <SelectValue placeholder="Selecione o núcleo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {nucleos.map((n) => (
                                        <SelectItem key={n.id} value={n.id}>
                                            {n.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo de Evento *</Label>
                            <Select
                                value={formData.tipo_evento}
                                onValueChange={(val) => setFormData({ ...formData, tipo_evento: val })}
                            >
                                <SelectTrigger id="tipo">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIPO_EVENTO.map((t) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="data">Data Planejada</Label>
                            <Input
                                id="data"
                                type="date"
                                value={formData.data_planejada}
                                onChange={(e) => setFormData({ ...formData, data_planejada: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="local">Local</Label>
                            <Input
                                id="local"
                                placeholder="Escola, Praça, etc."
                                value={formData.local}
                                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição / Objetivos</Label>
                        <Textarea
                            id="descricao"
                            placeholder="Descreva brevemente o evento..."
                            className="h-24"
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-city-blue" disabled={loading}>
                            {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            {evento ? 'Salvar Alterações' : 'Criar Evento'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
