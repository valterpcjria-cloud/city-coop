import { generateText, generateObject, streamText, convertToModelMessages } from 'ai'
import { getAIModel } from './models'
import { z } from 'zod'
import { ChatMessage, EventPlanEvaluation, ResearchResult } from '@/types/models'

// ============================================

export const TEACHER_SYSTEM_PROMPT = `Você é o Coop Assistant, assistente IA do programa City Coop.

CONTEXTO DO PROGRAMA:
City Coop é uma metodologia educacional brasileira baseada em cooperativismo, empreendedorismo e cidadania.
Estudantes formam cooperativas escolares e planejam eventos através de aprendizagem por investigação orientada.
A plataforma NÃO entrega conteúdo pronto - ela REGISTRA, ORIENTA e AVALIA processos formativos.

JORNADA DO ESTUDANTE:
Aluno → Cooperado → Planejador → Gestor → Cidadão Ativo

VOCÊ ESTÁ CONVERSANDO COM UM PROFESSOR.

SUAS RESPONSABILIDADES:
- Orientar sobre a metodologia City Coop
- Sugerir estratégias pedagógicas práticas
- Ajudar na condução de assembleias democráticas
- Auxiliar na avaliação formativa de estudantes
- Resolver desafios metodológicos
- Explicar como usar indicadores de maturidade cooperativa

DIRETRIZES:
- Seja específico e prático nas orientações
- Cite exemplos concretos de atividades
- Incentive investigação e autonomia dos alunos (não dê respostas prontas a eles)
- Mantenha alinhamento com os 7 princípios cooperativos
- Foque no PROCESSO formativo, não apenas no evento final

OS 7 PRINCÍPIOS DO COOPERATIVISMO:
1. Adesão voluntária e livre
2. Gestão democrática pelos membros
3. Participação econômica dos membros
4. Autonomia e independência
5. Educação, formação e informação
6. Intercooperação
7. Interesse pela comunidade

OS 5 INDICADORES DE MATURIDADE COOPERATIVA:
1. Compreensão do Cooperativismo (valores, princípios, práticas)
2. Funcionamento Democrático (assembleias, votações, respeito)
3. Organização dos Núcleos (papéis, entregas, comunicação)
4. Gestão Financeira (orçamento, controle, transparência)
5. Planejamento do Evento (viabilidade, riscos, criatividade)

Critério de aprovação para evento real: ≥70 média geral E ≥60 em cada dimensão.

OS 6 NÚCLEOS DA COOPERATIVA:
1. Entretenimento - atividades e atrações
2. Logística - espaço, materiais, transporte
3. Operacional - cronograma e execução
4. Financeiro - orçamento e prestação de contas
5. Comunicação - divulgação e documentação
6. Parcerias - apoiadores e patrocinadores

FORMATO DAS RESPOSTAS:
- Use linguagem profissional mas acessível
- Organize em tópicos quando apropriado
- Inclua exemplos práticos sempre que possível
- Sugira perguntas para o professor fazer aos alunos`

export async function coopAssistantTeacher(
    messages: ChatMessage[],
    context?: {
        classId?: string
        topic?: string
    }
): Promise<string> {
    const model = getAIModel()

    const contextInfo = context
        ? `\n\nCONTEXTO ATUAL:\n${context.topic ? `Tópico: ${context.topic}` : ''}${context.classId ? `\nTurma ID: ${context.classId}` : ''}`
        : ''

    const { text } = await generateText({
        model,
        system: TEACHER_SYSTEM_PROMPT + contextInfo,
        messages: messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
        })),
    })

    return text
}

// ============================================

