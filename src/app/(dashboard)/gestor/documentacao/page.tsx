'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    BookOpen, Search, ChevronRight, ChevronDown, Users, School,
    GraduationCap, Settings, BarChart3, MessageSquare, Vote,
    FileText, Calendar, Target, Sparkles, Shield, Database,
    Layers, CheckCircle2, Clock, Zap
} from 'lucide-react'

// Documentation sections data
const sections = [
    {
        id: 'overview',
        title: 'Visão Geral',
        icon: Layers,
        color: 'from-blue-500 to-cyan-500',
        description: 'Arquitetura e estrutura do sistema',
        content: [
            {
                subtitle: 'Arquitetura SaaS Multi-Tenant',
                items: [
                    'Sistema baseado em Next.js 16 com App Router',
                    'Banco de dados Supabase (PostgreSQL)',
                    'Autenticação integrada com Supabase Auth',
                    'Inteligência Artificial com Claude 3.5 e GPT-4o',
                    'Isolamento de dados por escola (Row Level Security)'
                ]
            },
            {
                subtitle: 'Perfis de Usuário',
                items: [
                    'Gestor: Administrador geral - gerencia escolas e configurações',
                    'Professor: Gerencia turmas, cooperativas e avaliações',
                    'Estudante: Participa da cooperativa e acessa o DOT'
                ]
            }
        ]
    },
    {
        id: 'gestor',
        title: 'Painel do Gestor',
        icon: Settings,
        color: 'from-purple-500 to-pink-500',
        description: 'Funcionalidades administrativas',
        content: [
            {
                subtitle: 'Gestão de Escolas',
                items: [
                    'Cadastro de múltiplas escolas (ilimitado)',
                    'Edição de dados: nome, código, cidade, estado',
                    'Visualização de métricas por escola',
                    'Exclusão com confirmação de segurança'
                ]
            },
            {
                subtitle: 'Gestão de Professores',
                items: [
                    'Cadastro vinculado à escola',
                    'Criação automática de usuário',
                    'Edição de vínculos e permissões',
                    'Listagem com filtros avançados'
                ]
            },
            {
                subtitle: 'Base de Conhecimento IA',
                items: [
                    'Upload de PDFs, DOCX, TXT e imagens',
                    'Processamento de URLs (YouTube e websites)',
                    'Extração automática de conteúdo',
                    'Alimentação do cérebro do DOT Assistente'
                ]
            },
            {
                subtitle: 'Relatórios',
                items: [
                    'Dashboard com KPIs consolidados',
                    'Relatórios de escolas, alunos, turmas',
                    'Relatórios de eventos e eleições',
                    'Exportação em CSV, XLSX e PDF'
                ]
            }
        ]
    },
    {
        id: 'professor',
        title: 'Painel do Professor',
        icon: GraduationCap,
        color: 'from-green-500 to-emerald-500',
        description: 'Ferramentas pedagógicas',
        content: [
            {
                subtitle: 'Gestão de Turmas',
                items: [
                    'Criação de turmas com série e modalidade',
                    'Matrícula de alunos',
                    'Configuração da cooperativa',
                    'Organização dos 6 núcleos'
                ]
            },
            {
                subtitle: 'Sistema de Eleições',
                items: [
                    'Configuração de eleições democráticas',
                    'Cadastro de candidatos por cargo',
                    'Votação secreta pelos alunos',
                    'Apuração e proclamação de resultados'
                ]
            },
            {
                subtitle: 'Avaliações Inteligentes',
                items: [
                    'Geração de avaliações por IA',
                    'Tipos: Objetiva, Dissertativa, Redação',
                    'Correção assistida por IA',
                    'Feedback automático personalizado'
                ]
            },
            {
                subtitle: 'Planos de Evento',
                items: [
                    'Editor completo de planos',
                    'Avaliação de viabilidade por IA',
                    'Workflow de aprovação',
                    'Acompanhamento de execução'
                ]
            }
        ]
    },
    {
        id: 'estudante',
        title: 'Painel do Estudante',
        icon: Users,
        color: 'from-orange-500 to-amber-500',
        description: 'Experiência do aluno',
        content: [
            {
                subtitle: 'Cooperativa e Núcleo',
                items: [
                    'Visualização do meu núcleo',
                    'Tarefas e atribuições pendentes',
                    'Upload de entregas',
                    'Colaboração com colegas'
                ]
            },
            {
                subtitle: 'Participação em Eleições',
                items: [
                    'Candidatura a cargos',
                    'Votação secreta e segura',
                    'Acompanhamento de resultados',
                    'Histórico de eleições'
                ]
            },
            {
                subtitle: 'DOT Assistente',
                items: [
                    'Chat inteligente com IA',
                    'Orientações sobre cooperativismo',
                    'Suporte ao planejamento do evento',
                    'Não faz trabalho pelo aluno (pedagógico)'
                ]
            }
        ]
    },
    {
        id: 'ia',
        title: 'Inteligência Artificial',
        icon: Sparkles,
        color: 'from-violet-500 to-purple-500',
        description: 'Recursos de IA do sistema',
        content: [
            {
                subtitle: 'DOT Assistente (Estudantes)',
                items: [
                    'Orientação pedagógica sem dar respostas prontas',
                    'Acesso à base de conhecimento do Gestor',
                    'Histórico de conversas persistente',
                    'Contexto adaptado por turma/núcleo'
                ]
            },
            {
                subtitle: 'Coop Assistant (Professores)',
                items: [
                    'Suporte metodológico especializado',
                    'Estratégias de condução de turmas',
                    'Orientações sobre assembleias',
                    'Dicas de avaliação formativa'
                ]
            },
            {
                subtitle: 'Geradores Automáticos',
                items: [
                    'Gerador de Avaliações (objetiva/dissertativa)',
                    'Avaliador de Planos de Evento',
                    'Gerador de Pautas de Assembleia',
                    'Gerador de Atas de Reunião'
                ]
            }
        ]
    },
    {
        id: 'seguranca',
        title: 'Segurança',
        icon: Shield,
        color: 'from-red-500 to-rose-500',
        description: 'Proteção e privacidade',
        content: [
            {
                subtitle: 'Autenticação',
                items: [
                    'Login seguro via Supabase Auth',
                    'Senhas criptografadas',
                    'Sessões com token JWT',
                    'Logout automático por inatividade'
                ]
            },
            {
                subtitle: 'Isolamento de Dados',
                items: [
                    'Row Level Security (RLS) por escola',
                    'Professores veem apenas suas turmas',
                    'Alunos veem apenas sua cooperativa',
                    'Gestor tem visão consolidada'
                ]
            }
        ]
    }
]

