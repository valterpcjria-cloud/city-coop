'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Icons } from '@/components/ui/icons'

// ===== DADOS DAS DIRETRIZES =====

const FASES = [
    {
        id: 'fase1',
        numero: 1,
        titulo: 'Formação Cooperativista',
        duracao: '6 meses',
        emoji: '📚',
        cor: 'from-blue-500 to-blue-600',
        corBg: 'bg-blue-50',
        corBorda: 'border-blue-300',
        objetivo: 'Os alunos entendem o que é uma cooperativa e criam a estrutura formal da Coop-Evento.',
        conteudos: [
            {
                titulo: 'História do Cooperativismo',
                items: ['Rochdale', 'Valores e princípios cooperativistas']
            },
            {
                titulo: 'Legislação Básica',
                items: ['O que é uma cooperativa', 'Diferença entre empresa x associação x cooperativa']
            },
            {
                titulo: 'Documentos Oficiais',
                items: ['Estatuto social', 'Ata de constituição', 'Código de ética']
            }
        ],
        atividades: [
            { atividade: 'Aula interativa', acao: 'Assistir conteúdos + Quiz', papel: 'Mediar debate' },
            { atividade: 'Oficina de Estatuto', acao: 'Construção coletiva guiada', papel: 'Validar decisões' },
            { atividade: 'Criação do Código de Ética', acao: 'Discussão de valores', papel: 'Estimular reflexão' },
            { atividade: 'Simulação de Assembleia', acao: 'Votação digital', papel: 'Conduzir processo' }
        ],
        governanca: [
            'Eleição do Conselho de Administração',
            'Eleição do Conselho Fiscal',
            'Eleição do Conselho de Ética'
        ],
        sistemaGera: [
            'Modelo de ata',
            'Lista de eleitos',
            'Registro simbólico da cooperativa escolar'
        ]
    },
    {
        id: 'fase2',
        numero: 2,
        titulo: 'Organização Produtiva',
        duracao: 'Contínuo',
        emoji: '⚙️',
        cor: 'from-orange-500 to-orange-600',
        corBg: 'bg-orange-50',
        corBorda: 'border-orange-300',
        objetivo: 'Criar núcleos de produção da Coop-Evento. A cooperativa deixa de ser "teórica" e vira organização que produz.',
        nucleos: [
            { nome: 'Entretenimento', funcao: 'Jogos, atrações, apresentações' },
            { nome: 'Alimentação', funcao: 'Lanches, organização de vendas' },
            { nome: 'Logística', funcao: 'Espaço, materiais, fluxo do evento' },
            { nome: 'Captação de Patrocínios', funcao: 'Aumentar a capacidade financeira do evento' }
        ],
        aprendizagens: [
            'Trabalho em equipe',
            'Planejamento',
            'Responsabilidade',
            'Divisão de funções',
            'Liderança democrática'
        ],
        metricas: [
            { metrica: 'Reuniões realizadas', exemplo: '3' },
            { metrica: 'Tarefas concluídas', exemplo: '12' },
            { metrica: 'Participação dos membros', exemplo: '% presença' },
            { metrica: 'Propostas criadas', exemplo: '5 ideias' },
            { metrica: 'Problemas resolvidos', exemplo: '2 situações' }
        ],
        resultado: [
            'Uma cooperativa escolar organizada',
            'Governança eleita',
            'Núcleos produtivos funcionando',
            'Alunos vivenciando democracia e gestão'
        ]
    },
    {
        id: 'fase3',
        numero: 3,
        titulo: 'Execução do Coop-Evento',
        duracao: '2-6 semanas',
        emoji: '🎉',
        cor: 'from-green-500 to-green-600',
        corBg: 'bg-green-50',
        corBorda: 'border-green-300',
        objetivo: 'Realizar um evento cooperativista organizado pelos alunos, aplicando governança, produção e responsabilidade coletiva.',
        visao: 'Não é "feirinha". É experiência de gestão cooperativista prática.',
        etapas: [
            {
                numero: 1,
                titulo: 'Planejamento do Evento',
                tempo: '2 a 6 semanas antes',
                decisoes: [
                    { item: 'Nome do evento', exemplo: 'Festival Turma Coop' },
                    { item: 'Objetivo', exemplo: 'Arrecadar fundos / integração escolar' },
                    { item: 'Público', exemplo: 'Alunos, famílias, comunidade' },
                    { item: 'Data e Local', exemplo: 'Quadra, Pátio, Ginásio municipal' }
                ]
            },
            {
                numero: 2,
                titulo: 'Ação dos Núcleos',
                tempo: 'Preparação',
                nucleosAcoes: {
                    entretenimento: ['Programação cultural', 'Gincanas', 'Apresentações'],
                    alimentacao: ['Cardápio', 'Preços', 'Organização de vendas'],
                    logistica: ['Montagem do espaço', 'Materiais', 'Organização de filas e circulação']
                }
            },
            {
                numero: 3,
                titulo: 'Gestão Financeira Educativa',
                tempo: 'Durante preparação',
                aprendizados: [
                    { etapa: 'Definição de preços', aprendizado: 'Noção de custos e valor' },
                    { etapa: 'Registro de vendas', aprendizado: 'Controle' },
                    { etapa: 'Registro de despesas', aprendizado: 'Responsabilidade' },
                    { etapa: 'Resultado final', aprendizado: 'Sobras ou necessidade de ajustes' }
                ]
            },
            {
                numero: 4,
                titulo: 'Realização do Evento',
                tempo: 'Dia do evento',
                acoes: [
                    'Operam os núcleos',
                    'Resolvem imprevistos',
                    'Tomam decisões coletivas',
                    'Praticam cooperação real'
                ],
                nota: 'Professor atua como observador e facilitador, não gestor central.'
            },
            {
                numero: 5,
                titulo: 'Prestação de Contas (Assembleia Final)',
                tempo: 'Após o evento',
                importancia: 'Momento pedagógico mais importante.',
                apresenta: ['Receita', 'Despesas', 'Resultado final', 'Avaliação do evento']
            },
            {
                numero: 6,
                titulo: 'Destinação das Sobras',
                tempo: 'Em assembleia',
                opcoes: [
                    { opcao: 'Reinvestir na escola', aprendizado: 'Planejamento' },
                    { opcao: 'Doação solidária', aprendizado: 'Responsabilidade social' },
                    { opcao: 'Próximo evento', aprendizado: 'Continuidade' }
                ]
            },
            {
                numero: 7,
                titulo: 'Avaliação e Reflexão',
                tempo: 'Final',
                perguntas: [
                    'O que funcionou bem?',
                    'O que poderia melhorar?',
                    'Como foi trabalhar cooperativamente?'
                ],
                consolidacao: 'Aqui consolida aprendizagem socioemocional'
            }
        ],
        resultadoFinal: [
            'Evento realizado',
            'Governança praticada',
            'Gestão financeira vivenciada',
            'Cooperação aplicada'
        ]
    }
]

