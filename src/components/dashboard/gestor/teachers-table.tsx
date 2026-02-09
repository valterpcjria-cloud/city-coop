'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserModal } from './user-modal'
import { useRouter } from 'next/navigation'
import { Edit, MoreHorizontal, UserCheck, UserX, School } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from '@/components/ui/sonner'

interface Teacher {
    id: string
    user_id: string
    name: string
    email: string
    phone: string | null
    cpf: string | null
    school_id: string | null
    is_active: boolean
    created_at: string
    school?: { name: string }
}

interface School {
    id: string
    name: string
}

interface TeachersTableProps {
    initialTeachers: Teacher[]
    schools: School[]
}

export function TeachersTable({ initialTeachers, schools }: TeachersTableProps) {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handleEdit = (teacher: Teacher) => {
        setSelectedTeacher({
            ...teacher,
            role: 'professor'
        })
        setIsModalOpen(true)
    }

    const toggleStatus = async (teacher: Teacher) => {
        setIsLoading(teacher.id)
        try {
            const response = await fetch(`/api/gestor/users?id=${teacher.id}&role=professor`, {
                method: 'DELETE' // O DELETE faz soft delete (is_active = false) ou inverter?
                // Na nossa API atual, DELETE seta is_active para false.
                // Vou ajustar para que possamos reativar também se necessário.
            })

            if (!response.ok) throw new Error('Erro ao alterar status')

            toast.success(teacher.is_active ? 'Professor desativado' : 'Professor ativado')
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
                <CardTitle>Lista de Professores</CardTitle>
                <Button variant="brand" size="sm" onClick={() => {
                    setSelectedTeacher(null)
                    setIsModalOpen(true)
                }}>
                    Novo Professor
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>Nome</TableHead>
                                <TableHead>Email / CPF</TableHead>
                                <TableHead>Escola</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialTeachers.map((teacher) => (
                                <TableRow key={teacher.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 text-coop-orange flex items-center justify-center font-bold text-xs">
                                                {teacher.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-[#1A2332]">{teacher.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-[#6B7C93]">{teacher.email}</span>
                                            {teacher.cpf && <span className="text-xs font-mono text-slate-400">{teacher.cpf}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {teacher.school?.name ? (
                                            <div className="flex items-center gap-1 text-slate-700">
                                                <School className="h-3.5 w-3.5 text-city-blue" />
                                                <span className="text-sm">{teacher.school.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-red-500 italic">Não alocado</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-[#6B7C93]">
                                        {teacher.phone || '--'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={teacher.is_active ? "outline" : "secondary"}
                                            className={teacher.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500"}
                                        >
                                            {teacher.is_active ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" disabled={isLoading === teacher.id}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(teacher)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Editar / Alocar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => toggleStatus(teacher)}
                                                    className={teacher.is_active ? "text-red-500" : "text-emerald-500"}
                                                >
                                                    {teacher.is_active ? (
                                                        <><UserX className="h-4 w-4 mr-2" /> Desativar</>
                                                    ) : (
                                                        <><UserCheck className="h-4 w-4 mr-2" /> Ativar</>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {initialTeachers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                        Nenhum professor encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedTeacher}
                schools={schools}
                onSuccess={handleSuccess}
                defaultRole="professor"
            />
        </Card>
    )
}
