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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface AddStudentDialogProps {
    classId: string
    trigger?: React.ReactNode
}

export function AddStudentDialog({ classId, trigger }: AddStudentDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [student, setStudent] = useState({
        name: '',
        email: '',
        grade_level: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch(`/api/classes/${classId}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    students: [student]
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao adicionar estudante')
            }

            if (data.results[0].status === 'error') {
                throw new Error(data.results[0].error || 'Erro ao processar estudante')
            }

            toast.success('Estudante adicionado com sucesso!')
            setOpen(false)
            setStudent({ name: '', email: '', grade_level: '' })
            router.refresh()
        } catch (error: any) {
            console.error('Error adding student:', error)
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Icons.add className="mr-2 h-4 w-4" />
                        Adicionar Aluno
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Estudante</DialogTitle>
                    <DialogDescription>
                        Insira os dados do estudante para adicioná-lo à turma. Se o email já estiver cadastrado, ele será vinculado automaticamente.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="name"
                                value={student.name}
                                onChange={(e) => setStudent({ ...student, name: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={student.email}
                                onChange={(e) => setStudent({ ...student, email: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="grade" className="text-right">
                                Série
                            </Label>
                            <Select
                                value={student.grade_level}
                                onValueChange={(val) => setStudent({ ...student, grade_level: val })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="9EF">9º Ano EF</SelectItem>
                                    <SelectItem value="1EM">1º Ano EM</SelectItem>
                                    <SelectItem value="2EM">2º Ano EM</SelectItem>
                                    <SelectItem value="3EM">3º Ano EM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Adicionar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
