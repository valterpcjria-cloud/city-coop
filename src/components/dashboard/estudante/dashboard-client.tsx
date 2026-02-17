'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DashboardClientProps {
    student: any
    nucleusMember: any
    currentClass: any
    currentNucleus: any
    pendingAssessmentsCount: number
    nextEvent: any
}

export function DashboardClient({ student, nucleusMember, currentClass, currentNucleus, pendingAssessmentsCount, nextEvent }: DashboardClientProps) {
    return (
        <div className="space-y-6">
            {/* ... middle part unchanged ... */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* ... skip status card ... */}
                <Card className="bg-gradient-to-br from-city-blue to-city-blue-dark text-white border-none shadow-lg hover:scale-[1.02] transition-transform">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium opacity-90">Meu Núcleo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            {currentNucleus ? (
                                <motion.div
                                    key="nucleus"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-2"
                                >
                                    <div className="text-2xl font-bold">{currentNucleus.name}</div>
                                    <Badge variant="secondary" className="bg-coop-orange hover:bg-coop-orange-light text-white border-0">
                                        {nucleusMember?.role === 'coordenador' ? 'Coordenador' : 'Membro'}
                                    </Badge>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="no-nucleus"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-2"
                                >
                                    <div className="text-xl font-bold opacity-80">Não alocado</div>
                                    <p className="text-xs opacity-70">Aguarde seu professor definir os grupos.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* Activities Card */}
                <Card glass className="border-l-4 border-l-coop-orange hover:-translate-y-1 transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-tech-gray">Avaliações Ativas</CardTitle>
                        <div className="p-2 rounded-full bg-coop-orange/10 group-hover:bg-coop-orange/20 transition-colors">
                            <Icons.check className="h-4 w-4 text-coop-orange" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-coop-orange">{pendingAssessmentsCount}</div>
                        <p className="text-xs text-tech-gray">
                            {pendingAssessmentsCount > 0 ? 'Existem avaliações para você!' : 'Tudo em dia!'}
                        </p>
                    </CardContent>
                </Card>

                {/* Events Card */}
                <Card glass className="border-l-4 border-l-city-blue hover:-translate-y-1 transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-tech-gray">Próximo Evento</CardTitle>
                        <div className="p-2 rounded-full bg-city-blue/10 group-hover:bg-city-blue/20 transition-colors">
                            <Icons.calendar className="h-4 w-4 text-city-blue" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-city-blue truncate" title={nextEvent?.titulo}>
                            {nextEvent?.titulo || '--'}
                        </div>
                        <p className="text-xs text-tech-gray">
                            {nextEvent ? formatDistanceToNow(new Date(nextEvent.data_planejada), { addSuffix: true, locale: ptBR }) : 'Nenhum evento agendado'}
                        </p>
                    </CardContent>
                </Card>

                {/* AI Assistant Card */}
                <Card glass className="col-span-1 border-coop-orange/30 bg-gradient-to-br from-coop-orange/5 to-city-blue/5 hover:shadow-xl transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-coop-orange flex items-center gap-2">
                            <div className="p-1 rounded-full bg-white/50 backdrop-blur-sm shadow-sm ring-1 ring-coop-orange/20">
                                <img src="/dot-bot.png" alt="DOT" className="w-8 h-8 object-contain" />
                            </div>
                            DOT Assistente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-tech-gray mb-3">
                            Tem dúvidas sobre sua função no núcleo ou sobre cooperativismo?
                        </p>
                        <Button size="sm" className="w-full bg-gradient-to-r from-city-blue to-coop-orange hover:shadow-lg transition-all text-white font-semibold" asChild>
                            <Link href="/estudante/chat">
                                Perguntar Agora
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Main Content Area - e.g., Nucleus Updates or Feed */}
                <Card glass className="col-span-1 md:col-span-2 hover:shadow-lg transition-all">
                    <CardHeader className="border-b border-tech-gray/10 bg-gradient-to-r from-city-blue/5 via-transparent to-coop-orange/5">
                        <CardTitle className="text-city-blue font-bold">Mural da Cooperativa</CardTitle>
                        <CardDescription className="text-tech-gray">Acompanhe as atualizações da sua turma.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="w-16 h-16 bg-gradient-to-br from-city-blue/10 to-coop-orange/10 rounded-full flex items-center justify-center"
                            >
                                <Icons.ai className="h-8 w-8 text-city-blue" />
                            </motion.div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-city-blue">Nenhuma atualização recente</p>
                                <p className="text-sm text-tech-gray">Quando houver novidades, elas aparecerão aqui.</p>
                            </div>
                            <Button
                                variant="outline"
                                className="border-coop-orange text-coop-orange hover:bg-coop-orange hover:text-white transition-all hover:scale-105"
                                asChild
                            >
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
