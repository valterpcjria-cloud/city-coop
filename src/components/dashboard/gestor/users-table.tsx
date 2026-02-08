'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserModal } from './user-modal'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/sonner'
import { useRouter } from 'next/navigation'
import {
    Users,
    Search,
    UserPlus,
    Shield,
    GraduationCap,
    School,
    MoreHorizontal,
    Edit,
    Key,
    UserX,
    UserCheck,
    Crown
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
    id: string
    user_id: string
    name: string
    email: string
    phone: string | null
    role: 'gestor' | 'professor' | 'estudante'
    school_id: string | null
    school_name: string | null
    is_superadmin: boolean
    is_active: boolean
    grade_level?: string
    created_at: string
}

interface School {
    id: string
    name: string
}

interface UsersTableProps {
    initialUsers: User[]
    schools: School[]
}

const roleConfig = {
    gestor: { label: 'Gestor', icon: Shield, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
    professor: { label: 'Professor', icon: GraduationCap, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    estudante: { label: 'Estudante', icon: School, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }
}

export function UsersTable({ initialUsers, schools }: UsersTableProps) {
    const router = useRouter()
    const [users, setUsers] = useState(initialUsers)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [schoolFilter, setSchoolFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    // Confirm dialog states
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState<{ type: 'deactivate' | 'activate', user: User } | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        const matchesSchool = schoolFilter === 'all' || user.school_id === schoolFilter
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' ? user.is_active : !user.is_active)
        return matchesSearch && matchesRole && matchesSchool && matchesStatus
    })

    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setIsModalOpen(true)
    }

    const handleAdd = () => {
        setSelectedUser(null)
        setIsModalOpen(true)
    }

    const handleToggleStatus = (user: User) => {
        setConfirmAction({
            type: user.is_active ? 'deactivate' : 'activate',
            user
        })
        setConfirmOpen(true)
    }

    const handleConfirmAction = async () => {
        if (!confirmAction) return

        setIsProcessing(true)
        try {
            const response = await fetch(
                `/api/gestor/users?id=${confirmAction.user.id}&role=${confirmAction.user.role}`,
                { method: 'DELETE' }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error)
            }

            toast.success(
                confirmAction.type === 'deactivate'
                    ? 'Usuário desativado'
                    : 'Usuário ativado',
                { description: `${confirmAction.user.name} foi ${confirmAction.type === 'deactivate' ? 'desativado' : 'ativado'} com sucesso.` }
            )
            router.refresh()
        } catch (error: any) {
            toast.error('Erro', { description: error.message })
        } finally {
            setIsProcessing(false)
            setConfirmAction(null)
        }
    }

    const handleResetPassword = async (user: User) => {
        try {
            const response = await fetch('/api/gestor/users/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.user_id, email: user.email })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error)
            }

            toast.success('Email enviado!', {
                description: `Um link para redefinir a senha foi enviado para ${user.email}`
            })
        } catch (error: any) {
            toast.error('Erro', { description: error.message })
        }
    }

    const handleSuccess = () => {
        router.refresh()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-city-blue flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        Gestão de Usuários
                    </h2>
                    <p className="text-tech-gray">Gerencie todos os usuários do sistema.</p>
                </div>
                <Button onClick={handleAdd} variant="brand">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Novo Usuário
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por nome ou email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os tipos</SelectItem>
                                <SelectItem value="gestor">Gestores</SelectItem>
                                <SelectItem value="professor">Professores</SelectItem>
                                <SelectItem value="estudante">Estudantes</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Escola" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as escolas</SelectItem>
                                {schools.map(school => (
                                    <SelectItem key={school.id} value={school.id}>
                                        {school.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Ativos</SelectItem>
                                <SelectItem value="inactive">Inativos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
                    <CardDescription>
                        Lista de todos os usuários cadastrados no sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Escola</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => {
                                const config = roleConfig[user.role]
                                const Icon = config.icon
                                return (
                                    <TableRow key={`${user.role}-${user.id}`} className={!user.is_active ? 'opacity-50' : ''}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {user.name}
                                                {user.is_superadmin && (
                                                    <Crown className="h-4 w-4 text-amber-500" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {user.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={config.color}>
                                                <Icon className="h-3 w-3 mr-1" />
                                                {config.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.school_name || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                                {user.is_active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                                        <Key className="h-4 w-4 mr-2" />
                                                        Resetar Senha
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={user.is_active ? 'text-red-600' : 'text-green-600'}
                                                    >
                                                        {user.is_active ? (
                                                            <>
                                                                <UserX className="h-4 w-4 mr-2" />
                                                                Desativar
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck className="h-4 w-4 mr-2" />
                                                                Ativar
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-tech-gray">
                                        Nenhum usuário encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* User Modal */}
            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                schools={schools}
                onSuccess={handleSuccess}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                variant={confirmAction?.type === 'deactivate' ? 'danger' : 'success'}
                title={confirmAction?.type === 'deactivate' ? 'Desativar Usuário' : 'Ativar Usuário'}
                description={
                    confirmAction?.type === 'deactivate'
                        ? `Tem certeza que deseja desativar ${confirmAction?.user.name}? O usuário não conseguirá mais acessar o sistema.`
                        : `Deseja reativar ${confirmAction?.user.name}? O usuário poderá acessar o sistema novamente.`
                }
                confirmText={confirmAction?.type === 'deactivate' ? 'Desativar' : 'Ativar'}
                cancelText="Cancelar"
                onConfirm={handleConfirmAction}
                loading={isProcessing}
            />
        </div>
    )
}