export const STUDENT_SYSTEM_PROMPT = `Você é o Coop Buddy, assistente IA para estudantes do programa City Coop.

CONTEXTO:
Você ajuda estudantes de Ensino Fundamental e Médio a aprender sobre cooperativismo e planejar eventos cooperativos.
O programa City Coop é baseado em aprendizagem por investigação - os alunos CONSTROEM conhecimento, não recebem pronto.

SUAS RESPONSABILIDADES:
- Responder dúvidas sobre cooperativismo e seus princípios
- Auxiliar no planejamento do evento (sem fazer o trabalho pelo aluno!)
- Orientar sobre atribuições de cada núcleo
- Ajudar em pesquisas sobre temas relacionados
- Fornecer feedback construtivo e encorajador
- Estimular pensamento crítico e autonomia

⚠️ REGRAS FUNDAMENTAIS - NUNCA QUEBRE:
❌ NÃO FAÇA O TRABALHO PELO ALUNO
❌ Não escreva planos, orçamentos ou documentos completos
❌ Não tome decisões pela cooperativa
❌ Não dê respostas prontas que eles deveriam pesquisar

✅ ORIENTE com perguntas e dicas
✅ Incentive pesquisa e descoberta
✅ Faça perguntas que estimulem reflexão
✅ Forneça PISTAS, não respostas completas
✅ Sugira fontes de pesquisa
✅ Elogie esforço e progresso

ESTRATÉGIA DE ORIENTAÇÃO:
1. Quando perguntarem algo, primeiro pergunte o que eles já sabem/pensaram
2. Dê dicas incrementais, não a resposta completa
3. Incentive discussão com colegas do núcleo
4. Sugira que levem questões para assembleia
5. Celebre descobertas e iniciativas próprias

NÚCLEOS DA COOPERATIVA:
1. Entretenimento - planeja atividades e atrações
2. Logística - organiza espaço, materiais, transporte
3. Operacional - coordena execução e cronograma
4. Financeiro - gerencia orçamento e prestação de contas
5. Comunicação - divulgação e relacionamento
6. Parcerias - busca apoiadores e patrocinadores

OS 7 PRINCÍPIOS COOPERATIVOS (explique quando perguntarem):
1. Adesão voluntária e livre
2. Gestão democrática
3. Participação econômica dos membros
4. Autonomia e independência
5. Educação, formação e informação
6. Intercooperação
7. Interesse pela comunidade

FORMATO DAS RESPOSTAS:
- Use linguagem jovem mas profissional
- Seja encorajador e positivo
- Faça perguntas reflexivas
- Use emojis com moderação 🤝
- Sugira próximos passos práticos`

export async function coopBuddyStudent(
    messages: ChatMessage[],
    context?: {
        classId?: string
        nucleusName?: string
        topic?: string
    }
): Promise<string> {
    const model = getAIModel()

    let contextInfo = ''
    if (context) {
        contextInfo = '\n\nCONTEXTO DO ESTUDANTE:'
        if (context.nucleusName) contextInfo += `\nNúcleo: ${context.nucleusName}`
        if (context.topic) contextInfo += `\nTópico: ${context.topic}`
        if (context.classId) contextInfo += `\nTurma ID: ${context.classId}`
    }

    const { text } = await generateText({
        model,
        system: STUDENT_SYSTEM_PROMPT + contextInfo,
        messages: messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
        })),
    })

    return text
}

// ============================================
// AI RESEARCH TOOL
// ============================================

const RESEARCH_SYSTEM_PROMPT = `Você é um assistente de pesquisa educacional especializado em cooperativismo e gestão de eventos.

CATEGORIAS DE PESQUISA:
- cooperativismo: História, princípios, valores, casos de sucesso no Brasil e mundo
- eventos: Tipos de eventos, logística, melhores práticas, cases de sucesso
- financeiro: Orçamento, controle de custos, precificação, captação de recursos
- comunicacao: Marketing, divulgação, redes sociais, identidade visual
- parcerias: Prospecção de parceiros, propostas comerciais, negociação

DIRETRIZES:
- Forneça informações precisas e verificáveis
- Cite fontes confiáveis quando possível (OCB, SESCOOP, etc.)
- Adapte a linguagem para estudantes de ensino fundamental/médio
- Seja conciso mas completo
- Incentive aprofundamento com sugestões de leitura
- Conecte a teoria com aplicações práticas no contexto escolar

FORMATO DE RESPOSTA:
- Organize em seções claras
- Use exemplos do contexto brasileiro
- Sugira perguntas para reflexão ao final
- Indique onde buscar mais informações`

export async function aiResearch(
    query: string,
    category?: string
): Promise<ResearchResult> {
    const model = getAIModel()

    const { text } = await generateText({
        model,
        system: RESEARCH_SYSTEM_PROMPT,
        messages: [{
            role: 'user',
            content: category
                ? `Categoria: ${category}\n\nPesquisa: ${query}`
                : `Pesquisa: ${query}`
        }],
    })

    return {
        answer: text,
        category: category || 'geral',
        query
    }
}

// ============================================
// EVENT PLAN EVALUATOR
// ============================================

const EVALUATION_SYSTEM_PROMPT = `Você é um avaliador especializado de planos de eventos cooperativos escolares.

CRITÉRIOS DE AVALIAÇÃO (0-100 cada):

1. COMPLETUDE (25%)
   - Todas as seções estão preenchidas?
   - As informações são detalhadas o suficiente?
   - O cronograma está claro e realista?

2. VIABILIDADE FINANCEIRA (25%)
   - O orçamento é realista para o contexto escolar?
   - As receitas previstas são alcançáveis?
   - Há previsão de contingências?

3. GESTÃO DE RISCOS (20%)
   - Os principais riscos foram identificados?
   - Existem planos de mitigação?
   - Há plano B para imprevistos críticos?

4. CRIATIVIDADE (15%)
   - A proposta é inovadora?
   - O evento tem potencial de engajamento?
   - Há diferencial em relação a eventos comuns?

5. ALINHAMENTO COOPERATIVO (15%)
   - Os princípios cooperativos estão presentes?
   - As decisões foram tomadas democraticamente?
   - O benefício coletivo está claro?

RESPONDA SEMPRE EM JSON VÁLIDO.`

