import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { NucleusDialog } from '@/components/nuclei/nucleus-dialog'

export default async function NucleiPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = params // Next 15 might require await params

    const { data: turma } = await supabase
        .from('classes')
        .select('name, code')
        .eq('id', id)
        .single() as any

    if (!turma) notFound()

    // Fetch all students in the class
    const { data: students } = await supabase
        .from('class_students')
        .select('student:students(id, name, email)')
        .eq('class_id', id)

    // Fetch current nuclei configuration
    const { data: nuclei } = await supabase
        .from('nuclei')
        .select(`
      id,
      name, 
      description,
      members:nucleus_members(
        id,
        role,
        student_id,
        student:students(name)
      )
    `)
        .eq('class_id', id)

    // Map students to see who is assigned
    const assignedStudentIds = new Set<string>()
    nuclei?.forEach((n: any) => {
        n.members.forEach((m: any) => assignedStudentIds.add(m.student_id))
    })

    const availableStudents = students?.filter((s: any) => !assignedStudentIds.has(s.student.id)) || []

    // List of all 6 required nuclei
    const requiredNuclei = [
        'Entretenimento',
        'Logística',
        'Operacional',
        'Financeiro',
        'Comunicação',
        'Parcerias'
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/professor/turmas/${id}`}>
                        <Icons.arrowRight className="h-4 w-4 rotate-180" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestão de Núcleos</h2>
                    <p className="text-muted-foreground">{turma.name} - Organização da Cooperativa</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Unassigned Students Column */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="h-full border-slate-200 bg-slate-50/50">
                        <CardHeader>
                            <CardTitle className="text-base">Estudantes Não Alocados</CardTitle>
                            <CardDescription>
                                Estes alunos ainda não pertencem a nenhum núcleo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {availableStudents.map((s: any) => (
                                <div key={s.student.id} className="p-3 bg-white border rounded-md shadow-sm flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs bg-slate-100">{s.student.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate w-32">{s.student.name}</p>
                                        </div>
                                    </div>
                                    <Icons.user className="h-4 w-4 text-slate-300" />
                                </div>
                            ))}
                            {availableStudents.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Todos os alunos foram alocados!
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Nuclei Grid */}
                <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
                    {requiredNuclei.map((nucleusName) => {
                        const existingNucleus = nuclei?.find((n: any) => n.name === nucleusName)
                        const members = (existingNucleus as any)?.members || []
                        const formattedMembers = members.map((m: any) => ({
                            ...m,
                            studentName: m.student?.name || 'Aluno'
                        }))

                        return (
                            <Card key={nucleusName} className={`relative overflow-hidden ${existingNucleus ? 'border-primary/20' : 'border-dashed'}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base">{nucleusName}</CardTitle>
                                        <Badge variant={members.length > 0 ? "default" : "secondary"} className="text-xs">
                                            {members.length} membros
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {members.length > 0 ? (
                                        <div className="space-y-2 mt-2">
                                            {formattedMembers.map((member: any) => (
                                                <div key={member.id} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                                                    <span className="truncate max-w-[120px]">{member.studentName}</span>
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1">
                                                        {member.role === 'coordenador' ? 'Coord' : 'Membro'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-20 flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed rounded-md bg-slate-50/50">
                                            Vazio
                                        </div>
                                    )}

                                    <div className="mt-4 flex justify-end">
                                        <NucleusDialog
                                            classId={id}
                                            nucleusName={nucleusName}
                                            currentMembers={formattedMembers}
                                            availableStudents={availableStudents}
                                            trigger={
                                                <Button variant="outline" size="sm" className="w-full text-xs hover:bg-city-blue hover:text-white transition-colors">
                                                    Gerenciar
                                                </Button>
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
