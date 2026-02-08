'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/sonner'
import { Loader2, UserPlus, Save } from 'lucide-react'

interface User {
    id: string
    user_id: string
    name: string
    email: string
    phone: string | null
    role: 'gestor' | 'professor' | 'estudante'
    school_id: string | null
    is_superadmin: boolean
    is_active: boolean
    grade_level?: string
}

interface School {
    id: string
    name: string
}

interface UserModalProps {
    isOpen: boolean
    onClose: () => void
    user: User | null
    schools: School[]
    onSuccess: () => void
}

const gradeOptions = [
    { value: '9EF', label: '9º Ano - Fundamental' },
    { value: '1EM', label: '1º Ano - Médio' },
    { value: '2EM', label: '2º Ano - Médio' },
    { value: '3EM', label: '3º Ano - Médio' },
]

export function UserModal({ isOpen, onClose, user, schools, onSuccess }: UserModalProps) {
    const isEditing = !!user
    const [isLoading, setIsLoading] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [cpf, setCpf] = useState('')
    const [role, setRole] = useState<string>('professor')
    const [schoolId, setSchoolId] = useState<string>('')
    const [gradeLevel, setGradeLevel] = useState<string>('')
    const [isSuperadmin, setIsSuperadmin] = useState(false)

    // Sync form state when user prop changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setName(user?.name || '')
            setEmail(user?.email || '')
            setPhone(user?.phone || '')
            setCpf(user?.cpf || '')
            setRole(user?.role || 'professor')
            setSchoolId(user?.school_id || '')
            setGradeLevel(user?.grade_level || '')
            setIsSuperadmin(user?.is_superadmin || false)
        }
    }, [user, isOpen])

    // Reset form when user changes
    const resetForm = () => {
        setName('')
        setEmail('')
        setPhone('')
        setCpf('')
        setRole('professor')
        setSchoolId('')
        setGradeLevel('')
        setIsSuperadmin(false)
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm()
            onClose()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const payload = {
                ...(isEditing && { id: user.id }),
                name,
                email,
                phone: phone || null,
                cpf: (role === 'professor' || role === 'estudante') && cpf ? cpf : null,
                role,
                school_id: (role === 'professor' || role === 'estudante') && schoolId ? schoolId : null,
                grade_level: role === 'estudante' && gradeLevel ? gradeLevel : null,
                is_superadmin: role === 'gestor' ? isSuperadmin : false
            }

            const response = await fetch('/api/gestor/users', {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao salvar usuário')
            }

            toast.success(
                isEditing ? 'Usuário atualizado!' : 'Usuário criado!',
                { description: `${name} foi ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso.` }
            )
            onSuccess()
            onClose()
        } catch (error: any) {
            toast.error('Erro', { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <UserPlus className="h-5 w-5 text-city-blue" />
                        {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Atualize as informações do usuário abaixo.'
                            : 'Preencha os dados para criar um novo usuário.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Digite o nome completo"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@exemplo.com"
                            required
                            disabled={isEditing}
                        />
                        {isEditing && (
                            <p className="text-xs text-muted-foreground">
                                O email não pode ser alterado após o cadastro.
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(00) 00000-0000"
                        />
                    </div>

                    {/* CPF - only for professors and students */}
                    {(role === 'professor' || role === 'estudante') && (
                        <div className="space-y-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input
                                id="cpf"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                placeholder="000.000.000-00"
                                maxLength={14}
                            />
                        </div>
                    )}

                    {/* Role */}
                    <div className="space-y-2">
                        <Label>Tipo de Usuário *</Label>
                        <Select
                            value={role}
                            onValueChange={setRole}
                            disabled={isEditing}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gestor">Gestor</SelectItem>
                                <SelectItem value="professor">Professor</SelectItem>
                                <SelectItem value="estudante">Estudante</SelectItem>
                            </SelectContent>
                        </Select>
                        {isEditing && (
                            <p className="text-xs text-muted-foreground">
                                O tipo de usuário não pode ser alterado.
                            </p>
                        )}
                    </div>

                    {/* School - for professor/estudante */}
                    {(role === 'professor' || role === 'estudante') && (
                        <div className="space-y-2">
                            <Label>Escola *</Label>
                            <Select value={schoolId} onValueChange={setSchoolId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a escola" />
                                </SelectTrigger>
                                <SelectContent>
                                    {schools.map(school => (
                                        <SelectItem key={school.id} value={school.id}>
                                            {school.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Grade Level - for estudante */}
                    {role === 'estudante' && (
                        <div className="space-y-2">
                            <Label>Série *</Label>
                            <Select value={gradeLevel} onValueChange={setGradeLevel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a série" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gradeOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Superadmin toggle - for gestor */}
                    {role === 'gestor' && (
                        <div className="flex items-center justify-between rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20">
                            <div className="space-y-0.5">
                                <Label className="text-base">Superadministrador</Label>
                                <p className="text-sm text-muted-foreground">
                                    Acesso completo ao sistema, incluindo gestão de usuários.
                                </p>
                            </div>
                            <Switch
                                checked={isSuperadmin}
                                onCheckedChange={setIsSuperadmin}
                            />
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="brand" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {isEditing ? 'Salvar' : 'Criar Usuário'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
