'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserModal } from './user-modal'
import { useRouter } from 'next/navigation'
import { Edit, MoreHorizontal } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Student {
    id: string
    user_id: string
    name: string
    email: string
    school_id: string | null
    grade_level: string
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
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)

    const handleEdit = (student: Student) => {
        setSelectedStudent({
            ...student,
            role: 'estudante',
            is_active: true, // Padrao para estudantes na listagem
            is_superadmin: false
        })
        setIsModalOpen(true)
    }

    const handleSuccess = () => {
        router.refresh()
    }

    return (
        <Card className="shadow-lg border-0">
            <CardHeader>
                <CardTitle>Lista de Alunos</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Escola</TableHead>
                            <TableHead>Ano/Série</TableHead>
                            <TableHead>Data Cadastro</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialStudents.map((student) => (
                            <TableRow key={student.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="font-medium text-[#1A2332]">{student.name}</TableCell>
                                <TableCell className="text-[#6B7C93]">{student.email || '--'}</TableCell>
                                <TableCell>
                                    {student.school?.name ? (
                                        <Badge variant="outline" className="bg-blue-50 text-city-blue border-blue-100">
                                            {student.school.name}
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-100">
                                            Não alocado
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-semibold">{student.grade_level}</Badge>
                                </TableCell>
                                <TableCell className="text-[#6B7C93]">
                                    {new Date(student.created_at).toLocaleDateString('pt-BR')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(student)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Alocar / Editar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {initialStudents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-tech-gray">
                                    Nenhum estudante encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedStudent}
                schools={schools}
                onSuccess={handleSuccess}
            />
        </Card>
    )
}
