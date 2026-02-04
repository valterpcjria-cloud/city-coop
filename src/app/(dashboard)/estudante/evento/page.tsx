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

            const { data: student } = await supabase
                .from('students')
                .select('id, classes:class_students(class_id)')
                .eq('user_id', user.id)
                .single() as any

            const classId = student?.classes?.[0]?.class_id
            setStudentClassId(classId)

            if (classId) {
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

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Icons.spinner className="h-8 w-8 animate-spin text-[#4A90D9]" />
        </div>
    )

    if (!studentClassId) return (
        <div className="p-8 text-center text-[#6B7C93]">Você não está vinculado a nenhuma turma.</div>
    )

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-8">
            {/* Header with Brand Gradient */}
            <div className="flex flex-col gap-2 p-6 -m-6 mb-0 bg-gradient-to-r from-[#4A90D9]/10 via-white to-[#F5A623]/10 border-b border-[#6B7C93]/10 rounded-t-xl">
                <h2 className="text-3xl font-bold tracking-tight text-[#4A90D9]">Planejamento do Evento</h2>
                <p className="text-[#6B7C93]">O projeto final da sua cooperativa.</p>
            </div>

            {eventPlan ? (
                <Card className="border-l-4 border-l-[#F5A623] shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl text-[#1a2332]">{eventPlan.title}</CardTitle>
                                <CardDescription className="text-[#6B7C93] flex items-center gap-2 mt-1">
                                    <Icons.calendar className="h-4 w-4 text-[#4A90D9]" />
                                    Data prevista: {format(new Date(eventPlan.event_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </CardDescription>
                            </div>
                            <Badge className={
                                eventPlan.status === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                                    eventPlan.status === 'rejected' ? 'bg-red-500 hover:bg-red-600' :
                                        eventPlan.status === 'submitted' ? 'bg-[#F5A623] hover:bg-[#E09000]' : 'bg-[#6B7C93]'
                            }>
                                {eventPlan.status === 'submitted' ? 'Em Análise' :
                                    eventPlan.status === 'approved' ? 'Aprovado' :
                                        eventPlan.status === 'rejected' ? 'Revisão Necessária' : 'Rascunho'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-gradient-to-r from-[#4A90D9]/5 to-[#F5A623]/5 p-4 rounded-xl text-[#1a2332] border border-[#6B7C93]/10">
                            {eventPlan.description}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-xl border border-[#6B7C93]/10">
                                <h4 className="font-bold mb-3 flex items-center gap-2 text-[#F5A623]">
                                    <div className="p-1.5 rounded-full bg-[#F5A623]/10">
                                        <Icons.billing className="h-4 w-4" />
                                    </div>
                                    Orçamento
                                </h4>
                                <ul className="text-sm text-[#6B7C93] space-y-1.5">
                                    {(eventPlan.budget?.items || []).map((item: any, i: number) => (
                                        <li key={i} className="flex justify-between">
                                            <span>{item.item}</span>
                                            <span className="font-medium text-[#1a2332]">R$ {item.value}</span>
                                        </li>
                                    ))}
                                    <li className="font-bold pt-2 border-t border-[#6B7C93]/10 flex justify-between text-[#F5A623]">
                                        <span>Total</span>
                                        <span>R$ {eventPlan.budget?.total}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-[#6B7C93]/10">
                                <h4 className="font-bold mb-3 flex items-center gap-2 text-[#4A90D9]">
                                    <div className="p-1.5 rounded-full bg-[#4A90D9]/10">
                                        <Icons.calendar className="h-4 w-4" />
                                    </div>
                                    Cronograma
                                </h4>
                                <ul className="text-sm text-[#6B7C93] space-y-1.5">
                                    {(eventPlan.timeline?.steps || []).map((step: any, i: number) => (
                                        <li key={i} className="flex justify-between">
                                            <span>{step.task}</span>
                                            <span className="text-xs text-[#4A90D9] font-medium">Até {step.deadline}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {eventPlan.ai_evaluation && (
                            <>
                                <Separator className="bg-[#6B7C93]/10" />
                                <div className="bg-gradient-to-r from-[#4A90D9]/5 to-[#F5A623]/5 p-4 rounded-xl border border-[#4A90D9]/20">
                                    <h4 className="font-bold mb-2 flex items-center gap-2 text-[#4A90D9]">
                                        <div className="p-1.5 rounded-full bg-gradient-to-br from-[#4A90D9] to-[#F5A623]">
                                            <Icons.ai className="h-4 w-4 text-white" />
                                        </div>
                                        Análise da IA
                                    </h4>
                                    <p className="text-sm text-[#6B7C93] italic">
                                        {eventPlan.ai_evaluation.feedback || "Análise pendente..."}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-[#4A90D9]/20 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-[#4A90D9]/5 to-transparent border-b border-[#6B7C93]/10">
                        <CardTitle className="text-[#4A90D9]">Criar Novo Plano</CardTitle>
                        <CardDescription className="text-[#6B7C93]">
                            Preencha os detalhes do evento que sua cooperativa irá realizar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <CreateEventForm classId={studentClassId} />
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
