'use client'

import { useState, useEffect } from 'react'
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
import { Separator } from '@/components/ui/separator'

interface AddStudentDialogProps {
    classId: string
    trigger?: React.ReactNode
}

interface SchoolStudent {
    id: string
    name: string
    email: string
    grade_level: string
}

export function AddStudentDialog({ classId, trigger }: AddStudentDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [schoolStudents, setSchoolStudents] = useState<SchoolStudent[]>([])
    const [filteredStudents, setFilteredStudents] = useState<SchoolStudent[]>([])

    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
    const [student, setStudent] = useState({
        name: '',
        email: '',
        grade_level: ''
    })

    // Carregar alunos da escola ao abrir o modal
    useEffect(() => {
        if (open) {
            fetchSchoolStudents()
        } else {
            setSearchQuery('')
            setFilteredStudents([])
        }
    }, [open])

    // Filtrar alunos conforme o usuário digita
    useEffect(() => {
        const query = searchQuery.trim().toLowerCase()
        if (query.length >= 2) {
            const results = schoolStudents.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.email?.toLowerCase().includes(query)
            )
            setFilteredStudents(results)
        } else {
            setFilteredStudents([])
        }
    }, [searchQuery, schoolStudents])

    const fetchSchoolStudents = async () => {
        setIsSearching(true)
        try {
            const response = await fetch(`/api/school/students?excludeClassId=${classId}`)
            const data = await response.json()
            if (data.success) {
                setSchoolStudents(data.students)
            } else {
                toast.error('Erro ao carregar lista de alunos.')
            }
        } catch (error) {
            console.error('Error fetching school students:', error)
            toast.error('Falha na conexão com o servidor.')
        } finally {
            setIsSearching(false)
        }
    }

    const handleSelectStudent = (s: SchoolStudent) => {
        setStudent({
            name: s.name,
            email: s.email || '',
            grade_level: s.grade_level || ''
        })
        setSelectedStudentId(s.id)
        setSearchQuery('')
        setFilteredStudents([])
    }

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
                    students: [{ ...student, id: selectedStudentId }]
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
            setSelectedStudentId(null)
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
                        Busque um aluno já cadastrado ou insira os dados manualmente.
                        {schoolStudents.length > 0 && (
                            <span className="block text-xs font-semibold text-city-blue mt-1">
                                {schoolStudents.length} alunos disponíveis no sistema
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="relative">
                        <Icons.search className="absolute left-3 top-3 h-4 w-4 text-[#6B7C93]" />
                        <Input
                            placeholder="Pesquisar por nome ou email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-3">
                                <Icons.spinner className="h-4 w-4 animate-spin text-city-blue" />
                            </div>
                        )}
                        {filteredStudents.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-[#6B7C93]/20 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {filteredStudents.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => handleSelectStudent(s)}
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex flex-col border-b last:border-0 border-[#6B7C93]/10"
                                    >
                                        <span className="font-medium text-sm text-[#1A2332]">{s.name}</span>
                                        <span className="text-xs text-[#6B7C93]">{s.email || 'Sem email'} • {s.grade_level}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {searchQuery.trim().length >= 2 && filteredStudents.length === 0 && !isSearching && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-[#6B7C93]/20 rounded-md shadow-lg p-4 text-center text-sm text-[#6B7C93]">
                                {schoolStudents.length === 0
                                    ? "Nenhum aluno cadastrado no sistema."
                                    : "Nenhum aluno encontrado com este nome."}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Separator className="flex-1" />
                        <span className="text-[10px] uppercase font-bold text-[#6B7C93] tracking-wider">ou preencha manualmente</span>
                        <Separator className="flex-1" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="grid gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right text-xs">
                                    Nome
                                </Label>
                                <Input
                                    id="name"
                                    value={student.name}
                                    onChange={(e) => setStudent({ ...student, name: e.target.value })}
                                    className="col-span-3 h-9"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right text-xs">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={student.email}
                                    onChange={(e) => {
                                        setStudent({ ...student, email: e.target.value })
                                        setSelectedStudentId(null) // Limpa o ID se editar manualmente
                                    }}
                                    className="col-span-3 h-9"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="grade" className="text-right text-xs">
                                    Série
                                </Label>
                                <Select
                                    value={student.grade_level}
                                    onValueChange={(val) => setStudent({ ...student, grade_level: val })}
                                >
                                    <SelectTrigger className="col-span-3 h-9">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="9EF">9º Ano EF</SelectItem>
                                        <SelectItem value="1EM">1º Ano EM</SelectItem>
                                        <SelectItem value="2EM">2º Ano EM</SelectItem>
                                        <SelectItem value="3EM">3º Ano EM</SelectItem>
                                        <SelectItem value="EJA">EJA</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto px-8">
                                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                Adicionar à Turma
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