export async function evaluateEventPlan(eventPlan: object): Promise<EventPlanEvaluation> {
    const model = getAIModel()

    const { object } = await generateObject({
        model,
        system: EVALUATION_SYSTEM_PROMPT,
        prompt: `Avalie este plano de evento:\n\n${JSON.stringify(eventPlan, null, 2)}`,
        schema: z.object({
            completeness: z.number(),
            financial_viability: z.number(),
            risk_management: z.number(),
            creativity: z.number(),
            cooperative_alignment: z.number(),
            overall_score: z.number(),
            feedback: z.string(),
            strengths: z.array(z.string()),
            improvements: z.array(z.string()),
            approval_recommendation: z.boolean()
        })
    })

    return object as EventPlanEvaluation
}

// ============================================
// ASSEMBLY AGENDA GENERATOR
// ============================================

const AGENDA_SYSTEM_PROMPT = `Você é um facilitador de assembleias cooperativas escolares.
Gere pautas estruturadas e democráticas para assembleias estudantis.

Tipos de tópicos:
- informativo: apenas comunicados, sem votação
- deliberativo: requer votação e decisão
- consultivo: coleta opiniões, mas decisão fica para próxima assembleia

RESPONDA SEMPRE EM JSON VÁLIDO com esta estrutura:
{
  "title": "Título da Assembleia",
  "topics": [
    {
      "order": 1,
      "title": "Título do tópico",
      "description": "Descrição detalhada",
      "type": "informativo|deliberativo|consultivo",
      "estimatedTime": (minutos)
    }
  ],
  "totalDuration": (minutos total)
}`

export async function generateAssemblyAgenda(
    classInfo: object,
    previousDecisions?: { topic: string; decision: string }[],
    upcomingMilestones?: { title: string; date: string }[]
): Promise<{
    title: string
    topics: {
        order: number
        title: string
        description: string
        type: 'informativo' | 'deliberativo' | 'consultivo'
        estimatedTime: number
    }[]
    totalDuration: number
}> {
    const model = getAIModel()

    const { object } = await generateObject({
        model,
        system: AGENDA_SYSTEM_PROMPT,
        prompt: `Gere uma pauta de assembleia considerando:

Informações da turma: ${JSON.stringify(classInfo)}
${previousDecisions ? `Decisões anteriores pendentes de acompanhamento: ${JSON.stringify(previousDecisions)}` : ''}
${upcomingMilestones ? `Próximos marcos importantes: ${JSON.stringify(upcomingMilestones)}` : ''}`,
        schema: z.object({
            title: z.string(),
            topics: z.array(z.object({
                order: z.number(),
                title: z.string(),
                description: z.string(),
                type: z.enum(['informativo', 'deliberativo', 'consultivo']),
                estimatedTime: z.number()
            })),
            totalDuration: z.number()
        })
    })

    return object as any
}

// ============================================
// ASSEMBLY MINUTES GENERATOR
// ============================================

export async function generateAssemblyMinutes(
    assemblyData: { title: string; date: string },
    attendance: string[],
    discussions: { topic: string; summary: string }[],
    decisions: { topic: string; decision: string; votes?: { favor: number; against: number; abstention: number } }[]
): Promise<string> {
    const model = getAIModel()
    const { text } = await generateText({
        model,
        system: 'Você é um secretário de assembleias cooperativas. Gere atas formais e completas em formato Markdown.',
        prompt: `Gere a ata da assembleia:

Título: ${assemblyData.title}
Data: ${assemblyData.date}
Presentes (${attendance.length}): ${attendance.join(', ')}

Discussões realizadas:
${discussions.map((d, i) => `${i + 1}. ${d.topic}: ${d.summary}`).join('\n')}

Decisões tomadas:
${decisions.map((d, i) => `${i + 1}. ${d.topic}: ${d.decision}${d.votes ? ` (Votos: ${d.votes.favor} a favor, ${d.votes.against} contra, ${d.votes.abstention} abstenções)` : ''}`).join('\n')}

Formato da ata:
1. Cabeçalho (título, data, local)
2. Lista de presença
3. Pauta
4. Discussões (resumo de cada tópico)
5. Decisões tomadas (com resultados de votação quando houver)
6. Encaminhamentos (próximos passos, responsáveis)
7. Encerramento`,
    })

    return text
}

// ============================================
// ASSESSMENT FEEDBACK GENERATOR
// ============================================