const quickStats = [
    { label: 'Módulos', value: '3', icon: Layers, color: 'text-blue-500' },
    { label: 'Páginas', value: '40+', icon: FileText, color: 'text-green-500' },
    { label: 'APIs', value: '25+', icon: Zap, color: 'text-purple-500' },
    { label: 'Tabelas', value: '18', icon: Database, color: 'text-orange-500' }
]

export default function DocumentacaoPage() {
    const [expandedSection, setExpandedSection] = useState<string | null>('overview')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredSections = sections.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.some(c =>
            c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.items.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-city-blue via-indigo-600 to-purple-600 text-white">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative px-6 py-12 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-4 mb-4"
                    >
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Documentação do Sistema</h1>
                            <p className="text-white/80">City Coop Platform v2.2.1</p>
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg text-white/90 max-w-2xl mb-8"
                    >
                        Guia completo de todas as funcionalidades da plataforma de cooperativismo escolar.
                        Explore módulos, recursos e integrações disponíveis.
                    </motion.p>

                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                        {quickStats.map((stat, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <stat.icon className="h-5 w-5 mb-2 text-white/80" />
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-sm text-white/70">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Pesquisar na documentação..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white border-gray-200 focus:ring-city-blue"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-2">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Seções
                            </h3>
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setExpandedSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${expandedSection === section.id
                                            ? 'bg-city-blue text-white shadow-lg shadow-city-blue/25'
                                            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-100'
                                        }`}
                                >
                                    <section.icon className="h-5 w-5" />
                                    <span className="font-medium">{section.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        <AnimatePresence mode="wait">
                            {filteredSections.map((section) => (
                                <motion.div
                                    key={section.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className={expandedSection === section.id || searchQuery ? 'block' : 'hidden lg:block'}
                                >
                                    <Card className="overflow-hidden border-0 shadow-lg">
                                        <CardHeader
                                            className={`bg-gradient-to-r ${section.color} text-white cursor-pointer`}
                                            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white/20 rounded-lg">
                                                        <section.icon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-xl">{section.title}</CardTitle>
                                                        <CardDescription className="text-white/80">
                                                            {section.description}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                {expandedSection === section.id ? (
                                                    <ChevronDown className="h-5 w-5" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5" />
                                                )}
                                            </div>
                                        </CardHeader>

                                        <AnimatePresence>
                                            {(expandedSection === section.id || searchQuery) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <CardContent className="p-6 space-y-6">
                                                        {section.content.map((subsection, idx) => (
                                                            <div key={idx}>
                                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${section.color}`} />
                                                                    {subsection.subtitle}
                                                                </h4>
                                                                <ul className="space-y-2 ml-4">
                                                                    {subsection.items.map((item, itemIdx) => (
                                                                        <motion.li
                                                                            key={itemIdx}
                                                                            initial={{ opacity: 0, x: -10 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ delay: itemIdx * 0.05 }}
                                                                            className="flex items-start gap-2 text-gray-600"
                                                                        >
                                                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                                            <span>{item}</span>
                                                                        </motion.li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </CardContent>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredSections.length === 0 && (
                            <div className="text-center py-12">
                                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Nenhum resultado encontrado para "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-white mt-12">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">Última atualização: Fevereiro 2026</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-city-blue/10 text-city-blue">
                                v2.2.1
                            </Badge>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Produção
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
