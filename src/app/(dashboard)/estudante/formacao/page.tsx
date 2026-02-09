// This will be refactored to use a client-side list component for the interactive parts
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScoreSummary } from '@/components/coop/score-summary'
import { Icons } from '@/components/ui/icons'
import { CycleListStudent } from './components/cycle-list-student'

export default async function StudentFormacaoPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single() as any

    if (!student) return <div>Estudante não encontrado</div>

    const { data: score } = await supabase
        .from('student_scores')
        .select('*')
        .eq('student_id', student.id)
        .single() as any

    const { data: cycles } = await supabase
        .from('test_cycles')
        .select('*, cycle_tests(*)')
        .eq('ativo', true)
        .order('numero_ciclo', { ascending: true })

    // Also fetch existing results to show "Concluído" status
    const { data: results } = await supabase
        .from('student_test_results')
        .select('*')
        .eq('student_id', student.id)

    // Fetch nominations for this student
    const { data: nominations } = await supabase
        .from('test_nominations')
        .select('*')
        .eq('student_id', student.id)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-city-blue">Formação Cooperativista</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-3">
                    {score ? (
                        <ScoreSummary scores={score} />
                    ) : (
                        <Card className="h-full flex items-center justify-center">
                            <p className="text-muted-foreground italic">Score em processamento...</p>
                        </Card>
                    )}
                </div>

                <div className="col-span-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Meus Ciclos de Conhecimento</CardTitle>
                            <CardDescription>Complete os testes mensais para aumentar seu score de conhecimento.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <CycleListStudent
                                cycles={cycles || []}
                                studentId={student.id}
                                results={results || []}
                                currentScore={score?.score_total || 0}
                                nominations={nominations || []}
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-city-blue/5 to-coop-orange/5 border-city-blue/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Icons.trophy className="h-4 w-4 text-coop-orange" />
                                Como melhorar seu score?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-2 text-slate-600">
                            <p>• <strong>Conhecimento:</strong> Realize os testes mensais com boas notas.</p>
                            <p>• <strong>Engajamento:</strong> Participe das aulas e entregue as atividades no prazo.</p>
                            <p>• <strong>Colaboração:</strong> Ajude seus colegas e participe dos fóruns.</p>
                            <p>• <strong>Perfil:</strong> Demonstre atitudes cooperativas em seus projetos.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
