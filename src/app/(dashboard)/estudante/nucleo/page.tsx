import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { Separator } from '@/components/ui/separator'

export default async function MyNucleusPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch Student & Nucleus Info
    const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single() as any

    if (!student) return <div>Estudante não encontrado</div>

    const { data: myMemberData } = await supabase
        .from('nucleus_members')
        .select('*, nucleus:nuclei(*)')
        .eq('student_id', student.id)
        .single() as any

    const nucleus = myMemberData?.nucleus

    if (!nucleus) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Icons.users className="h-8 w-8 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Você ainda não tem um núcleo</h2>
                <p className="text-slate-500 max-w-md">
                    Aguarde seu professor realizar a alocação dos grupos. Em breve você fará parte de uma equipe!
                </p>
            </div>
        )
    }

    // Fetch all members of this nucleus
    const { data: members } = await supabase
        .from('nucleus_members')
        .select('role, student:students(name, email)')
        .eq('nucleus_id', nucleus.id)

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">{nucleus.name}</h2>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                        {myMemberData.role === 'coordenador' ? 'Você é Coordenador' : 'Membro'}
                    </Badge>
                </div>
                <p className="text-slate-500">{nucleus.description || `Responsáveis pela área de ${nucleus.name} da cooperativa.`}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Members List */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Equipe</CardTitle>
                        <CardDescription>{members?.length} participantes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {members?.map((member: any) => (
                            <div key={member.student.email} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-slate-100 text-xs">
                                            {member.student.name.substring(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium leading-none">{member.student.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{member.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Nucleus Activities/Missions */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icons.check className="h-5 w-5 text-blue-600" />
                            Missões do Núcleo
                        </CardTitle>
                        <CardDescription>Atividades fundamentais para o sucesso da cooperativa.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for dynamic tasks */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="mt-1 bg-white p-2 rounded shadow-sm">
                                    <Icons.fileText className="h-4 w-4 text-slate-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">Definir papéis e responsabilidades</h4>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Discutam em grupo e registrem quem ficará responsável pelo que dentro do núcleo.
                                    </p>
                                    <Badge variant="outline" className="mt-2 text-yellow-600 bg-yellow-50 border-yellow-200">
                                        Em andamento
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 opacity-60">
                                <div className="mt-1 bg-white p-2 rounded shadow-sm">
                                    <Icons.calendar className="h-4 w-4 text-slate-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">Cronograma Inicial</h4>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Planejamento das 3 primeiras semanas de atuação.
                                    </p>
                                    <Badge variant="secondary" className="mt-2">
                                        Pendente
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-3">Precisa de ideias para começar?</p>
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-50">
                                Pergunte ao DOT Assistente
                            </Badge>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
