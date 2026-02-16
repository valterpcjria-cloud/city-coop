'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '@/hooks/use-debounce'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserModal } from './user-modal'
import { PasswordResetDialog } from './password-reset-dialog'
import { ConfirmModal } from '@/components/shared/confirm-modal'
import { useActionToast } from '@/hooks/use-action-toast'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
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
    Crown,
    Trash2
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
    school: { name: string } | null
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
    isSuperadmin?: boolean
    currentUserId?: string
}

const roleConfig = {
    gestor: { label: 'Gestor', icon: Shield, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
    professor: { label: 'Professor', icon: GraduationCap, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    estudante: { label: 'Estudante', icon: School, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }
}

export function UsersTable({ initialUsers, schools, isSuperadmin = false, currentUserId }: UsersTableProps) {
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
    const [confirmAction, setConfirmAction] = useState<{ type: 'deactivate' | 'activate' | 'delete', user: User } | null>(null)
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
    const [userToReset, setUserToReset] = useState<User | null>(null)
    const { executeAction } = useActionToast()

    // Debounced search for performance
    const debouncedSearch = useDebounce(search, 300)

    // Filter users with useMemo for performance
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                (user as any).cpf?.includes(debouncedSearch)
            const matchesRole = roleFilter === 'all' || user.role === roleFilter
            const matchesSchool = schoolFilter === 'all' || user.school_id === schoolFilter
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' ? user.is_active : !user.is_active)
            return matchesSearch && matchesRole && matchesSchool && matchesStatus
        })
    }, [users, debouncedSearch, roleFilter, schoolFilter, statusFilter])

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

    const handleDelete = (user: User) => {
        setConfirmAction({
            type: 'delete',
            user
        })
        setConfirmOpen(true)
    }

    const handleConfirmAction = async () => {
        if (!confirmAction) return

        const isDeleteAction = confirmAction.type === 'delete'
        const isDeactivate = confirmAction.type === 'deactivate'

        await executeAction(
            async () => {
                const response = await fetch(
                    `/api/gestor/users?id=${confirmAction.user.id}&role=${confirmAction.user.role}${isDeleteAction ? '&action=delete' : ''}`,
                    { method: 'DELETE' }
                )

                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error)
                }

                router.refresh()
            },
            {
                loadingMessage: isDeleteAction ? 'Excluindo usuário...' : isDeactivate ? 'Desativando...' : 'Ativando...',
                successMessage: isDeleteAction
                    ? 'Usuário excluído com sucesso'
                    : isDeactivate ? 'Usuário desativado' : 'Usuário ativado',
                errorMessage: 'Erro ao processar ação no usuário'
            }
        )

        setConfirmOpen(false)
        setConfirmAction(null)
    }

    const handleResetPassword = (user: User) => {
        setUserToReset(user)
        setIsResetDialogOpen(true)
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
            <Card glass className="border-none shadow-lg">
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
            <Card glass className="border-none shadow-lg overflow-hidden">
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
                            <AnimatePresence mode="popLayout">
                                {filteredUsers.map((user, index) => {
                                    const config = roleConfig[user.role]
                                    const Icon = config.icon
                                    return (
                                        <motion.tr
                                            key={`${user.role}-${user.id}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                                            className={cn(
                                                "group transition-colors border-b",
                                                !user.is_active ? 'opacity-50 bg-slate-50/50' : 'hover:bg-slate-50/50'
                                            )}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {user.name}
                                                    {user.is_superadmin && (
                                                        <Crown className="h-4 w-4 text-amber-500" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-700">{user.email}</span>
                                                    {(user as any).cpf && (
                                                        <span className="text-xs font-mono text-slate-400">
                                                            {(user as any).cpf}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={config.color}>
                                                    <Icon className="h-3 w-3 mr-1" />
                                                    {config.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.school?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.is_active ? 'default' : 'secondary'} className={user.is_active ? "bg-green-500 hover:bg-green-600" : ""}>
                                                    {user.is_active ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="hover:bg-city-blue/10">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-52">
                                                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        {(!user.is_superadmin || (user.is_superadmin && user.user_id === currentUserId)) && (
                                                            <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                                                <Key className="h-4 w-4 mr-2" />
                                                                Resetar Senha
                                                            </DropdownMenuItem>
                                                        )}

                                                        {isSuperadmin && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleToggleStatus(user)}
                                                                    className={user.is_active ? 'text-amber-600' : 'text-green-600'}
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
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(user)}
                                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 font-medium"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Excluir Permanentemente
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>
                                    )
                                })}
                            </AnimatePresence>
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
                isSuperadmin={isSuperadmin}
            />

            {/* Confirm Dialog */}
            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title={
                    confirmAction?.type === 'delete'
                        ? 'Excluir Usuário?'
                        : confirmAction?.type === 'deactivate'
                            ? 'Desativar Usuário?'
                            : 'Ativar Usuário?'
                }
                description={
                    confirmAction?.type === 'delete'
                        ? `ATENÇÃO: Deseja realmente excluir PERMANENTEMENTE ${confirmAction?.user.name}? Esta ação não pode ser desfeita.`
                        : confirmAction?.type === 'deactivate'
                            ? `Deseja desativar ${confirmAction?.user.name}? Ele não conseguirá mais acessar o sistema.`
                            : `Deseja reativar ${confirmAction?.user.name}? O acesso será restabelecido.`
                }
                confirmText={
                    confirmAction?.type === 'delete'
                        ? 'Sim, Excluir'
                        : confirmAction?.type === 'deactivate'
                            ? 'Sim, Desativar'
                            : 'Sim, Ativar'
                }
                variant={confirmAction?.type === 'delete' ? 'destructive' : 'default'}
                onConfirm={handleConfirmAction}
            />

            <PasswordResetDialog
                isOpen={isResetDialogOpen}
                onClose={() => {
                    setIsResetDialogOpen(false)
                    setUserToReset(null)
                }}
                user={userToReset}
            />
        </div>
    )
}
