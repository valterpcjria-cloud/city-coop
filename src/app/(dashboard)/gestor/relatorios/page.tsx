'use client'

import { useChat } from '@ai-sdk/react'
import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { AnimatedContainer } from '@/components/dashboard/shared/animated-container'
import dynamic from 'next/dynamic'

// Dynamically import Recharts to avoid SSR/Hydration issues in Next.js
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false })
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false })

interface Metrics {
    totalSchools: number
    totalTeachers: number
    totalStudents: number
    totalClasses: number
    activeClasses: number
    completedClasses: number
    approvedEvents: number
    pendingEvents: number
    rejectedEvents: number
    studentsByGrade: { name: string; value: number }[]
    eventsByStatus: { name: string; value: number }[]
    classesByModality: { name: string; value: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

const MetricCard = ({
    title,
    value,
    icon: Icon,
    color,
    delay = 0,
}: {
    title: string
    value: number | string
    icon: any
    color: string
    delay?: number
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay }}
    >
        <Card className="relative overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300">
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
                }}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {title}
                </CardTitle>
                <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <Icon className="h-5 w-5" style={{ color }} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col">
                    <motion.div
                        className="text-2xl font-bold tracking-tight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: delay + 0.3 }}
                    >
                        {value}
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
)

const reportLinks = [
    { title: 'Escolas', href: '/gestor/relatorios/escolas', icon: Icons.school, color: '#0088FE' },
    { title: 'Turmas', href: '/gestor/relatorios/turmas', icon: Icons.users, color: '#00C49F' },
    { title: 'Alunos', href: '/gestor/relatorios/alunos', icon: Icons.graduationCap, color: '#FFBB28' },
    { title: 'Eventos', href: '/gestor/relatorios/eventos', icon: Icons.calendar, color: '#FF8042' },
    { title: 'Eleições', href: '/gestor/relatorios/eleicoes', icon: Icons.vote, color: '#8884d8' },
]

