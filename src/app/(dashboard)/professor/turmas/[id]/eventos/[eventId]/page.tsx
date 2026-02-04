import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { EventApprovalActions } from '@/components/events/event-approval-actions'

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string; eventId: string }> }) {
    const supabase = await createClient()
    const { id: classId, eventId } = await params

    const { data: plan } = await supabase
        .from('event_plans')
        .select('*')
        .eq('id', eventId)
        .single() as any

    if (!plan) notFound()

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/professor/turmas/${classId}/eventos`}>
                            <Icons.arrowRight className="h-4 w-4 rotate-180" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">{plan.title}</h2>
                        <p className="text-muted-foreground">Detalhes do planejamento.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Badge className={
                        plan.status === 'approved' ? 'bg-green-500' :
                            plan.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                    }>
                        {plan.status === 'submitted' ? 'Em Análise' :
                            plan.status === 'approved' ? 'Aprovado' :
                                plan.status === 'rejected' ? 'Rejeitado' : 'Rascunho'}
                    </Badge>

                    <EventApprovalActions planId={plan.id} currentStatus={plan.status} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Descrição</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-slate-700">{plan.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cronograma</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative border-l border-slate-200 ml-4 space-y-6">
                                {(plan.timeline?.steps || []).map((step: any, i: number) => (
                                    <div key={i} className="mb-6 ml-6">
                                        <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white">
                                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                                        </span>
                                        <h3 className="flex items-center mb-1 text-lg font-semibold text-slate-900">{step.task}</h3>
                                        <time className="block mb-2 text-sm font-normal leading-none text-slate-400">{step.deadline}</time>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Orçamento</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(plan.budget?.items || []).map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span>{item.item}</span>
                                        <span className="font-mono">R$ {item.value}</span>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>R$ {plan.budget?.total}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {plan.ai_evaluation && (
                        <Card className="bg-purple-50 border-purple-100">
                            <CardHeader>
                                <CardTitle className="text-purple-700 flex items-center gap-2">
                                    <Icons.ai className="h-5 w-5" /> Análise IA
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-purple-800">
                                {plan.ai_evaluation.feedback}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
