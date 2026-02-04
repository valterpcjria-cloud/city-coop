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
        .single()

    if (teacherError || !teacher) {
        return null
    }

    // Get all events for classes belonging to this teacher
    // We use adminClient because RLS policies for event_plans/teachers might be missing or restrictive
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Eventos</h2>
                    <p className="text-slate-500">Gerencie e aprove os planos de eventos de todas as suas turmas.</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white/50 backdrop-blur-sm border-slate-200/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total de Eventos</CardTitle>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Icons.calendar className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{totalEvents}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 backdrop-blur-sm border-orange-200/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-700">Aguardando Aprovação</CardTitle>
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Icons.spinner className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-700">{pendingApproval}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 backdrop-blur-sm border-green-200/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Eventos Executados</CardTitle>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Icons.check className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700">{executedEvents}</div>
                    </CardContent>
                </Card>
            </div>

            {!events || eventsList.length === 0 ? (
                <Card className="shadow-sm border-dashed bg-slate-50/50">
                    <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                            <Icons.calendar className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 mb-2">Sem eventos no momento</h3>
                        <p className="text-slate-500 max-w-sm mb-0">
                            Os planos de evento das suas turmas aparecerão aqui centralizados assim que forem submetidos pelos alunos.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {eventsList.map((event: any) => (
                        <Card key={event.id} className={cn(
                            "group overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200/80",
                            event.status === 'submitted' ? 'border-orange-200 ring-1 ring-orange-100/50 shadow-orange-100/20' : ''
                        )}>
                            <div className={cn(
                                "h-1.5 w-full",
                                event.status === 'approved' ? 'bg-green-500' :
                                    event.status === 'rejected' ? 'bg-red-500' :
                                        event.status === 'executed' ? 'bg-blue-600' :
                                            event.status === 'submitted' ? 'bg-orange-400 animate-pulse' : 'bg-slate-300'
                            )} />
                            <CardHeader className="pb-3 pt-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                {event.classes.name}
                                            </span>
                                            <Badge variant="outline" className={cn(
                                                "font-bold uppercase tracking-wider text-[10px]",
                                                event.status === 'approved' ? 'border-green-200 text-green-700 bg-green-50' :
                                                    event.status === 'rejected' ? 'border-red-200 text-red-700 bg-red-50' :
                                                        event.status === 'executed' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                                            'border-orange-200 text-orange-700 bg-orange-50'
                                            )}>
                                                {event.status === 'submitted' ? 'Aguardando Aprovação' :
                                                    event.status === 'approved' ? 'Aprovado' :
                                                        event.status === 'rejected' ? 'Rejeitado' :
                                                            event.status === 'executed' ? 'Executado' : 'Rascunho'}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {event.title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 font-medium text-slate-500">
                                            <Icons.calendar className="h-4 w-4" />
                                            {event.event_date ? format(new Date(event.event_date), "dd 'de' MMMM, yyyy", { locale: ptBR }) : 'Data a definir'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600 line-clamp-2 mb-8 leading-relaxed">
                                    {event.description || "Nenhuma descrição fornecida pelos proponentes."}
                                </p>
                                <div className="grid grid-cols-2 md:flex md:gap-12 gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-colors">
                                            <Icons.billing className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-0.5">Orçamento</p>
                                            <p className="font-bold text-slate-900">R$ {event.budget?.total?.toLocaleString('pt-BR') || '0,00'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-colors">
                                            <Icons.menu className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-0.5">Planejamento</p>
                                            <p className="font-bold text-slate-900">{event.timeline?.steps?.length || 0} Atividades</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-slate-50/80 backdrop-blur-sm flex justify-end gap-3 py-5 border-t border-slate-100">
                                <Button variant="ghost" className="font-bold text-slate-600 hover:text-blue-600" asChild>
                                    <Link href={`/professor/turmas/${event.class_id}/eventos/${event.id}`}>
                                        Visualizar
                                    </Link>
                                </Button>
                                <Button className="bg-slate-900 hover:bg-blue-600 text-white font-bold shadow-lg shadow-slate-200" asChild>
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
