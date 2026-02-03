import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'

export default function ProfessorDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral</h2>
                    <p className="text-slate-500">Bem-vindo ao City Coop. Acompanhe suas turmas e atividades.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/professor/turmas/nova">
                            <Icons.add className="mr-2 h-4 w-4" />
                            Nova Turma
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
                        <Icons.menu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            +0 desde o mês passado
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
                        <Icons.user className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Total de alunos ativos
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avaliações Pendentes</CardTitle>
                        <Icons.check className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Aguardando correção
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Eventos Aprovados</CardTitle>
                        <Icons.calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Prontos para execução
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Turmas Recentes</CardTitle>
                        <CardDescription>
                            Você não tem turmas ativas no momento.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                <Icons.menu className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="font-medium text-lg text-slate-900 mb-1">Nenhuma turma encontrada</h3>
                            <p className="text-slate-500 mb-6 max-w-sm">
                                Comece criando sua primeira turma para gerenciar os estudantes e suas cooperativas.
                            </p>
                            <Button asChild variant="outline">
                                <Link href="/professor/turmas/nova">
                                    Criar minha primeira turma
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Atividades Recentes</CardTitle>
                        <CardDescription>
                            Últimas ações realizadas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Timeline skeleton */}
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mr-4">
                                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none text-slate-300">Carregando atividade...</p>
                                        <p className="text-xs text-muted-foreground text-slate-200">...</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
