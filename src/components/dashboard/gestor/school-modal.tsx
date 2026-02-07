'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { Loader2, MapPin, CheckCircle2, Building2, GraduationCap, User, Globe } from 'lucide-react'

interface SchoolModalProps {
    isOpen: boolean
    onClose: () => void
    school?: any
    onSuccess: () => void
}

const ESTADOS_BRASIL = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

const CATEGORIAS_ADMINISTRATIVAS = [
    { value: 'publica_municipal', label: 'Pública Municipal' },
    { value: 'publica_estadual', label: 'Pública Estadual' },
    { value: 'publica_federal', label: 'Pública Federal' },
    { value: 'privada', label: 'Privada' }
]

const ETAPAS_ENSINO = [
    { value: 'creche', label: 'Creche' },
    { value: 'pre_escola', label: 'Pré-Escola' },
    { value: 'fundamental_anos_iniciais', label: 'Ensino Fundamental - Anos Iniciais' },
    { value: 'fundamental_anos_finais', label: 'Ensino Fundamental - Anos Finais' },
    { value: 'ensino_medio', label: 'Ensino Médio' },
    { value: 'eja', label: 'EJA - Educação de Jovens e Adultos' },
    { value: 'educacao_especial', label: 'Educação Especial' },
    { value: 'atividade_complementar', label: 'Atividade Complementar' }
]

const TIPOS_LOCALIZACAO = [
    { value: 'urbana', label: 'Urbana' },
    { value: 'rural', label: 'Rural' }
]

