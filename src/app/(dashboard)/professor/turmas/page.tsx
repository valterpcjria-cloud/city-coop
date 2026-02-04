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

    // Use Admin Client to ensure we find the teacher profile even if RLS is tricky
    const { data: teacher, error: teacherError } = await adminAuth
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (teacherError) console.error('Error fetching teacher:', teacherError)

    // Also use Admin Client for classes if the teacher profile was found
    const { data: classes, error: classesError } = teacher ? await adminAuth
        .from('classes')
        .select('*, class_students(count)')
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false }) : { data: [], error: null }

    if (classesError) console.error('Error fetching classes:', classesError)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Minhas Turmas</h2>
                    <p className="text-slate-500">Gerencie suas turmas e cooperativas.</p>
                </div>
                <Button asChild>
                    <Link href="/professor/turmas/nova">
                        <Icons.add className="mr-2 h-4 w-4" />
                        Nova Turma
                    </Link>
                </Button>
            </div>

            {!classes || classes.length === 0 ? (
                <Card className="shadow-sm border-dashed">
                    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="bg-slate-100 p-4 rounded-full mb-4">
                            <Icons.calendar className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="font-medium text-lg text-slate-900 mb-1">Nenhuma turma encontrada</h3>
                        <p className="text-slate-500 mb-6 max-w-sm">
                            Crie sua primeira turma para começar a organizar as cooperativas escolares.
                        </p>
                        <Button asChild>
                            <Link href="/professor/turmas/nova">
                                Criar Turma
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((turma: any) => (
                        <Card key={turma.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-bold">{turma.name}</CardTitle>
                                        <CardDescription>{turma.code}</CardDescription>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${turma.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                        {turma.status === 'active' ? 'Ativa' : 'Encerrada'}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Icons.user className="mr-2 h-4 w-4 text-slate-400" />
                                        {turma.class_students?.[0]?.count || 0} estudantes
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Icons.calendar className="mr-2 h-4 w-4 text-slate-400" />
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
