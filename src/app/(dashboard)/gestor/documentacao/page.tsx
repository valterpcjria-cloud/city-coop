'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    BookOpen, Search, ChevronRight, ChevronDown, Users, School,
    GraduationCap, Settings, BarChart3, MessageSquare, Vote,
    FileText, Calendar, Target, Sparkles, Shield, Database,
    Layers, CheckCircle2, Clock, Zap, Upload, Download, BrainCircuit,
    Award, ScrollText, Handshake
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
                    'Sistema baseado em Next.js 16 com App Router e React 19',
                    'Banco de dados Supabase (PostgreSQL) com RLS nativo',
                    'Autenticação integrada com Supabase Auth e JWT',
                    'Inteligência Artificial dual: Claude 3.5 Sonnet e GPT-4o',
                    'Isolamento total de dados por escola (Row Level Security)',
                    'Cache de dados com TanStack Query v5',
                    'Animações premium com Framer Motion v12'
                ]
            },
            {
                subtitle: 'Perfis de Usuário',
                items: [
                    'Superadmin: Controle total de usuários, escolas e sistema',
                    'Gestor: Administração de escola, base de conhecimento e relatórios',
                    'Professor: Gerencia turmas, avaliações e eleições pedagógicas',
                    'Estudante: Participa da cooperativa, se forma e interage com o DOT'
                ]
            },
            {
                subtitle: 'Fluxo de Dados IA',
                items: [
                    'Gestor alimenta a base de conhecimento (PDF, DOCX, YouTube, URLs)',
                    'DOT recupera conteúdo relevante por similaridade de palavras-chave (RAG)',
                    'Busca na web com filtragem automática de escopo cooperativista',
                    'Histórico de conversas persistido por usuário no Supabase'
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
                subtitle: 'Controle de Usuários',
                items: [
                    'CRUD completo: criar, editar, excluir usuários por role',
                    'Validação de CPF obrigatória para segurança',
                    'Ativação e desativação instantânea de contas',
                    'Reset de senhas administrativo via email (restrito por role)',
                    'SuperAdmins: exclusão de usuários; Admins: reset de senha apenas'
                ]
            },
            {
                subtitle: 'Gestão de Escolas',
                items: [
                    'Cadastro de múltiplas escolas (ilimitado)',
                    'Edição de metadados: INEP, categoria, localização',
                    'Métricas de engajamento por unidade escolar',
                    'Exclusão segura com verificação de dependências'
                ]
            },
            {
                subtitle: 'Base de Conhecimento IA',
                items: [
                    'Upload de PDFs, DOCX, TXT e imagens',
                    'Processamento de URLs de websites',
                    'Extração automática de transcrições do YouTube',
                    'Alimenta o cérebro do DOT Assistente via RAG'
                ]
            },
            {
                subtitle: 'Importação e Exportação de Dados',
                items: [
                    'Importação em massa de alunos via planilha (XLSX/CSV)',
                    'Validação com relatório de erros por linha',
                    'Exportação de relatórios em CSV, XLSX e PDF',
                    'Download de listas de usuários e métricas'
                ]
            },
            {
                subtitle: 'Gestão de Cooperativas Parceiras',
                items: [
                    'Cadastro completo de cooperativas (Razão Social, CNPJ, Ramo)',
                    'Matching geográfico com oportunidades de estágio',
                    'Edição e exclusão segura de parcerias',
                    'Banco territorial de oportunidades cooperativistas'
                ]
            },
            {
                subtitle: 'Relatórios e KPIs',
                items: [
                    'Dashboard com KPIs consolidados em tempo real',
                    'Relatórios de escolas, alunos, professores e engajamento',
                    'Mapeamento de conexões produtivas por região',
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
                    'Criação de turmas com série, modalidade e nome da cooperativa',
                    'Matrícula e gerenciamento de alunos',
                    'Organização dos 6 núcleos cooperativistas',
                    'Configuração de cargos e responsabilidades por núcleo'
                ]
            },
            {
                subtitle: 'Avaliações com IA',
                items: [
                    'Geração inteligente de questões por tema cooperativista',
                    'Tipos: Objetiva, Dissertativa e Redação',
                    'Editor manual para revisão e ajuste pré-publicação',
                    'Correção automática assistida com feedback pedagógico',
                    'Monitoramento de submissões em tempo real'
                ]
            },
            {
                subtitle: 'Sistema de Eleições',
                items: [
                    'Configuração de eleições democráticas por turma',
                    'Cadastro de candidatos por cargo cooperativista',
                    'Votação secreta e segura pelos alunos',
                    'Apuração automática e proclamação de resultados'
                ]
            },
            {
                subtitle: 'Eventos e Projetos',
                items: [
                    'Gestão de Ciclos e Cronogramas',
                    'Avaliação de viabilidade de planos de evento por IA',
                    'Acompanhamento de entregas por núcleo',
                    'Workflow de aprovação e feedback administrativo'
                ]
            },
            {
                subtitle: 'Diretrizes e DOT para Professores',
                items: [
                    'Regras e orientações pedagógicas por módulo',
                    'DOT Assistant com suporte metodológico especializado',
                    'Estratégias de condução de turmas e assembleias',
                    'Histórico de conversas persistente por professor'
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
                subtitle: 'Formação Cooperativista',
                items: [
                    'Trilha completa com 6 núcleos de atuação',
                    'Conteúdos progressivos sobre cooperativismo',
                    'Acesso a materiais da base de conhecimento do gestor',
                    'Acompanhamento de progresso na formação'
                ]
            },
            {
                subtitle: 'Cooperativa e Núcleo',
                items: [
                    'Visualização do meu núcleo e cargo',
                    'Tarefas e atribuições pendentes',
                    'Upload de entregas por atividade',
                    'Colaboração com colegas de núcleo'
                ]
            },
            {
                subtitle: 'Eleições Democráticas',
                items: [
                    'Candidatura a cargos cooperativistas',
                    'Votação secreta e segura',
                    'Acompanhamento em tempo real dos resultados',
                    'Histórico de eleições da cooperativa'
                ]
            },
            {
                subtitle: 'DOT Assistente 2.0',
                items: [
                    'Chat inteligente exclusivo sobre cooperativismo',
                    'Orientação pelo método socrático (sem respostas prontas)',
                    'Acesso à base de conhecimento do gestor',
                    'Histórico de conversas persistente',
                    'Filtragem de topics off-topic (foco pedagógico)'
                ]
            }
        ]
    },
    {
        id: 'ia',
        title: 'Inteligência Artificial',
        icon: BrainCircuit,
        color: 'from-violet-500 to-purple-500',
        description: 'DOT Assistente 2.0 e geradores',
        content: [
            {
                subtitle: 'DOT Assistente 2.0 — Estudantes',
                items: [
                    'Identidade profissional focada 100% em cooperativismo',
                    'Blindagem pedagógica: método socrático, sem respostas prontas',
                    'Acesso ao RAG interno da base de conhecimento do gestor',
                    'Filtragem automática de escopo (off-topic retorna resposta padrão)',
                    'Histórico persistente de conversas por usuário',
                    'Dual model: Claude 3.5 Sonnet ou GPT-4o (selecionável)'
                ]
            },
            {
                subtitle: 'Coop Assistant — Professores',
                items: [
                    'Suporte metodológico especializado em cooperativismo',
                    'Estratégias de condução de turmas e assembleias',
                    'Orientações sobre avaliação formativa',
                    'Histórico de conversas persistente por professor'
                ]
            },
            {
                subtitle: 'Geradores Automáticos',
                items: [
                    'Gerador de Avaliações (objetiva, dissertativa, redação)',
                    'Avaliador de Planos de Evento com feedback técnico detalhado',
                    'Correção automática de respostas dissertativas',
                    'Monitoramento de submissões em tempo real por turma'
                ]
            },
            {
                subtitle: 'Busca na Web (RAG Híbrido)',
                items: [
                    'Pesquisa web contextual ativada por flag',
                    'Filtragem automática de temas fora do escopo',
                    'Resultados formatados e injetados no contexto do modelo',
                    'Prioridade sempre para a base de conhecimento interna'
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
                subtitle: 'Autenticação e Sessões',
                items: [
                    'Login seguro via Supabase Auth com refresh automático',
                    'Tokens JWT criptografados e validados no servidor',
                    'Logout automático por inatividade configurável',
                    'Middleware de proteção de rotas por role'
                ]
            },
            {
                subtitle: 'Isolamento Multi-Tenant',
                items: [
                    'Row Level Security (RLS) para cada escola',
                    'Service Role Key exclusiva para operações de servidor',
                    'Nenhum dado cruza entre escolas diferentes',
                    'Auditoria de acesso via logs do Supabase'
                ]
            },
            {
                subtitle: 'Validação e Performance',
                items: [
                    'Validação dupla: Zod no frontend + backend',
                    'Rate Limiting nos endpoints de IA',
                    'Queries otimizadas via PostgreSQL RPC',
                    'Middleware de baixa latência com Next.js Edge Runtime'
                ]
            }
        ]
    }
]

const quickStats = [
    { label: 'Módulos', value: '3', icon: Layers, color: 'text-blue-500' },
    { label: 'Páginas', value: '55+', icon: FileText, color: 'text-green-500' },
    { label: 'APIs', value: '45+', icon: Zap, color: 'text-purple-500' },
    { label: 'Tabelas', value: '24', icon: Database, color: 'text-orange-500' }
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
                            <p className="text-white/80">City Coop Platform v2.16.0</p>
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
                                <p className="text-gray-500">Nenhum resultado encontrado para &quot;{searchQuery}&quot;</p>
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
                            <span className="text-sm">Última atualização: Fevereiro 2026 · DOT Assistente 2.0</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-city-blue/10 text-city-blue">
                                v2.16.0
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
