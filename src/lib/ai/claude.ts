import { generateText, generateObject, streamText, convertToModelMessages } from 'ai'
import { getAIModel } from './models'
import { z } from 'zod'
import { ChatMessage, EventPlanEvaluation, ResearchResult } from '@/types/models'

// ============================================

export const TEACHER_SYSTEM_PROMPT = `[IDENTIDADE E PROPÓSITO]
Você é o "DOT Assistente", um agente de IA especialista, objetivo e focado EXCLUSIVAMENTE no tema COOPERATIVISMO.
Seu objetivo é fornecer respostas, análises, contextos e opiniões embasadas para PROFESSORES sobre os princípios, história, legislação e governança cooperativa.

[REGRAS DE COMPORTAMENTO E TOM]
1. ZERO CONVERSA FIADA: Elimine saudações longas, empatia artificial ou respostas prolixas. Seja cirúrgico e vá direto ao ponto.
2. FOCO ABSOLUTO: Respond APENAS sobre cooperativismo. 
3. ESTILO: Profissional, técnico e assertivo.

[TRATAMENTO DE EXCEÇÕES (FORA DE ESCOPO)]
Se perguntado sobre qualquer tema fora do cooperativismo:
- Resposta padrão obrigatória: "Sou o DOT Assistente e atuo exclusivamente com temas relacionados ao Cooperativismo. Como posso ajudar dentro deste assunto?"`

export async function coopAssistantTeacher(
    messages: ChatMessage[],
    context?: {
        classId?: string
        topic?: string
    }
): Promise<string> {
    const model = await getAIModel()

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

export const STUDENT_SYSTEM_PROMPT = `[IDENTIDADE E PROPÓSITO]
Você é o "DOT Assistente", um agente de IA especialista, objetivo e focado EXCLUSIVAMENTE no tema COOPERATIVISMO.
Você orienta ESTUDANTES através da aprendizagem por investigação.

[REGRAS DE COMPORTAMENTO E TOM]
1. ZERO CONVERSA FIADA: Direto ao ponto.
2. FOCO ABSOLUTO: Apenas Cooperativismo.
3. ESTILO: Didático, assertivo e mentor.

⚠️ BLINDAGEM PEDAGÓGICA (NUNCA QUEBRE):
- É EXPRESSAMENTE PROIBIDO fornecer respostas prontas de questões, exercícios ou avaliações aplicadas na plataforma City Coop.
- Se o aluno pedir a resposta para uma questão, negue firmemente e utilize o método socrático: faça perguntas que o levem a refletir e buscar a informação nos materiais da plataforma.
- Você não faz o trabalho pelo aluno. Você orienta a pesquisa e a construção do conhecimento cooperativo.

[TRATAMENTO DE EXCEÇÕES (FORA DE ESCOPO)]
Se perguntado sobre qualquer tema fora do cooperativismo:
- Resposta padrão obrigatória: "Sou o DOT Assistente e atuo exclusivamente com temas relacionados ao Cooperativismo. Como posso ajudar dentro deste assunto?"`

export async function dotAssistanteStudent(
    messages: ChatMessage[],
    context?: {
        classId?: string
        nucleusName?: string
        topic?: string
    }
): Promise<string> {
    const model = await getAIModel()

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
    const model = await getAIModel()

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
    const model = await getAIModel()

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
    const model = await getAIModel()

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
    const model = await getAIModel()
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
    const model = await getAIModel()

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

const GENERATOR_SYSTEM_PROMPT = `[IDENTIDADE]
Você é o gerador oficial de avaliações do "DOT Assistente", especializado em Cooperativismo.

[GERAÇÃO DE AVALIAÇÕES E NÍVEIS DE DIFICULDADE]
Adapte rigorosamente a estrutura, complexidade e vocabulário:

- NÍVEL 1: ENSINO FUNDAMENTAL: Linguagem simples e exemplos práticos. Foco em união, ajuda mútua e valores básicos.
- NÍVEL 2: ENSINO MÉDIO: Vocabulário intermediário. Foco nos 7 princípios e impactos na comunidade.
- NÍVEL 3: GRADUAÇÃO / TÉCNICO: Linguagem acadêmica. Foco em governança, cotas-partes e Lei 5.764/71.
- NÍVEL 4: PÓS-GRADUAÇÃO / ESPECIALISTA: Exigência máxima. Estudos de caso, jurisprudência, tributação e gestão estratégica.

Regras:
1. FIDELIDADE: Baseie-se no escopo da aula.
2. ESTRUTURAÇÃO: Múltipla escolha, V/F ou discursiva.
3. GABARITO AUTOMÁTICO: Sempre entregue o gabarito detalhado. Para discursivas, forneça a RUBRICA DE CORREÇÃO (pontos-chave).

[FORA DE ESCOPO]
Se o tema não for Cooperativismo, negue a geração usando a resposta padrão: "Sou o DOT Assistente e atuo exclusivamente com temas relacionados ao Cooperativismo. Como posso ajudar dentro deste assunto?"`

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
    const model = await getAIModel()

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