const PAPEL_PROFESSOR = {
    atuacao: ['Facilitador', 'Mediador', 'Avaliador de participação', 'Estimulador de reflexão ética'],
    plataformaEntrega: [
        'Checklists',
        'Roteiros de assembleia',
        'Modelos de documentos',
        'Relatórios automáticos dos núcleos'
    ]
}

const VOTACAO_DIGITAL = {
    ensina: [
        'Democracia participativa',
        'Transparência',
        'Processo eleitoral formal',
        'Responsabilidade coletiva'
    ],
    sistema: [
        'Lista de candidatos',
        'Tempo de campanha',
        'Votação secreta',
        'Apuração automática',
        'Ata gerada pelo sistema'
    ]
}

const CERTIFICADO_REQUISITOS = [
    'Estatuto criado',
    'Código de ética aprovado',
    'Conselhos eleitos'
]

// ===== COMPONENTE PRINCIPAL =====

export default function DiretrizesPage() {
    const [faseAtiva, setFaseAtiva] = useState('fase1')

    const faseAtual = FASES.find(f => f.id === faseAtiva) || FASES[0]

    return (
        <div className="space-y-8 pb-12">
            {/* Header Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-city-blue via-city-blue to-coop-orange p-8 text-white">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                            <Icons.bookOpen className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">Formação Coop</h1>
                            <p className="text-white/80 text-lg">Diretrizes Pedagógicas</p>
                        </div>
                    </div>

                    <p className="text-xl text-white/90 max-w-2xl mt-4">
                        <strong>Trilha pedagógica guiada pela plataforma</strong> para criar, organizar e executar
                        uma cooperativa escolar temporária que culmina em um evento real.
                    </p>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                            <span className="text-2xl font-bold">3</span>
                            <span className="text-white/70 ml-2">Fases</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                            <span className="text-2xl font-bold">6+</span>
                            <span className="text-white/70 ml-2">Meses</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                            <span className="text-2xl font-bold">4</span>
                            <span className="text-white/70 ml-2">Núcleos</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                            <span className="text-2xl font-bold">1</span>
                            <span className="text-white/70 ml-2">Evento Real</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trilha Visual das Fases */}
            <div className="relative">
                <h2 className="text-2xl font-bold text-city-blue mb-6 flex items-center gap-2">
                    <Icons.flag className="h-6 w-6 text-coop-orange" />
                    Trilha da Formação
                </h2>

                {/* Timeline */}
                <div className="grid md:grid-cols-3 gap-6">
                    {FASES.map((fase, index) => (
                        <button
                            key={fase.id}
                            onClick={() => setFaseAtiva(fase.id)}
                            className={`relative text-left transition-all duration-300 ${faseAtiva === fase.id ? 'scale-105' : 'hover:scale-102 opacity-80 hover:opacity-100'
                                }`}
                        >
                            <Card className={`h-full border-2 ${faseAtiva === fase.id
                                    ? `${fase.corBorda} shadow-xl`
                                    : 'border-gray-200'
                                }`}>
                                <CardHeader className={`${fase.corBg}`}>
                                    <div className="flex items-center justify-between">
                                        <Badge className={`bg-gradient-to-r ${fase.cor} text-white text-lg px-4 py-1`}>
                                            Fase {fase.numero}
                                        </Badge>
                                        <span className="text-4xl">{fase.emoji}</span>
                                    </div>
                                    <CardTitle className="text-xl mt-2">{fase.titulo}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <Icons.clock className="h-4 w-4" />
                                        {fase.duracao}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="text-sm text-tech-gray line-clamp-3">
                                        {fase.objetivo}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Connector Arrow */}
                            {index < FASES.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-6 z-10">
                                    <Icons.arrowRight className="h-8 w-8 text-coop-orange" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Detalhe da Fase Selecionada */}
            <Card className={`border-2 ${faseAtual.corBorda} overflow-hidden`}>
                <CardHeader className={`${faseAtual.corBg}`}>
                    <div className="flex items-center gap-4">
                        <span className="text-5xl">{faseAtual.emoji}</span>
                        <div>
                            <Badge className={`bg-gradient-to-r ${faseAtual.cor} text-white mb-2`}>
                                Fase {faseAtual.numero}
                            </Badge>
                            <CardTitle className="text-2xl">{faseAtual.titulo}</CardTitle>
                            <CardDescription className="text-base mt-1">
                                {faseAtual.objetivo}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {/* Fase 1 Content */}
                    {faseAtual.id === 'fase1' && (
                        <div className="space-y-6">
                            {/* Conteúdos Obrigatórios */}
                            <div>
                                <h3 className="text-lg font-bold text-city-blue mb-4 flex items-center gap-2">
                                    <Icons.bookOpen className="h-5 w-5 text-coop-orange" />
                                    Conteúdos Obrigatórios
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {faseAtual.conteudos?.map((conteudo, i) => (
                                        <div key={i} className="bg-slate-50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-city-blue mb-2">{conteudo.titulo}</h4>
                                            <ul className="space-y-1">
                                                {conteudo.items.map((item, j) => (
                                                    <li key={j} className="text-sm text-tech-gray flex items-center gap-2">
                                                        <Icons.check className="h-4 w-4 text-green-500" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Atividades na Plataforma */}
                            <div>
                                <h3 className="text-lg font-bold text-city-blue mb-4 flex items-center gap-2">
                                    <Icons.target className="h-5 w-5 text-coop-orange" />
                                    Atividades na Plataforma
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-city-blue text-white">
                                            <tr>
                                                <th className="p-3 text-left rounded-tl-lg">Atividade</th>
                                                <th className="p-3 text-left">Ação do Aluno</th>
                                                <th className="p-3 text-left rounded-tr-lg">Papel do Professor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {faseAtual.atividades?.map((atv, i) => (
                                                <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                                                    <td className="p-3 font-medium">{atv.atividade}</td>
                                                    <td className="p-3 text-tech-gray">{atv.acao}</td>
                                                    <td className="p-3 text-coop-orange font-medium">{atv.papel}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Governança */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-city-blue/10 to-coop-orange/10 p-6 rounded-xl">
                                    <h3 className="text-lg font-bold text-city-blue mb-4 flex items-center gap-2">
                                        <Icons.vote className="h-5 w-5 text-coop-orange" />
                                        Estrutura de Governança
                                    </h3>
                                    <p className="text-sm text-tech-gray mb-3">A plataforma deve conduzir:</p>
                                    <ul className="space-y-2">
                                        {faseAtual.governanca?.map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg">
                                                <span className="text-lg">🗳️</span>
                                                <span className="font-medium">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                                    <h3 className="text-lg font-bold text-city-blue mb-4 flex items-center gap-2">
                                        <Icons.fileText className="h-5 w-5 text-green-600" />
                                        Sistema Gera Automaticamente
                                    </h3>
                                    <ul className="space-y-2">
                                        {faseAtual.sistemaGera?.map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg">
                                                <Icons.check className="h-5 w-5 text-green-500" />
                                                <span className="font-medium">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fase 2 Content */}
                    {faseAtual.id === 'fase2' && (
                        <div className="space-y-6">
                            {/* Núcleos Obrigatórios */}
                            <div>
                                <h3 className="text-lg font-bold text-city-blue mb-4 flex items-center gap-2">
                                    <Icons.users className="h-5 w-5 text-coop-orange" />
                                    Núcleos Obrigatórios
                                </h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {faseAtual.nucleos?.map((nucleo, i) => (
                                        <div key={i} className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border border-orange-200">
                                            <h4 className="font-bold text-city-blue text-lg mb-2">{nucleo.nome}</h4>
                                            <p className="text-sm text-tech-gray">{nucleo.funcao}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Aprendizagens */}
                            <div className="bg-gradient-to-r from-city-blue/5 to-coop-orange/5 p-6 rounded-xl">
                                <h3 className="text-lg font-bold text-city-blue mb-4 flex items-center gap-2">
                                    <Icons.graduationCap className="h-5 w-5 text-coop-orange" />
                                    Aprendizagens Envolvidas
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {faseAtual.aprendizagens?.map((item, i) => (
                                        <Badge key={i} variant="outline" className="text-base px-4 py-2 border-city-blue text-city-blue">
                                            ✔ {item}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Métricas */}
                            <div>
                                <h3 className="text-lg font-bold text-city-blue mb-4 flex items-center gap-2">
                                    <Icons.target className="h-5 w-5 text-coop-orange" />
                                    Métricas por Núcleo (para a plataforma)
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-city-blue text-white">
                                            <tr>
                                                <th className="p-3 text-left rounded-tl-lg">Métrica</th>
                                                <th className="p-3 text-left rounded-tr-lg">Exemplo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {faseAtual.metricas?.map((m, i) => (
                                                <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                                                    <td className="p-3 font-medium">{m.metrica}</td>
                                                    <td className="p-3 text-tech-gray">{m.exemplo}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-tech-gray mt-3 italic">
                                    Isso gera: Pontuação, moedas para o APP Desafio Coop, Relatórios para professor
                                </p>
                            </div>

                            {/* Resultado */}
                            <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
                                <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                                    <Icons.trophy className="h-5 w-5" />
                                    Resultado Final dessa Etapa
                                </h3>
                                <p className="text-sm text-tech-gray mb-3">Ao fim da Fase 2, a escola já tem:</p>
                                <ul className="grid md:grid-cols-2 gap-2">
                                    {faseAtual.resultado?.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 bg-white p-3 rounded-lg">
                                            <Icons.check className="h-5 w-5 text-green-500" />
                                            <span className="font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Fase 3 Content */}
                    {faseAtual.id === 'fase3' && (
                        <div className="space-y-6">
                            {/* Visão */}
                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl border-l-4 border-green-500">
                                <p className="text-lg font-bold text-green-800">{faseAtual.visao}</p>
                                <p className="text-green-700 mt-2">
                                    O evento é o momento em que os alunos vivenciam: planejamento real, produção coletiva,
                                    gestão de recursos, tomada de decisão e prestação de contas.
                                </p>
                            </div>

                            {/* Etapas */}
                            <div>
                                <h3 className="text-lg font-bold text-city-blue mb-4 flex items-center gap-2">
                                    <Icons.flag className="h-5 w-5 text-coop-orange" />
                                    Etapas da Execução
                                </h3>
                                <Accordion type="single" collapsible className="space-y-2">
                                    {faseAtual.etapas?.map((etapa) => (
                                        <AccordionItem
                                            key={etapa.numero}
                                            value={`etapa-${etapa.numero}`}
                                            className="bg-white border rounded-lg overflow-hidden"
                                        >
                                            <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center font-bold text-sm">
                                                        {etapa.numero}
                                                    </span>
                                                    <div className="text-left">
                                                        <span className="font-semibold text-city-blue">{etapa.titulo}</span>
                                                        <span className="text-xs text-tech-gray block">{etapa.tempo}</span>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                {/* Etapa 1 */}
                                                {etapa.decisoes && (
                                                    <div className="grid md:grid-cols-2 gap-3 mt-2">
                                                        {etapa.decisoes.map((d, i) => (
                                                            <div key={i} className="bg-slate-50 p-3 rounded-lg">
                                                                <span className="text-sm text-tech-gray">{d.item}</span>
                                                                <span className="block font-medium text-city-blue">{d.exemplo}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Etapa 2 */}
                                                {etapa.nucleosAcoes && (
                                                    <div className="grid md:grid-cols-3 gap-4 mt-2">
                                                        {Object.entries(etapa.nucleosAcoes).map(([nucleo, acoes]) => (
                                                            <div key={nucleo} className="bg-orange-50 p-4 rounded-lg">
                                                                <h5 className="font-bold text-city-blue capitalize mb-2">{nucleo}</h5>
                                                                <ul className="space-y-1">
                                                                    {(acoes as string[]).map((a, i) => (
                                                                        <li key={i} className="text-sm flex items-center gap-1">
                                                                            <Icons.check className="h-3 w-3 text-green-500" />
                                                                            {a}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Etapa 3 */}
                                                {etapa.aprendizados && (
                                                    <table className="w-full text-sm mt-2">
                                                        <thead className="bg-green-100">
                                                            <tr>
                                                                <th className="p-2 text-left">Etapa</th>
                                                                <th className="p-2 text-left">Aprendizado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {etapa.aprendizados.map((a, i) => (
                                                                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                                    <td className="p-2">{a.etapa}</td>
                                                                    <td className="p-2 font-medium text-green-700">{a.aprendizado}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}

                                                {/* Etapa 4 */}
                                                {etapa.acoes && (
                                                    <div className="mt-2">
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {etapa.acoes.map((a, i) => (
                                                                <Badge key={i} className="bg-green-100 text-green-800">
                                                                    ✔ {a}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        {etapa.nota && (
                                                            <p className="text-sm text-tech-gray italic bg-yellow-50 p-3 rounded-lg">
                                                                💡 {etapa.nota}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Etapa 5 */}
                                                {etapa.apresenta && (
                                                    <div className="mt-2">
                                                        {etapa.importancia && (
                                                            <p className="text-sm font-bold text-coop-orange mb-3">⭐ {etapa.importancia}</p>
                                                        )}
                                                        <div className="flex flex-wrap gap-2">
                                                            {etapa.apresenta.map((a, i) => (
                                                                <Badge key={i} variant="outline" className="border-city-blue text-city-blue">
                                                                    {a}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Etapa 6 */}
                                                {etapa.opcoes && (
                                                    <div className="grid md:grid-cols-3 gap-3 mt-2">
                                                        {etapa.opcoes.map((o, i) => (
                                                            <div key={i} className="bg-blue-50 p-4 rounded-lg text-center">
                                                                <span className="block font-bold text-city-blue">{o.opcao}</span>
                                                                <span className="text-sm text-tech-gray">→ {o.aprendizado}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Etapa 7 */}
                                                {etapa.perguntas && (
                                                    <div className="mt-2">
                                                        <div className="space-y-2 mb-3">
                                                            {etapa.perguntas.map((p, i) => (
                                                                <div key={i} className="bg-purple-50 p-3 rounded-lg flex items-center gap-2">
                                                                    <span className="text-purple-600">❓</span>
                                                                    <span className="text-purple-800">{p}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {etapa.consolidacao && (
                                                            <p className="text-sm text-purple-700 font-medium">
                                                                💜 {etapa.consolidacao}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>

                            {/* Resultado Final */}
                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl">
                                <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                                    <Icons.trophy className="h-5 w-5" />
                                    Resultado Final
                                </h3>
                                <div className="grid md:grid-cols-4 gap-3">
                                    {faseAtual.resultadoFinal?.map((item, i) => (
                                        <div key={i} className="bg-white p-4 rounded-lg text-center shadow-sm">
                                            <Icons.check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                            <span className="font-medium text-city-blue text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Seções Complementares */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Papel do Professor */}
                <Card className="border-city-blue/30">
                    <CardHeader className="bg-gradient-to-r from-city-blue/10 to-city-blue/5">
                        <CardTitle className="flex items-center gap-2 text-city-blue">
                            <Icons.user className="h-5 w-5 text-coop-orange" />
                            Papel do Professor na Plataforma
                        </CardTitle>
                        <CardDescription>
                            O professor não "dá aula tradicional", ele atua como:
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {PAPEL_PROFESSOR.atuacao.map((item, i) => (
                                <Badge key={i} className="bg-city-blue text-white text-sm px-3 py-1">
                                    {item}
                                </Badge>
                            ))}
                        </div>
                        <div>
                            <p className="text-sm text-tech-gray mb-2">A plataforma entrega ao professor:</p>
                            <ul className="space-y-2">
                                {PAPEL_PROFESSOR.plataformaEntrega.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <Icons.check className="h-4 w-4 text-green-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Votação Digital */}
                <Card className="border-coop-orange/30">
                    <CardHeader className="bg-gradient-to-r from-coop-orange/10 to-coop-orange/5">
                        <CardTitle className="flex items-center gap-2 text-city-blue">
                            <Icons.vote className="h-5 w-5 text-coop-orange" />
                            Votação Digital — Impacto Real
                        </CardTitle>
                        <CardDescription>
                            Sistema de Assembleia Digital
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div>
                            <p className="text-sm text-tech-gray mb-2">Isso ensina na prática:</p>
                            <div className="flex flex-wrap gap-2">
                                {VOTACAO_DIGITAL.ensina.map((item, i) => (
                                    <Badge key={i} variant="outline" className="border-coop-orange text-coop-orange">
                                        ✔ {item}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-tech-gray mb-2">Funcionalidades do sistema:</p>
                            <ul className="space-y-2">
                                {VOTACAO_DIGITAL.sistema.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm bg-orange-50 p-2 rounded">
                                        <span>🗳️</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Certificado */}
            <Card className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="text-8xl">🏆</div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-amber-800 mb-2">
                                Certificado de Registro Simbólico
                            </h3>
                            <p className="text-amber-700 mb-4">
                                Emitido pelo <strong>Ecossistema City Coop</strong>
                            </p>
                            <p className="text-sm text-amber-600 mb-4">Após cumprir:</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                {CERTIFICADO_REQUISITOS.map((req, i) => (
                                    <Badge key={i} className="bg-green-500 text-white text-sm px-4 py-2">
                                        <Icons.check className="h-4 w-4 mr-1" />
                                        {req}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
