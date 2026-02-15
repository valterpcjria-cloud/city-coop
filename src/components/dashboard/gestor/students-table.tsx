'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserModal } from './user-modal'
import { PasswordResetDialog } from './password-reset-dialog'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Edit, MoreHorizontal, UserCheck, UserX, School, Loader2, Key } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

interface Student {
    id: string
    user_id: string
    name: string
    email: string
    cpf: string | null
    school_id: string | null
    grade_level: string
    is_active: boolean
    created_at: string
    school?: { name: string }
}

interface School {
    id: string
    name: string
}

interface StudentsTableProps {
    initialStudents: Student[]
    schools: School[]
}

export function StudentsTable({ initialStudents, schools }: StudentsTableProps) {
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(1)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
    const [userToReset, setUserToReset] = useState<any>(null)
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const limit = 25
    const totalItems = initialStudents.length
    const totalPages = Math.ceil(totalItems / limit)

    // Calculate paginated students
    const paginatedStudents = initialStudents.slice(
        (currentPage - 1) * limit,
        currentPage * limit
    )

    const handleEdit = (student: Student) => {
        setSelectedStudent({
            ...student,
            role: 'estudante'
        })
        setIsModalOpen(true)
    }

    const handleResetPassword = (student: Student) => {
        setUserToReset({
            ...student,
            role: 'estudante'
        })
        setIsResetDialogOpen(true)
    }

    const toggleStatus = async (student: Student) => {
        setIsLoading(student.id)
        try {
            const response = await fetch(`/api/gestor/users?id=${student.id}&role=estudante`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Erro ao alterar status')

            toast.success(student.is_active ? 'Aluno desativado' : 'Aluno ativado')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(null)
        }
    }

    const handleSuccess = () => {
        router.refresh()
    }

    return (
        <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lista de Alunos</CardTitle>
                <Button variant="brand" size="sm" onClick={() => {
                    setSelectedStudent(null)
                    setIsModalOpen(true)
                }}>
                    Novo Aluno
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>Nome</TableHead>
                                <TableHead>Email / CPF</TableHead>
                                <TableHead>Escola</TableHead>
                                <TableHead>Ano/Série</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="wait">
                                {paginatedStudents.map((student, idx) => (
                                    <motion.tr
                                        key={`${currentPage}-${student.id}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: idx * 0.01, duration: 0.2 }}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-city-blue flex items-center justify-center font-bold text-xs">
                                                    {student.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-[#1A2332]">{student.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-[#6B7C93]">{student.email || '--'}</span>
                                                {student.cpf && <span className="text-xs font-mono text-slate-400">{student.cpf}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {student.school?.name ? (
                                                <div className="flex items-center gap-1 text-slate-700">
                                                    <School className="h-3.5 w-3.5 text-city-blue" />
                                                    <span className="text-sm">{student.school.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-red-500 italic">Não alocado</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-semibold">{student.grade_level}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={student.is_active ? "outline" : "secondary"}
                                                className={student.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500"}
                                            >
                                                {student.is_active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" disabled={isLoading === student.id}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(student)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Alocar / Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleResetPassword(student)}>
                                                        <Key className="h-4 w-4 mr-2" />
                                                        Resetar Senha
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => toggleStatus(student)}
                                                        className={student.is_active ? "text-red-500" : "text-emerald-500"}
                                                    >
                                                        {student.is_active ? (
                                                            <><UserX className="h-4 w-4 mr-2" /> Desativar</>
                                                        ) : (
                                                            <><UserCheck className="h-4 w-4 mr-2" /> Ativar</>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {initialStudents.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                        Nenhum estudante encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t bg-slate-50/20">
                        <p className="text-sm text-slate-500">
                            Mostrando <b>{((currentPage - 1) * limit) + 1}</b> a <b>{Math.min(currentPage * limit, totalItems)}</b> de <b>{totalItems}</b>
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
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
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedStudent}
                schools={schools}
                onSuccess={handleSuccess}
                defaultRole="estudante"
            />

            <PasswordResetDialog
                isOpen={isResetDialogOpen}
                onClose={() => {
                    setIsResetDialogOpen(false)
                    setUserToReset(null)
                }}
                user={userToReset}
            />
        </Card>
    )
}
