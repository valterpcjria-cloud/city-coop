import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'

export default async function IAAssessmentsHubPage() {
    const supabase = await createClient()
    const adminAuth = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: teacher } = await adminAuth
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single() as any

    const { data: classes } = (teacher as any) ? await adminAuth
        .from('classes')
        .select('*, class_students(count)')
        .eq('teacher_id', (teacher as any).id)
        .order('created_at', { ascending: false }) : { data: [] }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-indigo-900 flex items-center gap-2">
                    <Icons.ai className="h-8 w-8 text-indigo-600" />
                    Criar Avaliação com IA
                </h2>
                <p className="text-slate-500">
                    Selecione uma turma para gerar uma avaliação personalizada usando inteligência artificial.
                </p>
            </div>

            {!classes || classes.length === 0 ? (
                <Card className="shadow-sm border-dashed">
                    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="bg-slate-100 p-4 rounded-full mb-4">
                            <Icons.calendar className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="font-medium text-lg text-slate-900 mb-1">Nenhuma turma encontrada</h3>
                        <p className="text-slate-500 mb-6 max-w-sm">
                            Você precisa criar uma turma antes de gerar avaliações com IA.
                        </p>
                        <Button asChild>
                            <Link href="/professor/turmas/nova">
                                Criar Minha Primeira Turma
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((turma: any) => (
                        <Card key={turma.id} className="hover:shadow-md transition-all border-indigo-100 bg-white">
                            <CardHeader className="pb-3">
                                <div>
                                    <CardTitle className="text-lg font-bold text-indigo-950">{turma.name}</CardTitle>
                                    <CardDescription>{turma.code}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Icons.user className="mr-2 h-4 w-4 text-slate-400" />
                                        {turma.class_students?.[0]?.count || 0} estudantes matriculados
                                    </div>
                                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" asChild>
                                        <Link href={`/professor/turmas/${turma.id}/avaliacoes/nova`}>
                                            <Icons.sparkles className="mr-2 h-4 w-4" />
                                            Gerar Avaliação IA
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