export function SchoolModal({ isOpen, onClose, school, onSuccess }: SchoolModalProps) {
    const [loading, setLoading] = useState(false)
    const [cepLoading, setCepLoading] = useState(false)
    const [cepFound, setCepFound] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        inep_code: '',
        administrative_category: '',
        education_stages: [] as string[],
        location_type: '',
        director_name: '',
        cep: '',
        city: '',
        state: '',
        neighborhood: '',
        address: '',
        address_number: '',
        address_complement: '',
        phone: '',
        secondary_phone: '',
        email: '',
        website: ''
    })

    useEffect(() => {
        if (school) {
            setFormData({
                name: school.name || '',
                code: school.code || '',
                inep_code: school.inep_code || '',
                administrative_category: school.administrative_category || '',
                education_stages: school.education_stages || [],
                location_type: school.location_type || '',
                director_name: school.director_name || '',
                cep: school.cep || '',
                city: school.city || '',
                state: school.state || '',
                neighborhood: school.neighborhood || '',
                address: school.address || '',
                address_number: school.address_number || '',
                address_complement: school.address_complement || '',
                phone: school.phone || '',
                secondary_phone: school.secondary_phone || '',
                email: school.email || '',
                website: school.website || ''
            })
        } else {
            setFormData({
                name: '',
                code: '',
                inep_code: '',
                administrative_category: '',
                education_stages: [],
                location_type: '',
                director_name: '',
                cep: '',
                city: '',
                state: '',
                neighborhood: '',
                address: '',
                address_number: '',
                address_complement: '',
                phone: '',
                secondary_phone: '',
                email: '',
                website: ''
            })
            setCepFound(false)
        }
    }, [school, isOpen])

    // Format CEP as 99999-999
    const formatCep = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 5) return numbers
        return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
    }

    // Fetch address from ViaCEP API
    const fetchAddressFromCep = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '')
        if (cleanCep.length !== 8) return

        setCepLoading(true)
        setCepFound(false)

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
            const data = await response.json()

            if (data.erro) {
                toast.error('CEP não encontrado')
                return
            }

            setFormData(prev => ({
                ...prev,
                city: data.localidade || '',
                state: data.uf || '',
                neighborhood: data.bairro || '',
                address: data.logradouro || ''
            }))

            setCepFound(true)
            toast.success('Endereço encontrado!')
        } catch (error) {
            toast.error('Erro ao buscar CEP')
        } finally {
            setCepLoading(false)
        }
    }

    const handleCepChange = (value: string) => {
        const formatted = formatCep(value)
        setFormData({ ...formData, cep: formatted })

        if (formatted.replace(/\D/g, '').length === 8) {
            fetchAddressFromCep(formatted)
        } else {
            setCepFound(false)
        }
    }

    const handleEducationStageChange = (stage: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            education_stages: checked
                ? [...prev.education_stages, stage]
                : prev.education_stages.filter(s => s !== stage)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/gestor/schools', {
                method: school ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(school ? { ...formData, id: school.id } : formData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao salvar escola')
            }

            toast.success(school ? 'Escola atualizada com sucesso!' : 'Escola cadastrada com sucesso!')
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
            <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="flex items-center gap-2 text-city-blue">
                        <Icons.school className="h-5 w-5" />
                        {school ? 'Editar Escola' : 'Nova Escola'}
                    </DialogTitle>
                    <DialogDescription>
                        {school ? 'Atualize as informações da instituição.' : 'Cadastre uma nova instituição parceira conforme modelo INEP/MEC.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Seção: Identificação */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                            <Building2 className="h-4 w-4 text-city-blue" />
                            Identificação
                        </h4>

                        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                            {/* Nome - Full Width */}
                            <div className="col-span-3 space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                    Nome da Escola <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Centro Municipal de Educação Básica Maria de Nondas"
                                    className="h-11"
                                    required
                                />
                            </div>

                            {/* Código Interno */}
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                                    Código Interno <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="Ex: CMEB01"
                                    className="h-11 font-mono"
                                    maxLength={10}
                                    required
                                />
                            </div>

                            {/* Código INEP */}
                            <div className="space-y-2">
                                <Label htmlFor="inep_code" className="text-sm font-medium text-gray-700">
                                    Código INEP
                                </Label>
                                <Input
                                    id="inep_code"
                                    value={formData.inep_code}
                                    onChange={(e) => setFormData({ ...formData, inep_code: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                                    placeholder="Ex: 52047156"
                                    className="h-11 font-mono"
                                    maxLength={8}
                                />
                            </div>

                            {/* Categoria Administrativa */}
                            <div className="space-y-2">
                                <Label htmlFor="administrative_category" className="text-sm font-medium text-gray-700">
                                    Categoria Administrativa
                                </Label>
                                <Select
                                    value={formData.administrative_category}
                                    onValueChange={(value) => setFormData({ ...formData, administrative_category: value })}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIAS_ADMINISTRATIVAS.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Localização */}
                            <div className="space-y-2">
                                <Label htmlFor="location_type" className="text-sm font-medium text-gray-700">
                                    Localização
                                </Label>
                                <Select
                                    value={formData.location_type}
                                    onValueChange={(value) => setFormData({ ...formData, location_type: value })}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIPOS_LOCALIZACAO.map((loc) => (
                                            <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Diretor */}
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="director_name" className="text-sm font-medium text-gray-700">
                                    Nome do(a) Diretor(a)
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="director_name"
                                        value={formData.director_name}
                                        onChange={(e) => setFormData({ ...formData, director_name: e.target.value })}
                                        placeholder="Nome completo"
                                        className="h-11 pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção: Etapas de Ensino */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                            <GraduationCap className="h-4 w-4 text-city-blue" />
                            Etapas de Ensino Oferecidas
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                            {ETAPAS_ENSINO.map((etapa) => (
                                <div key={etapa.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={etapa.value}
                                        checked={formData.education_stages.includes(etapa.value)}
                                        onCheckedChange={(checked) => handleEducationStageChange(etapa.value, checked as boolean)}
                                    />
                                    <Label htmlFor={etapa.value} className="text-sm font-normal cursor-pointer">
                                        {etapa.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Seção: Endereço */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                            <MapPin className="h-4 w-4 text-city-blue" />
                            Endereço
                        </h4>

                        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                            {/* CEP */}
                            <div className="space-y-2">
                                <Label htmlFor="cep" className="text-sm font-medium text-gray-700">CEP</Label>
                                <div className="relative">
                                    <Input
                                        id="cep"
                                        value={formData.cep}
                                        onChange={(e) => handleCepChange(e.target.value)}
                                        placeholder="00000-000"
                                        className="h-11 pr-10"
                                        maxLength={9}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {cepLoading && <Loader2 className="h-4 w-4 animate-spin text-city-blue" />}
                                        {cepFound && !cepLoading && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    </div>
                                </div>
                            </div>

                            {/* Estado */}
                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-sm font-medium text-gray-700">UF</Label>
                                <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="UF" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ESTADOS_BRASIL.map((uf) => (
                                            <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Cidade */}
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="city" className="text-sm font-medium text-gray-700">Município</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Ex: Luziânia"
                                    className="h-11"
                                />
                            </div>

                            {/* Logradouro */}
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="address" className="text-sm font-medium text-gray-700">Logradouro</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Rua, Avenida, Quadra..."
                                    className="h-11"
                                />
                            </div>

                            {/* Número */}
                            <div className="space-y-2">
                                <Label htmlFor="address_number" className="text-sm font-medium text-gray-700">Número</Label>
                                <Input
                                    id="address_number"
                                    value={formData.address_number}
                                    onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                                    placeholder="123"
                                    className="h-11"
                                />
                            </div>

                            {/* Bairro */}
                            <div className="space-y-2">
                                <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">Bairro</Label>
                                <Input
                                    id="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                    placeholder="Ex: Centro"
                                    className="h-11"
                                />
                            </div>

                            {/* Complemento */}
                            <div className="col-span-4 space-y-2">
                                <Label htmlFor="address_complement" className="text-sm font-medium text-gray-700">Complemento</Label>
                                <Input
                                    id="address_complement"
                                    value={formData.address_complement}
                                    onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                                    placeholder="Bloco, Sala, Andar..."
                                    className="h-11"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção: Contato */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                            <Globe className="h-4 w-4 text-city-blue" />
                            Contato
                        </h4>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            {/* Telefone 1 */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Telefone Principal</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(61) 3333-4444"
                                    className="h-11"
                                />
                            </div>

                            {/* Telefone 2 */}
                            <div className="space-y-2">
                                <Label htmlFor="secondary_phone" className="text-sm font-medium text-gray-700">Telefone Secundário</Label>
                                <Input
                                    id="secondary_phone"
                                    value={formData.secondary_phone}
                                    onChange={(e) => setFormData({ ...formData, secondary_phone: e.target.value })}
                                    placeholder="(61) 99999-8888"
                                    className="h-11"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail Institucional</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="contato@escola.edu.br"
                                    className="h-11"
                                />
                            </div>

                            {/* Website */}
                            <div className="space-y-2">
                                <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
                                <Input
                                    id="website"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://escola.edu.br"
                                    className="h-11"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="brand" disabled={loading}>
                            {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            {school ? 'Salvar Alterações' : 'Cadastrar Escola'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
