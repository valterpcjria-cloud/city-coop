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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Meu Painel</h2>
                    <p className="text-slate-500">Bem-vindo ao City Coop, {student?.name.split(' ')[0]}!</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900">{currentClass?.name || 'Sem turma'}</p>
                    <p className="text-xs text-slate-500">{currentClass?.code}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Status Card */}
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium opacity-90">Meu Núcleo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {currentNucleus ? (
                            <div className="space-y-1">
                                <div className="text-2xl font-bold">{currentNucleus.name}</div>
                                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atividades Pendentes</CardTitle>
                        <Icons.check className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Tudo em dia!
                        </p>
                    </CardContent>
                </Card>

                {/* Events Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Próximo Evento</CardTitle>
                        <Icons.calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">
                            Nenhum evento agendado
                        </p>
                    </CardContent>
                </Card>

                {/* AI Assistant Card */}
                <Card className="col-span-1 border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">Coop Buddy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-600 mb-3">
                            Tem dúvidas sobre sua função no núcleo ou sobre cooperativismo?
                        </p>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                            <Link href="/estudante/chat">
                                Perguntar Agora
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Main Content Area - e.g., Nucleus Updates or Feed */}
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Mural da Cooperativa</CardTitle>
                        <CardDescription>Acompanhe as atualizações da sua turma.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                <Icons.messageSquare className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">Nenhuma atualização recente</p>
                                <p className="text-sm text-slate-500">Quando houver novidades, elas aparecerão aqui.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
