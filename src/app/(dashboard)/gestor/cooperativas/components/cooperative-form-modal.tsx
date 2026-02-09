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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Cooperative } from '@/types/coop-mgmt'

interface CooperativeFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    cooperative?: Cooperative | null
}

const RAMOS = [
    'Agropecuário', 'Consumo', 'Crédito', 'Educacional', 'Habitacional',
    'Infraestrutura', 'Mineral', 'Produção', 'Saúde', 'Trabalho',
    'Transporte', 'Turismo e Lazer', 'Outro'
]

const ESTADOS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export function CooperativeFormModal({ isOpen, onClose, onSuccess, cooperative }: CooperativeFormModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        razao_social: '',
        nome_fantasia: '',
        cnpj: '',
        ramo_cooperativista: '',
        endereco: '',
        cidade: '',
        estado: '',
        responsavel_nome: '',
        responsavel_email: '',
        descricao: '',
        ativo: true
    })

    useEffect(() => {
        if (cooperative) {
            setFormData({
                razao_social: cooperative.razao_social || '',
                nome_fantasia: cooperative.nome_fantasia || '',
                cnpj: cooperative.cnpj || '',
                ramo_cooperativista: cooperative.ramo_cooperativista || '',
                endereco: cooperative.endereco || '',
                cidade: cooperative.cidade || '',
                estado: cooperative.estado || '',
                responsavel_nome: cooperative.responsavel_nome || '',
                responsavel_email: cooperative.responsavel_email || '',
                descricao: (cooperative as any).descricao || '',
                ativo: cooperative.ativo ?? true
            })
        } else {
            setFormData({
                razao_social: '',
                nome_fantasia: '',
                cnpj: '',
                ramo_cooperativista: '',
                endereco: '',
                cidade: '',
                estado: '',
                responsavel_nome: '',
                responsavel_email: '',
                descricao: '',
                ativo: true
            })
        }
    }, [cooperative, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const method = cooperative ? 'PATCH' : 'POST'
            const url = cooperative ? `/api/cooperatives/${cooperative.id}` : '/api/cooperatives'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Erro ao salvar cooperativa')
            }

            toast.success(cooperative ? 'Cooperativa atualizada!' : 'Cooperativa cadastrada!')
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-city-blue">
                        {cooperative ? 'Editar Cooperativa' : 'Nova Cooperativa Parceira'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="razao_social">Razão Social *</Label>
                            <Input
                                id="razao_social"
                                required
                                value={formData.razao_social}
                                onChange={e => setFormData({ ...formData, razao_social: e.target.value })}
                                placeholder="Ex: Cooperativa de Crédito City Coop LTDA"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                            <Input
                                id="nome_fantasia"
                                value={formData.nome_fantasia}
                                onChange={e => setFormData({ ...formData, nome_fantasia: e.target.value })}
                                placeholder="Ex: City Coop"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input
                                id="cnpj"
                                value={formData.cnpj}
                                onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                                placeholder="00.000.000/0000-00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ramo">Ramo Cooperativista *</Label>
                            <Select
                                value={formData.ramo_cooperativista}
                                onValueChange={v => setFormData({ ...formData, ramo_cooperativista: v })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o ramo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RAMOS.map(ramo => (
                                        <SelectItem key={ramo} value={ramo}>{ramo}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cidade">Cidade *</Label>
                            <Input
                                id="cidade"
                                required
                                value={formData.cidade}
                                onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="estado">Estado *</Label>
                            <Select
                                value={formData.estado}
                                onValueChange={v => setFormData({ ...formData, estado: v })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="UF" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ESTADOS.map(uf => (
                                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="endereco">Endereço Completo</Label>
                            <Input
                                id="endereco"
                                value={formData.endereco}
                                onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="responsavel_nome">Responsável na Cooperativa *</Label>
                            <Input
                                id="responsavel_nome"
                                required
                                value={formData.responsavel_nome}
                                onChange={e => setFormData({ ...formData, responsavel_nome: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="responsavel_email">E-mail do Responsável *</Label>
                            <Input
                                id="responsavel_email"
                                type="email"
                                required
                                value={formData.responsavel_email}
                                onChange={e => setFormData({ ...formData, responsavel_email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="descricao">Descrição / Sobre a Cooperativa</Label>
                            <Textarea
                                id="descricao"
                                value={formData.descricao}
                                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                placeholder="Conte um pouco sobre a atuação da cooperativa..."
                                className="h-24"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-city-blue hover:bg-city-blue/90" disabled={loading}>
                            {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            {cooperative ? 'Salvar Alterações' : 'Cadastrar Cooperativa'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
