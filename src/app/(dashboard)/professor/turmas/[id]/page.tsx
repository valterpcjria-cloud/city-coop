import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { Separator } from '@/components/ui/separator'
import { AddStudentDialog } from '@/components/students/add-student-dialog'
import { AssessmentsList } from '@/components/assessments/assessments-list'
import { IndicatorsDashboard } from '@/components/indicators/indicators-dashboard'
import { getClassAverageIndicators } from '@/lib/indicators'

interface ClassDetailsPageProps {
    params: {
        id: string
    }
}

export default async function ClassDetailsPage({ params }: ClassDetailsPageProps) {
    const supabase = await createClient()

    const { id } = await (params as any)

    const { data: turma } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single() as { data: any, error: any }

    if (!turma) {
        notFound()
    }

    const { data: students } = await supabase
        .from('class_students')
        .select(`
      *,
      student:students(*)
    `)
        .eq('class_id', id)

    const { data: nuclei } = await supabase
        .from('nuclei')
        .select(`
      *,
      members:nucleus_members(
        role,
        student:students(name)
      )
    `)
        .eq('class_id', id)

    const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('class_id', id)
        .order('created_at', { ascending: false })

    const averageIndicators = await getClassAverageIndicators(id)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/professor/turmas" className="text-muted-foreground hover:text-primary transition-colors">
                            <Icons.arrowRight className="h-4 w-4 rotate-180" />
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{turma.name}</h2>
                        <Badge variant={turma.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                            {turma.status === 'active' ? 'Ativa' : 'Encerrada'}
                        </Badge>
                    </div>
                    <p className="text-slate-500 pl-6">{turma.code} • {turma.grade_level} • {turma.modality}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/professor/turmas/${id}/nucleos`}>
                            <Icons.menu className="mr-2 h-4 w-4" />
                            Gerenciar Núcleos
                        </Link>
                    </Button>
                    <Button>
                        <Icons.add className="mr-2 h-4 w-4" />
                        Adicionar Aluno
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="students" className="w-full">
                <TabsList>
                    <TabsTrigger value="students">Estudantes ({students?.length || 0})</TabsTrigger>
                    <TabsTrigger value="nuclei">Núcleos ({nuclei?.length || 0})</TabsTrigger>
                    <TabsTrigger value="assessments">Avaliações ({assessments?.length || 0})</TabsTrigger>
                    <TabsTrigger value="indicators">Indicadores</TabsTrigger>
                </TabsList>

                {/* Tab: Students */}
                <TabsContent value="students" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estudantes Matriculados</CardTitle>
                            <CardDescription>
                                Lista de alunos e seus respectivos núcleos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!students || students.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">Nenhum estudante matriculado ainda.</p>
                                    <Button variant="link" className="mt-2">Adicionar estudantes manualmente</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {students.map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarFallback>{item.student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-slate-900">{item.student.name}</p>
                                                    <p className="text-sm text-muted-foreground">{item.student.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline">
                                                    Sem Núcleo
                                                </Badge>
                                                <Button size="icon" variant="ghost">
                                                    <Icons.settings className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Nuclei */}
                <TabsContent value="nuclei" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estrutura da Cooperativa</CardTitle>
                            <CardDescription>Organização dos alunos nos 6 núcleos operacionais.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {['Entretenimento', 'Logística', 'Operacional', 'Financeiro', 'Comunicação', 'Parcerias'].map((nucleusName) => {
                                    const nucleus = nuclei?.find((n: any) => n.name === nucleusName)
                                    return (
                                        <Card key={nucleusName} className="relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 w-1 h-full 
                          ${nucleusName === 'Financeiro' ? 'bg-red-500' :
                                                    nucleusName === 'Logística' ? 'bg-green-500' :
                                                        'bg-blue-500'}`}
                                            />
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg">{nucleusName}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {nucleus ? (
                                                    <div className="space-y-2">
                                                        <p className="text-sm text-muted-foreground">{nucleus.members.length} membros</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-4 text-center">
                                                        <p className="text-sm text-muted-foreground mb-2">Não formado</p>
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link href={`/professor/turmas/${id}/nucleos`}>Formar</Link>
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

                {/* Tab: Assessments */}
                <TabsContent value="assessments" className="mt-6">
                    <AssessmentsList classId={id} assessments={assessments || []} />
                </TabsContent>

                {/* Tab: Indicators */}
                <TabsContent value="indicators" className="mt-6">
                    <IndicatorsDashboard
                        classId={id}
                        averageData={averageIndicators}
                        studentsData={[]}
                    />
                </TabsContent>

            </Tabs>
        </div>
    )
}
