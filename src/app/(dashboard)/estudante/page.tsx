import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function StudentDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch Student Data including Class info
    const { data: student } = await supabase
        .from('students')
        .select('*, classes:class_students(class:classes(*))')
        .eq('user_id', user.id)
        .single() as any

    // Get Nucleus
    const { data: nucleusMember } = await supabase
        .from('nucleus_members')
        .select('role, nucleus:nuclei(*)')
        .eq('student_id', student?.id)
        .single() as any

    const currentClass = student?.classes?.[0]?.class
    const currentNucleus = nucleusMember?.nucleus

    return (
        <div className="space-y-6">
            {/* Header with Brand Gradient */}
            <div className="flex items-center justify-between p-6 -m-6 mb-0 bg-gradient-to-r from-[#4A90D9]/10 via-white to-[#F5A623]/10 border-b border-tech-gray/10">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-city-blue">Meu Painel</h2>
                    <p className="text-tech-gray">Bem-vindo ao City Coop, {student?.name?.split(' ')[0] || 'Estudante'}!</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-coop-orange">{currentClass?.name || 'Sem turma'}</p>
                    <p className="text-xs text-tech-gray">{currentClass?.code}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Status Card - Brand Gradient */}
                <Card className="bg-gradient-to-br from-[#4A90D9] to-[#3A7BC8] text-white border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium opacity-90">Meu Núcleo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {currentNucleus ? (
                            <div className="space-y-2">
                                <div className="text-2xl font-bold">{currentNucleus.name}</div>
                                <Badge variant="secondary" className="bg-coop-orange hover:bg-coop-orange-light text-white border-0">
                                    {nucleusMember.role === 'coordenador' ? 'Coordenador' : 'Membro'}
                                </Badge>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="text-xl font-bold opacity-80">Não alocado</div>
                                <p className="text-xs opacity-70">Aguarde seu professor definir os grupos.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Activities Card */}
                <Card className="shadow-sm border-l-4 border-l-coop-orange hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-tech-gray">Atividades Pendentes</CardTitle>
                        <div className="p-2 rounded-full bg-coop-orange/10">
                            <Icons.check className="h-4 w-4 text-coop-orange" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-coop-orange">0</div>
                        <p className="text-xs text-tech-gray">
                            Tudo em dia!
                        </p>
                    </CardContent>
                </Card>

                {/* Events Card */}
                <Card className="shadow-sm border-l-4 border-l-city-blue hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-tech-gray">Próximo Evento</CardTitle>
                        <div className="p-2 rounded-full bg-city-blue/10">
                            <Icons.calendar className="h-4 w-4 text-city-blue" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-city-blue">--</div>
                        <p className="text-xs text-tech-gray">
                            Nenhum evento agendado
                        </p>
                    </CardContent>
                </Card>

                {/* AI Assistant Card */}
                <Card className="col-span-1 border-coop-orange/30 bg-gradient-to-br from-[#F5A623]/5 to-[#4A90D9]/5 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-coop-orange flex items-center gap-2">
                            <img src="/dot-bot.png" alt="DOT" className="w-8 h-8 object-contain" />
                            DOT Assistente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-tech-gray mb-3">
                            Tem dúvidas sobre sua função no núcleo ou sobre cooperativismo?
                        </p>
                        <Button size="sm" className="w-full bg-gradient-to-r from-city-blue to-coop-orange hover:from-city-blue-dark hover:to-coop-orange-dark text-white shadow-md" asChild>
                            <Link href="/estudante/chat">
                                Perguntar Agora
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Main Content Area - e.g., Nucleus Updates or Feed */}
                <Card className="col-span-1 md:col-span-2 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="border-b border-tech-gray/10 bg-gradient-to-r from-city-blue/5 via-transparent to-coop-orange/5">
                        <CardTitle className="text-city-blue">Mural da Cooperativa</CardTitle>
                        <CardDescription className="text-tech-gray">Acompanhe as atualizações da sua turma.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-city-blue/10 to-coop-orange/10 rounded-full flex items-center justify-center">
                                <Icons.ai className="h-8 w-8 text-city-blue" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-city-blue">Nenhuma atualização recente</p>
                                <p className="text-sm text-tech-gray">Quando houver novidades, elas aparecerão aqui.</p>
                            </div>
                            <Button variant="outline" className="border-coop-orange text-coop-orange hover:bg-coop-orange hover:text-white" asChild>
                                <Link href="/estudante/evento">
                                    <Icons.calendar className="mr-2 h-4 w-4" />
                                    Ver Planejamento do Evento
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
