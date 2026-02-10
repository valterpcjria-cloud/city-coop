import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { AddStudentDialog } from '@/components/students/add-student-dialog'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function TurmaDetalhesPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Buscar turma
    const { data: turma, error: turmaError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single() as any

    if (turmaError) {
        console.error('Erro ao buscar turma:', turmaError)
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar turma</h1>
                <p className="text-gray-600 mb-2">ID: {id}</p>
                <p className="text-red-500">{turmaError.message}</p>
                <pre className="mt-4 p-4 bg-gray-100 rounded text-left text-sm overflow-auto">
                    {JSON.stringify(turmaError, null, 2)}
                </pre>
            </div>
        )
    }

    if (!turma) {
        notFound()
    }

    // Buscar estudantes
    const { data: estudantes, error: estudantesError } = await supabase
        .from('class_students')
        .select('*, student:students(id, name, email)')
        .eq('class_id', id)

    if (estudantesError) {
        console.error('Erro ao buscar estudantes:', estudantesError)
    }

    // Buscar núcleos com IDs dos estudantes para mapeamento
    const { data: nucleos } = await supabase
        .from('nuclei')
        .select('*, members:nucleus_members(role, student_id, student:students(name))')
        .eq('class_id', id)

    // Mapeamento de student_id -> nome do núcleo
    const alunoNucleoMap: { [key: string]: string } = {}
    nucleos?.forEach((n: any) => {
        n.members?.forEach((m: any) => {
            alunoNucleoMap[m.student_id] = n.name
        })
    })

    const totalEstudantes = estudantes?.length || 0
    const totalNucleos = nucleos?.length || 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 -m-6 mb-0 bg-gradient-to-r from-[#4A90D9]/10 via-white to-[#F5A623]/10 border-b">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link
                            href="/professor/turmas"
                            className="p-2 rounded-full hover:bg-white/50 transition-colors"
                        >
                            <Icons.chevronLeft className="h-5 w-5 text-[#4A90D9]" />
                        </Link>
                        <h1 className="text-3xl font-bold text-[#4A90D9]">{turma.name}</h1>
                        <Badge
                            className={turma.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }
                        >
                            {turma.status === 'active' ? 'Ativa' : 'Encerrada'}
                        </Badge>
                    </div>
                    <p className="text-[#6B7C93] ml-12">
                        {turma.code} • {turma.grade_level} • {turma.modality}
                    </p>
                </div>
                <div className="flex gap-2">
                    <AddStudentDialog
                        classId={id}
                        trigger={
                            <Button variant="outline">
                                <Icons.add className="mr-2 h-4 w-4" />
                                Adicionar Aluno
                            </Button>
                        }
                    />
                    <Button variant="outline" asChild>
                        <Link href={`/professor/turmas/${id}/nucleos`}>
                            <Icons.users className="mr-2 h-4 w-4" />
                            Gerenciar Núcleos
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="estudantes" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="estudantes">
                        Estudantes ({totalEstudantes})
                    </TabsTrigger>
                    <TabsTrigger value="nucleos">
                        Núcleos ({totalNucleos})
                    </TabsTrigger>
                </TabsList>

                {/* Tab Estudantes */}
                <TabsContent value="estudantes" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-[#4A90D9]">Estudantes Matriculados</CardTitle>
                            <CardDescription>
                                Lista de alunos vinculados a esta turma.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {totalEstudantes === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-[#4A90D9]/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <Icons.user className="h-8 w-8 text-[#4A90D9]" />
                                    </div>
                                    <p className="text-[#6B7C93] mb-4">Nenhum estudante matriculado ainda.</p>
                                    <AddStudentDialog classId={id} />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {estudantes?.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 bg-[#F5A623]/20">
                                                    <AvatarFallback className="text-[#F5A623] font-bold">
                                                        {item.student?.name?.substring(0, 2).toUpperCase() || '??'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {item.student?.name || 'Nome não disponível'}
                                                    </p>
                                                    <p className="text-sm text-[#6B7C93]">
                                                        {item.student?.email || 'Email não disponível'}
                                                    </p>
                                                </div>
                                            </div>
                                            {alunoNucleoMap[item.student_id] ? (
                                                <Badge
                                                    className={
                                                        alunoNucleoMap[item.student_id] === 'Financeiro' ? 'bg-red-100 text-red-700 border-red-200' :
                                                            alunoNucleoMap[item.student_id] === 'Logística' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                alunoNucleoMap[item.student_id] === 'Comunicação' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                                    alunoNucleoMap[item.student_id] === 'Parcerias' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                                        'bg-blue-100 text-blue-700 border-blue-200'
                                                    }
                                                >
                                                    {alunoNucleoMap[item.student_id]}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400 border-slate-200">
                                                    Sem Núcleo
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Núcleos */}
                <TabsContent value="nucleos" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-[#4A90D9]">Estrutura da Cooperativa</CardTitle>
                            <CardDescription>
                                Organização dos alunos nos núcleos operacionais.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {['Entretenimento', 'Logística', 'Operacional', 'Financeiro', 'Comunicação', 'Parcerias'].map((nome) => {
                                    const nucleo = nucleos?.find((n: any) => n.name === nome)
                                    const cor = nome === 'Financeiro' ? 'bg-red-500' :
                                        nome === 'Logística' ? 'bg-green-500' :
                                            nome === 'Comunicação' ? 'bg-purple-500' :
                                                nome === 'Parcerias' ? 'bg-orange-500' : 'bg-blue-500'

                                    return (
                                        <Card key={nome} className="relative overflow-hidden border-l-4" style={{ borderLeftColor: cor.replace('bg-', '') }}>
                                            <div className={`absolute top-0 left-0 w-1 h-full ${cor}`} />
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg">{nome}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {nucleo ? (
                                                    <p className="text-sm text-[#6B7C93]">
                                                        {(nucleo as any).members?.length || 0} membros
                                                    </p>
                                                ) : (
                                                    <div className="text-center py-2">
                                                        <p className="text-sm text-[#6B7C93] mb-2">Não formado</p>
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link href={`/professor/turmas/${id}/nucleos`}>
                                                                Formar
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
