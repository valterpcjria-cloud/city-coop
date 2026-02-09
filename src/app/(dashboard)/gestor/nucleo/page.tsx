import { Suspense } from 'react'
import { Icons } from '@/components/ui/icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CycleList } from './components/cycle-list'
import { CandidatesRanking } from './components/candidates-ranking'
import { CoopEventosList } from './components/coop-eventos-list'

export default function NucleoGestaoPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-city-blue">Núcleo de Gestão de Cooperativas</h2>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="candidates">Candidatos ao Núcleo</TabsTrigger>
                    <TabsTrigger value="cycles">Ciclos de Formação</TabsTrigger>
                    <TabsTrigger value="events">Coop-Eventos</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Estudantes Aptos</CardTitle>
                                <Icons.graduationCap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">128</div>
                                <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Núcleos Escolares Ativos</CardTitle>
                                <Icons.users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">15</div>
                                <p className="text-xs text-muted-foreground">Em 12 cidades diferentes</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Eventos Realizados</CardTitle>
                                <Icons.calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">42</div>
                                <p className="text-xs text-muted-foreground">Impacto em ~2.500 pessoas</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Médias de Conhecimento</CardTitle>
                                <Icons.chart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">78%</div>
                                <p className="text-xs text-muted-foreground">Evolução de 5% no último ciclo</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Candidatos em Destaque</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CandidatesRanking />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Ciclo Atual</CardTitle>
                                <CardDescription>Governança e Liderança</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="text-sm">Participação: 85%</p>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-coop-orange" style={{ width: '85%' }}></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Finaliza em 12 dias</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="candidates">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestão de Candidatos</CardTitle>
                            <CardDescription>Aprovação de estudantes para os Núcleos Gestores baseado nos scores.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CandidatesRanking />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cycles">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ciclos de Formação</CardTitle>
                            <CardDescription>Gerencie os ciclos de aprendizagem cooperativista.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CycleList />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="events">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestão de Coop-Eventos</CardTitle>
                            <CardDescription>Acompanhe e gerencie os eventos organizados pelos núcleos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CoopEventosList />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
