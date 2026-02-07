'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from 'recharts'

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
                }}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                >
                    <Icon className="h-5 w-5" style={{ color }} />
                </div>
            </CardHeader>
            <CardContent>
                <motion.div
                    className="text-3xl font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: delay + 0.2 }}
                >
                    {value}
                </motion.div>
            </CardContent>
        </Card>
    </motion.div>
)

export default function ReportsPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const res = await fetch('/api/gestor/reports/metrics')
                const data = await res.json()
                if (data.success) {
                    setMetrics(data.metrics)
                }
            } catch (error) {
                console.error('Error fetching metrics:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchMetrics()
    }, [])

    const reportLinks = [
        { title: 'Escolas', href: '/gestor/relatorios/escolas', icon: Icons.school, color: '#0088FE' },
        { title: 'Turmas', href: '/gestor/relatorios/turmas', icon: Icons.users, color: '#00C49F' },
        { title: 'Alunos', href: '/gestor/relatorios/alunos', icon: Icons.graduationCap, color: '#FFBB28' },
        { title: 'Eventos', href: '/gestor/relatorios/eventos', icon: Icons.calendar, color: '#FF8042' },
        { title: 'Eleições', href: '/gestor/relatorios/eleicoes', icon: Icons.vote, color: '#8884d8' },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Icons.spinner className="h-8 w-8 animate-spin text-city-blue" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-city-blue to-coop-orange bg-clip-text text-transparent">
                        Central de Relatórios
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Métricas em tempo real e relatórios detalhados
                    </p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Icons.refresh className="h-4 w-4" />
                    Atualizar
                </Button>
            </div>

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

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Students by Grade */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Icons.chart className="h-5 w-5 text-city-blue" />
                                Alunos por Série
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={metrics?.studentsByGrade || []}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255,255,255,0.95)',
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="url(#colorGradient)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#0088FE" />
                                            <stop offset="100%" stopColor="#00C49F" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Events by Status */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Icons.calendar className="h-5 w-5 text-coop-orange" />
                                Eventos por Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={metrics?.eventsByStatus || []}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={60}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            `${name}: ${(percent * 100).toFixed(0)}%`
                                        }
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
                <Card className="shadow-lg border-0">
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
                                        <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border hover:border-city-blue/30">
                                            <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                                                <div
                                                    className="h-12 w-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                                                    style={{ backgroundColor: `${link.color}20` }}
                                                >
                                                    <link.icon
                                                        className="h-6 w-6"
                                                        style={{ color: link.color }}
                                                    />
                                                </div>
                                                <span className="font-medium text-sm group-hover:text-city-blue transition-colors">
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
        </div>
    )
}
