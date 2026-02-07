import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default async function ProfessorEventsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.log('DEBUG: No user found in /professor/eventos')
        return null
    }

    const adminClient = await createAdminClient()
    const { data: teacher, error: teacherError } = await adminClient
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single() as any

    if (teacherError || !teacher) {
        return null
    }

    const { data: events } = await adminClient
        .from('event_plans')
        .select(`
            *,
            classes!inner (
                id,
                name,
                teacher_id
            )
        `)
        .eq('classes.teacher_id', (teacher as any).id)
        .order('created_at', { ascending: false })

    const eventsList = (events || []) as any[]
    const totalEvents = eventsList.length
    const pendingApproval = eventsList.filter(e => e.status === 'submitted').length
    const executedEvents = eventsList.filter(e => e.status === 'executed').length

    return (
        <div className="space-y-8">
            {/* Header with Brand Gradient */}
            <div className="flex items-center justify-between p-6 -m-6 mb-0 bg-gradient-to-r from-[#4A90D9]/10 via-white to-[#F5A623]/10 border-b border-[#6B7C93]/10">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#4A90D9]">Eventos</h2>
                    <p className="text-[#6B7C93]">Gerencie e aprove os planos de eventos de todas as suas turmas.</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white border-[#4A90D9]/20 shadow-md overflow-hidden group hover:shadow-lg transition-all">
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8]" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-[#6B7C93]">Total de Eventos</CardTitle>
                        <div className="p-2.5 bg-[#4A90D9]/10 rounded-xl group-hover:bg-[#4A90D9]/20 transition-colors">
                            <Icons.calendar className="h-5 w-5 text-[#4A90D9]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-[#4A90D9]">{totalEvents}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-[#F5A623]/20 shadow-md overflow-hidden group hover:shadow-lg transition-all">
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#F5A623] to-[#E09000]" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-[#6B7C93]">Aguardando Aprovação</CardTitle>
                        <div className="p-2.5 bg-[#F5A623]/10 rounded-xl group-hover:bg-[#F5A623]/20 transition-colors">
                            <Icons.spinner className="h-5 w-5 text-[#F5A623]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-[#F5A623]">{pendingApproval}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-green-200 shadow-md overflow-hidden group hover:shadow-lg transition-all">
                    <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-green-400" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-[#6B7C93]">Eventos Executados</CardTitle>
                        <div className="p-2.5 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                            <Icons.check className="h-5 w-5 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-green-600">{executedEvents}</div>
                    </CardContent>
                </Card>
            </div>

            {!events || eventsList.length === 0 ? (
                <Card className="shadow-md border-dashed border-[#6B7C93]/30 bg-[#4A90D9]/5">
                    <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#6B7C93]/10 mb-6">
                            <Icons.calendar className="h-10 w-10 text-[#6B7C93]/30" />
                        </div>
                        <h3 className="font-bold text-xl text-[#4A90D9] mb-2">Sem eventos no momento</h3>
                        <p className="text-[#6B7C93] max-w-sm mb-0">
                            Os planos de evento das suas turmas aparecerão aqui centralizados assim que forem submetidos pelos alunos.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {eventsList.map((event: any) => (
                        <Card key={event.id} className={cn(
                            "group overflow-hidden hover:shadow-xl transition-all duration-300 border-[#6B7C93]/15",
                            event.status === 'submitted' ? 'border-[#F5A623]/50 ring-1 ring-[#F5A623]/20' : ''
                        )}>
                            <div className={cn(
                                "h-1.5 w-full",
                                event.status === 'approved' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                                    event.status === 'rejected' ? 'bg-gradient-to-r from-red-500 to-red-400' :
                                        event.status === 'executed' ? 'bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8]' :
                                            event.status === 'submitted' ? 'bg-gradient-to-r from-[#F5A623] to-[#E09000] animate-pulse' : 'bg-[#6B7C93]/30'
                            )} />
                            <CardHeader className="pb-3 pt-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#4A90D9]/10 text-[#4A90D9] border border-[#4A90D9]/20">
                                                {event.classes.name}
                                            </span>
                                            <Badge variant="outline" className={cn(
                                                "font-bold uppercase tracking-wider text-[10px]",
                                                event.status === 'approved' ? 'border-green-200 text-green-700 bg-green-50' :
                                                    event.status === 'rejected' ? 'border-red-200 text-red-700 bg-red-50' :
                                                        event.status === 'executed' ? 'border-[#4A90D9]/30 text-[#4A90D9] bg-[#4A90D9]/10' :
                                                            'border-[#F5A623]/30 text-[#F5A623] bg-[#F5A623]/10'
                                            )}>
                                                {event.status === 'submitted' ? 'Aguardando Aprovação' :
                                                    event.status === 'approved' ? 'Aprovado' :
                                                        event.status === 'rejected' ? 'Rejeitado' :
                                                            event.status === 'executed' ? 'Executado' : 'Rascunho'}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-2xl font-black text-[#1a2332] group-hover:text-[#4A90D9] transition-colors">
                                            {event.title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 font-medium text-[#6B7C93]">
                                            <Icons.calendar className="h-4 w-4 text-[#4A90D9]" />
                                            {event.event_date ? format(new Date(event.event_date), "dd 'de' MMMM, yyyy", { locale: ptBR }) : 'Data a definir'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-[#6B7C93] line-clamp-2 mb-8 leading-relaxed">
                                    {event.description || "Nenhuma descrição fornecida pelos proponentes."}
                                </p>
                                <div className="grid grid-cols-2 md:flex md:gap-12 gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-[#F5A623]/10 rounded-xl border border-[#F5A623]/20 group-hover:bg-[#F5A623]/15 transition-colors">
                                            <Icons.billing className="h-5 w-5 text-[#F5A623]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-[#6B7C93] tracking-widest mb-0.5">Orçamento</p>
                                            <p className="font-bold text-[#1a2332]">R$ {event.budget?.total?.toLocaleString('pt-BR') || '0,00'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-[#4A90D9]/10 rounded-xl border border-[#4A90D9]/20 group-hover:bg-[#4A90D9]/15 transition-colors">
                                            <Icons.menu className="h-5 w-5 text-[#4A90D9]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-[#6B7C93] tracking-widest mb-0.5">Planejamento</p>
                                            <p className="font-bold text-[#1a2332]">{event.timeline?.steps?.length || 0} Atividades</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-gradient-to-r from-[#4A90D9]/5 to-[#F5A623]/5 flex justify-end gap-3 py-5 border-t border-[#6B7C93]/10">
                                <Button variant="ghost" className="font-bold text-[#6B7C93] hover:text-[#4A90D9] hover:bg-[#4A90D9]/10" asChild>
                                    <Link href={`/professor/turmas/${event.class_id}/eventos/${event.id}`}>
                                        Visualizar
                                    </Link>
                                </Button>
                                <Button variant="brand" className="shadow-lg shadow-[#4A90D9]/20" asChild>
                                    <Link href={`/professor/turmas/${event.class_id}/eventos/${event.id}`}>
                                        Avaliar Plano
                                        <Icons.arrowRight className="ml-2 h-4 w-4" />
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