export default function ReportsPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null)
    const [loading, setLoading] = useState(true)
    const [isMounted, setIsMounted] = useState(false)
    const [selectedModel, setSelectedModel] = useState<'claude' | 'gpt'>('gpt')
    const [searchInternet, setSearchInternet] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const fetchMetrics = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/gestor/reports/metrics')
            const data = await res.json()
            if (data.success) {
                setMetrics(data.metrics)
            } else {
                toast.error(data.error || "Não foi possível carregar as métricas.")
            }
        } catch (error) {
            console.error('Error fetching metrics:', error)
            toast.error("Erro na conexão com o servidor.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isMounted) {
            fetchMetrics()
        }
    }, [isMounted])

    const [localInput, setLocalInput] = useState('')


    const chatState = useChat({
        api: '/api/chat',
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: 'Olá, Gestor. Sou o DOT Assistente. Estou aqui para ajudar você a analisar estes relatórios e extrair insights estratégicos para sua cooperativa. Alguma dúvida sobre os números de hoje?'
            } as any
        ],
        onError: (err: Error) => {
            console.error("Chat error:", err)
            toast.error(`Erro: ${err.message}`)
        }
    } as any)

    const messages = chatState.messages || []
    const isChatLoading = chatState.status === 'streaming'
    const sendMessage = (chatState as any).sendMessage

    const onSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!localInput.trim() || isChatLoading) return

        const message = localInput
        setLocalInput('')

        if (sendMessage) {
            await sendMessage({ text: message }, {
                body: {
                    model: selectedModel,
                    context: 'reports_dashboard'
                }
            })
        }
    }

    const handleNewChat = () => {
        chatState.setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                content: 'Olá, Gestor. Como posso ajudar com os relatórios agora?'
            } as any
        ])
        setLocalInput('')
    }

    if (!isMounted) return null

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-slate-50 dark:bg-slate-950 relative overflow-hidden -m-6">
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 relative z-10 overflow-y-auto">
                <AnimatedContainer className="p-6 md:p-8 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-city-blue/10 rounded-lg">
                                    <Icons.chart className="h-6 w-6 text-city-blue" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-city-blue to-indigo-600 bg-clip-text text-transparent">
                                    Central de Relatórios Intelligence
                                </h1>
                            </div>
                            <p className="text-muted-foreground">
                                Monitoramento estratégico da rede escolar e insights do DOT AI.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                <Button
                                    variant={selectedModel === 'gpt' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSelectedModel('gpt')}
                                    className={cn("px-4 rounded-lg", selectedModel === 'gpt' && "bg-white dark:bg-slate-700 shadow-sm")}
                                >
                                    GPT-4o
                                </Button>
                                <Button
                                    variant={selectedModel === 'claude' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSelectedModel('claude')}
                                    className={cn("px-4 rounded-lg", selectedModel === 'claude' && "bg-white dark:bg-slate-700 shadow-sm")}
                                >
                                    Claude 3.5
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                className="gap-2 rounded-xl h-10"
                                onClick={fetchMetrics}
                                disabled={loading}
                            >
                                <Icons.refresh className={cn("h-4 w-4", loading && "animate-spin")} />
                                <span>{loading ? 'Carregando...' : 'Atualizar'}</span>
                            </Button>
                        </div>
                    </div>

                    {loading && !metrics ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <Icons.spinner className="h-10 w-10 animate-spin text-city-blue" />
                            <p className="text-slate-500 animate-pulse">Puxando dados em tempo real...</p>
                        </div>
                    ) : (
                        <>
                            {/* KPI Cards */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <MetricCard
                                    title="Total de Escolas"
                                    value={metrics?.totalSchools || 0}
                                    icon={Icons.school}
                                    color="#0088FE"
                                    delay={0}
                                />
                                <MetricCard
                                    title="Total de Professores"
                                    value={metrics?.totalTeachers || 0}
                                    icon={Icons.user}
                                    color="#00C49F"
                                    delay={0.1}
                                />
                                <MetricCard
                                    title="Total de Alunos"
                                    value={metrics?.totalStudents || 0}
                                    icon={Icons.graduationCap}
                                    color="#FFBB28"
                                    delay={0.2}
                                />
                                <MetricCard
                                    title="Turmas Ativas"
                                    value={`${metrics?.activeClasses || 0}/${metrics?.totalClasses || 0}`}
                                    icon={Icons.users}
                                    color="#FF8042"
                                    delay={0.3}
                                />
                            </div>

                            {/* Status and Messages (if chat is active) */}
                            {messages.length > 1 && (
                                <Card className="border-city-blue/20 bg-city-blue/5 mb-8">
                                    <CardHeader className="py-3 items-center flex flex-row justify-between">
                                        <CardDescription className="flex items-center gap-2">
                                            <Icons.sparkles className="h-4 w-4 text-city-blue" />
                                            Análise do DOT AI
                                        </CardDescription>
                                        <Button variant="ghost" size="sm" onClick={handleNewChat}>
                                            Limpar Conversa
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="max-h-[400px] overflow-y-auto space-y-4 p-4 text-sm scrollbar-thin scrollbar-thumb-slate-200">
                                        {messages.slice(1).map((m: any) => (
                                            <div key={m.id} className={cn(
                                                "flex flex-col gap-1",
                                                m.role === 'user' ? "items-end" : "items-start"
                                            )}>
                                                <div className={cn(
                                                    "p-3 rounded-2xl max-w-[90%] shadow-sm",
                                                    m.role === 'user'
                                                        ? "bg-gradient-to-r from-city-blue to-indigo-600 text-white rounded-tr-none"
                                                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none"
                                                )}>
                                                    {m.parts && m.parts.length > 0 ? (
                                                        m.parts.map((part: any, partIdx: number) => (
                                                            part.type === 'text' && <span key={`part-${partIdx}`} className="whitespace-pre-wrap">{part.text}</span>
                                                        ))
                                                    ) : (
                                                        <span className="whitespace-pre-wrap">{m.content}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {isChatLoading && (
                                            <div className="flex items-center gap-2 text-muted-foreground italic">
                                                <Icons.spinner className="h-3 w-3 animate-spin" />
                                                DOT está analisando...
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Charts Row */}
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Students by Grade */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Icons.chart className="h-5 w-5 text-city-blue" />
                                                Alunos por Série
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-[300px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={metrics?.studentsByGrade || []}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'rgba(255,255,255,0.95)',
                                                                borderRadius: '12px',
                                                                border: 'none',
                                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                            }}
                                                        />
                                                        <Bar
                                                            dataKey="value"
                                                            fill="url(#colorGradient)"
                                                            radius={[6, 6, 0, 0]}
                                                            barSize={40}
                                                        />
                                                        <defs>
                                                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#0088FE" />
                                                                <stop offset="100%" stopColor="#00C49F" />
                                                            </linearGradient>
                                                        </defs>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Events by Status */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Icons.calendar className="h-5 w-5 text-coop-orange" />
                                                Planos de Evento
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-[300px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={metrics?.eventsByStatus || []}
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={80}
                                                            innerRadius={60}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            stroke="none"
                                                        >
                                                            {(metrics?.eventsByStatus || []).map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={COLORS[index % COLORS.length]}
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* Quick Access to Reports */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Card className="shadow-xl border-0 bg-gradient-to-br from-city-blue/5 to-indigo-500/5 backdrop-blur-md">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Icons.fileText className="h-5 w-5 text-city-blue" />
                                            Relatórios Detalhados
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                                            {reportLinks.map((link, index) => (
                                                <motion.div
                                                    key={link.href}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.7 + index * 0.1 }}
                                                >
                                                    <Link href={link.href}>
                                                        <Card className="group cursor-pointer bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 hover:border-city-blue/30 rounded-2xl overflow-hidden">
                                                            <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                                                                <div
                                                                    className="h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-sm"
                                                                    style={{ backgroundColor: `${link.color}15` }}
                                                                >
                                                                    <link.icon
                                                                        className="h-6 w-6"
                                                                        style={{ color: link.color }}
                                                                    />
                                                                </div>
                                                                <span className="font-semibold text-sm group-hover:text-city-blue transition-colors">
                                                                    {link.title}
                                                                </span>
                                                            </CardContent>
                                                        </Card>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </>
                    )}
                </AnimatedContainer>

                {/* Floating Chat Input (connected to useChat) */}
                <div className="p-4 border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky bottom-0 z-20">
                    <form
                        onSubmit={onSendMessage}
                        className="max-w-4xl mx-auto flex items-center gap-2"
                    >
                        <div className="relative flex-1 group pl-4">
                            <input
                                value={localInput}
                                onChange={(e) => setLocalInput(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl px-5 py-3 pr-12 focus:ring-2 focus:ring-city-blue/50 transition-all outline-none"
                                placeholder="Pergunte ao DOT sobre estes dados..."
                                disabled={isChatLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-1 top-1 rounded-xl h-8 w-8 bg-city-blue hover:bg-city-blue/90 shadow-lg disabled:opacity-50"
                                disabled={isChatLoading || !localInput.trim()}
                            >
                                {isChatLoading ? <Icons.spinner className="h-4 w-4 animate-spin text-white" /> : <Icons.send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

