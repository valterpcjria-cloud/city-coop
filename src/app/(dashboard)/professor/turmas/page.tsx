import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function ClassesPage() {
    const supabase = await createClient()
    const adminAuth = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: teacher, error: teacherError } = await adminAuth
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single() as any

    if (teacherError) console.error('Error fetching teacher:', teacherError)

    const { data: classes, error: classesError } = teacher ? await adminAuth
        .from('classes')
        .select('*, class_students(count)')
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false }) : { data: [], error: null }

    if (classesError) console.error('Error fetching classes:', classesError)

    return (
        <div className="space-y-6">
            {/* Header with Brand Gradient */}
            <div className="flex items-center justify-between p-6 -m-6 mb-0 bg-gradient-to-r from-[#4A90D9]/10 via-white to-[#F5A623]/10 border-b border-[#6B7C93]/10">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#4A90D9]">Minhas Turmas</h2>
                    <p className="text-[#6B7C93]">Gerencie suas turmas e cooperativas.</p>
                </div>
                <Button variant="brand" asChild>
                    <Link href="/professor/turmas/nova">
                        <Icons.add className="mr-2 h-4 w-4" />
                        Nova Turma
                    </Link>
                </Button>
            </div>

            {!classes || classes.length === 0 ? (
                <Card className="shadow-sm border-dashed border-[#6B7C93]/30">
                    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="bg-gradient-to-br from-[#4A90D9]/10 to-[#F5A623]/10 p-5 rounded-full mb-4">
                            <Icons.calendar className="h-10 w-10 text-[#4A90D9]" />
                        </div>
                        <h3 className="font-bold text-lg text-[#4A90D9] mb-1">Nenhuma turma encontrada</h3>
                        <p className="text-[#6B7C93] mb-6 max-w-sm">
                            Crie sua primeira turma para começar a organizar as cooperativas escolares.
                        </p>
                        <Button variant="orange" asChild>
                            <Link href="/professor/turmas/nova">
                                <Icons.add className="mr-2 h-4 w-4" />
                                Criar Turma
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((turma: any) => (
                        <Card key={turma.id} className="border-l-4 border-l-[#4A90D9] hover:shadow-lg transition-all duration-200">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-[#1a2332]">{turma.name}</CardTitle>
                                        <CardDescription className="text-[#6B7C93]">{turma.code}</CardDescription>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${turma.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-[#6B7C93]/10 text-[#6B7C93]'}`}>
                                        {turma.status === 'active' ? 'Ativa' : 'Encerrada'}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-[#6B7C93]">
                                        <div className="p-1.5 rounded-full bg-[#F5A623]/10 mr-2">
                                            <Icons.user className="h-3.5 w-3.5 text-[#F5A623]" />
                                        </div>
                                        {turma.class_students?.[0]?.count || 0} estudantes
                                    </div>
                                    <div className="flex items-center text-sm text-[#6B7C93]">
                                        <div className="p-1.5 rounded-full bg-[#4A90D9]/10 mr-2">
                                            <Icons.calendar className="h-3.5 w-3.5 text-[#4A90D9]" />
                                        </div>
                                        {format(new Date(turma.start_date), "d MMM yyyy", { locale: ptBR })} -{' '}
                                        {format(new Date(turma.end_date), "d MMM yyyy", { locale: ptBR })}
                                    </div>

                                    <div className="pt-3">
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/professor/turmas/${turma.id}`}>
                                                Ver Detalhes
                                                <Icons.arrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
