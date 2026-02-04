import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function TeacherEventsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id: classId } = await params

    const { data: plans } = await supabase
        .from('event_plans')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Planos de Evento</h2>
                    <p className="text-slate-500">Analise e aprove as propostas dos alunos.</p>
                </div>
            </div>

            {plans?.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Nenhum plano submetido ainda.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {plans?.map((plan: any) => (
                        <Card key={plan.id} className={plan.status === 'submitted' ? 'border-orange-200 bg-orange-50/30' : ''}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">{plan.title}</CardTitle>
                                        <CardDescription>
                                            Para: {format(new Date(plan.event_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                        </CardDescription>
                                    </div>
                                    <Badge className={
                                        plan.status === 'approved' ? 'bg-green-500' :
                                            plan.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                    }>
                                        {plan.status === 'submitted' ? 'Aguardando Aprovação' :
                                            plan.status === 'approved' ? 'Aprovado' :
                                                plan.status === 'rejected' ? 'Rejeitado' : 'Rascunho'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="line-clamp-2 text-slate-600 mb-4">{plan.description}</p>
                                <div className="flex gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Icons.billing className="h-4 w-4" />
                                        R$ {plan.budget?.total}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Icons.calendar className="h-4 w-4" />
                                        {(plan.timeline?.steps?.length || 0)} etapas
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-slate-50/50 flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={`/professor/turmas/${classId}/eventos/${plan.id}`}>
                                        Ver Detalhes
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