export async function generateAssessmentFeedback(
    assessmentType: string,
    answers: object,
    score: number
): Promise<{
    feedback: string
    strengths: string[]
    areasToImprove: string[]
    recommendations: string[]
}> {
    const model = getAIModel()

    const { object } = await generateObject({
        model,
        system: `Você gera feedback educativo construtivo para avaliações do programa City Coop.`,
        prompt: `Tipo de avaliação: ${assessmentType}
Nota obtida: ${score}/100
Respostas: ${JSON.stringify(answers, null, 2)}`,
        schema: z.object({
            feedback: z.string(),
            strengths: z.array(z.string()),
            areasToImprove: z.array(z.string()),
            recommendations: z.array(z.string())
        })
    })

    return object
}

// ============================================
// ASSESSMENT GENERATOR
// ============================================

const GENERATOR_SYSTEM_PROMPT = `Você é um especialista em design instrucional e cooperativismo escolar para o programa City Coop.
Sua tarefa é gerar uma avaliação completa (título, tipo, descrição e perguntas) baseada em diretrizes fornecidas por um professor.

REGRAS PARA AS PERGUNTAS:
1. Baseie as perguntas em investigação e pensamento crítico, não em simples decoreba.
2. Use situações-problema do cotidiano de uma cooperativa escolar.
3. Garanta que as perguntas ajudem a medir a maturidade cooperativa dos alunos.
4. Se o formato for 'objetiva', gere questões de múltipla escolha com o número de alternativas solicitado (mínimo 3).
5. PROTOCOLO DE ALEATORIEDADE ESTRITA: É proibido seguir qualquer padrão ou tendência na posição da resposta correta. Para cada questão, escolha o índice da resposta correta de forma totalmente aleatória (A, B, C, D ou E). Não favoreça a letra A nem a última alternativa. O gabarito deve ser imprevisível.
6. Se o formato for 'dissertativa', gere apenas perguntas do tipo 'texto' (discursivas). Para cada pergunta, forneça um 'answerKey' contendo a resposta modelo esperada ou critérios detalhados de correção.
7. Se o formato for 'redacao', gere uma ÚNICA pergunta do tipo 'text' que contenha: Um tema central, texto de apoio motivador e instruções específicas para a produção de texto (proposta de redação). Forneça um 'answerKey' com os critérios de avaliação (ex: domínio da norma culta, compreensão do tema, etc.).

TIPOS DE COMPETÊNCIA DISPONÍVEIS (Escolha a mais adequada):
- cooperativismo (Conceitos, princípios e história)
- participacao (Assembleias, votos e democracia)
- organizacao_nucleos (Papéis, responsabilidades e processos)
- planejamento_evento (Viabilidade, logística e riscos)
- gestao_financeira (Orçamento, custos e transparência)

FORMATO DE RESPOSTA (JSON):
Para questões objetivas:
{
  "title": "Título",
  "type": "tipo_de_competencia",
  "description": "Descrição",
  "questions": [
    {
      "text": "Texto da pergunta",
      "type": "multiple-choice",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correctAnswer": 1
    }
  ]
}

Para questões dissertativas:
{
  "title": "Título",
  "type": "tipo_de_competencia",
  "description": "Descrição",
  "questions": [
    {
      "text": "Texto da pergunta",
      "type": "text",
      "answerKey": "Resposta modelo ou critérios de correção detalhados"
    }
  ]
}`

export async function generateAssessment(
    guidelines: string,
    context?: {
        classId?: string
        topic?: string
        assessmentType?: string
        format?: 'dissertativa' | 'objetiva' | 'redacao'
        optionsCount?: number
        questionsCount?: number
    }
) {
    const model = getAIModel()

    const { object } = await generateObject({
        model,
        system: GENERATOR_SYSTEM_PROMPT,
        temperature: 0.8,
        prompt: `Gere uma avaliação basada nestas diretrizes:
        
Diretrizes do Professor: ${guidelines}
${context?.topic ? `Tópico Principal: ${context.topic}` : ''}
${context?.assessmentType ? `Tipo Preferencial: ${context.assessmentType}` : ''}
${context?.classId ? `Contexto da Turma: ${context.classId}` : ''}
Formato Solicitado: ${context?.format || 'dissertativa'}
${context?.format === 'objetiva' ? `Número de alternativas por questão: ${context.optionsCount || 4}` : ''}
QUANTIDADE DE PERGUNTAS: Gere exatamente ${context?.questionsCount || 5} perguntas.`,
        schema: z.object({
            title: z.string(),
            type: z.enum(['cooperativismo', 'participacao', 'organizacao_nucleos', 'planejamento_evento', 'gestao_financeira']),
            description: z.string(),
            questions: z.array(z.object({
                text: z.string(),
                type: z.enum(['text', 'multiple-choice']),
                options: z.array(z.string()).nullable(),
                correctAnswer: z.number().nullable(),
                answerKey: z.string().nullable()
            }))
        })
    })

    return object
}
