'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { CreateEventForm } from '@/components/events/create-event-form'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { Separator } from '@/components/ui/separator'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function EventPage() {
    const [eventPlan, setEventPlan] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [studentClassId, setStudentClassId] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get Class
            const { data: student } = await supabase
                .from('students')
                .select('id, classes:class_students(class_id)')
                .eq('user_id', user.id)
                .single() as any

            const classId = student?.classes?.[0]?.class_id
            setStudentClassId(classId)

            if (classId) {
                // Get Event Plan
                const { data: plan } = await supabase
                    .from('event_plans')
                    .select('*')
                    .eq('class_id', classId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single() as any

                if (plan) setEventPlan(plan)
            }
            setLoading(false)
        }
        fetchData()
    }, [supabase.auth])

    if (loading) return <div>Carregando...</div>

    if (!studentClassId) return <div className="p-8 text-center text-muted-foreground">Você não está vinculado a nenhuma turma.</div>

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Planejamento do Evento</h2>
                <p className="text-slate-500">O projeto final da sua cooperativa.</p>
            </div>

            {eventPlan ? (
                <Card className="border-l-4 border-l-blue-500 shadow-md">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl">{eventPlan.title}</CardTitle>
                                <CardDescription>
                                    Data prevista: {format(new Date(eventPlan.event_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </CardDescription>
                            </div>
                            <Badge className={
                                eventPlan.status === 'approved' ? 'bg-green-500' :
                                    eventPlan.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                            }>
                                {eventPlan.status === 'submitted' ? 'Em Análise' :
                                    eventPlan.status === 'approved' ? 'Aprovado' :
                                        eventPlan.status === 'rejected' ? 'Revisão Necessária' : 'Rascunho'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg text-slate-700">
                            {eventPlan.description}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Icons.billing className="h-4 w-4" /> Orçamento
                                </h4>
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                    {(eventPlan.budget?.items || []).map((item: any, i: number) => (
                                        <li key={i}>{item.item}: R$ {item.value}</li>
                                    ))}
                                    <li className="font-bold pt-1 list-none">Total: R$ {eventPlan.budget?.total}</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Icons.calendar className="h-4 w-4" /> Cronograma
                                </h4>
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                    {(eventPlan.timeline?.steps || []).map((step: any, i: number) => (
                                        <li key={i}>{step.task} (Até {step.deadline})</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {eventPlan.ai_evaluation && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-600">
                                        <Icons.ai className="h-4 w-4" /> Análise da IA
                                    </h4>
                                    <p className="text-sm text-slate-600 italic">
                                        {eventPlan.ai_evaluation.feedback || "Análise pendente..."}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>

                    {/* Allow editing if rejected? For now just view. */}
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Criar Novo Plano</CardTitle>
                        <CardDescription>Preencha os detalhes do evento que sua cooperativa irá realizar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CreateEventForm classId={studentClassId} />
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
