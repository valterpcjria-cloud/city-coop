'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

interface NucleusDialogProps {
    classId: string
    nucleusName: string
    currentMembers: any[]
    availableStudents: any[]
    trigger?: React.ReactNode
}

export function NucleusDialog({
    classId,
    nucleusName,
    currentMembers,
    availableStudents,
    trigger
}: NucleusDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState('')
    const [role, setRole] = useState('membro')

    const handleAddMember = async () => {
        if (!selectedStudent) return
        setIsLoading(true)

        try {
            const response = await fetch(`/api/classes/${classId}/nuclei`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nucleusName,
                    action: 'add_member',
                    studentId: selectedStudent,
                    role
                }),
            })

            if (!response.ok) throw new Error('Falha ao adicionar membro')

            toast.success('Membro adicionado!')
            router.refresh()
            setSelectedStudent('')
        } catch (error) {
            toast.error('Erro ao adicionar membro')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveMember = async (studentId: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/classes/${classId}/nuclei`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nucleusName,
                    action: 'remove_member',
                    studentId
                }),
            })

            if (!response.ok) throw new Error('Falha ao remover membro')

            toast.success('Membro removido!')
            router.refresh()
        } catch (error) {
            toast.error('Erro ao remover membro')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline" size="sm">Gerenciar</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Gerenciar {nucleusName}</DialogTitle>
                    <DialogDescription>
                        Adicione ou remova alunos deste núcleo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Add New Member Section */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                        <h4 className="text-sm font-medium">Adicionar novo membro</h4>
                        <div className="flex gap-2">
                            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Selecione um aluno" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableStudents.map((s: any) => (
                                        <SelectItem key={s.student.id} value={s.student.id}>
                                            {s.student.name}
                                        </SelectItem>
                                    ))}
                                    {availableStudents.length === 0 && (
                                        <SelectItem value="none" disabled>Nenhum aluno disponível</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>

                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="membro">Membro</SelectItem>
                                    <SelectItem value="coordenador">Coordenador</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button onClick={handleAddMember} disabled={!selectedStudent || isLoading} size="icon">
                                <Icons.add className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Current Members List */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Membros Atuais ({currentMembers.length})</h4>
                        <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                            {currentMembers.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Nenhum membro neste núcleo.
                                </div>
                            ) : (
                                currentMembers.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-3 bg-white">
                                        <span className="text-sm">{member.studentName}</span>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {member.role === 'coordenador' ? 'Coord' : 'Membro'}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleRemoveMember(member.student_id)}
                                                disabled={isLoading}
                                            >
                                                <Icons.trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
