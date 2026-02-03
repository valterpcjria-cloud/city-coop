// ===========================================
// Claude AI Integration - City Coop Platform
// ===========================================

import Anthropic from '@anthropic-ai/sdk'
import { ChatMessage, EventPlanEvaluation, ResearchResult } from '@/types/models'

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
})

// ============================================
// COOP ASSISTANT - For Teachers
// ============================================

const TEACHER_SYSTEM_PROMPT = `Você é o Coop Assistant, assistente IA do programa City Coop.

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
    const formattedMessages = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
    }))

    const contextInfo = context
        ? `\n\nCONTEXTO ATUAL:\n${context.topic ? `Tópico: ${context.topic}` : ''}${context.classId ? `\nTurma ID: ${context.classId}` : ''}`
        : ''

    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: TEACHER_SYSTEM_PROMPT + contextInfo,
        messages: formattedMessages,
    })

    const textContent = response.content.find(block => block.type === 'text')
    return textContent?.type === 'text' ? textContent.text : ''
}

// ============================================
// COOP BUDDY - For Students
// ============================================

const STUDENT_SYSTEM_PROMPT = `Você é o Coop Buddy, assistente IA para estudantes do programa City Coop.

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
    const formattedMessages = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
    }))

    let contextInfo = ''
    if (context) {
        contextInfo = '\n\nCONTEXTO DO ESTUDANTE:'
        if (context.nucleusName) contextInfo += `\nNúcleo: ${context.nucleusName}`
        if (context.topic) contextInfo += `\nTópico: ${context.topic}`
        if (context.classId) contextInfo += `\nTurma ID: ${context.classId}`
    }

    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: STUDENT_SYSTEM_PROMPT + contextInfo,
        messages: formattedMessages,
    })

    const textContent = response.content.find(block => block.type === 'text')
    return textContent?.type === 'text' ? textContent.text : ''
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
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: RESEARCH_SYSTEM_PROMPT,
        messages: [{
            role: 'user',
            content: category
                ? `Categoria: ${category}\n\nPesquisa: ${query}`
                : `Pesquisa: ${query}`
        }],
    })

    const textContent = response.content.find(block => block.type === 'text')
    const answer = textContent?.type === 'text' ? textContent.text : ''

    return {
        answer,
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

RESPONDA SEMPRE EM JSON VÁLIDO com esta estrutura exata:
{
  "completeness": (número de 0 a 100),
  "financial_viability": (número de 0 a 100),
  "risk_management": (número de 0 a 100),
  "creativity": (número de 0 a 100),
  "cooperative_alignment": (número de 0 a 100),
  "overall_score": (número de 0 a 100),
  "feedback": "(texto explicativo geral)",
  "strengths": ["ponto forte 1", "ponto forte 2"],
  "improvements": ["sugestão de melhoria 1", "sugestão de melhoria 2"],
  "approval_recommendation": (true ou false)
}`

export async function evaluateEventPlan(eventPlan: object): Promise<EventPlanEvaluation> {
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: EVALUATION_SYSTEM_PROMPT,
        messages: [{
            role: 'user',
            content: `Avalie este plano de evento:\n\n${JSON.stringify(eventPlan, null, 2)}`
        }],
    })

    const textContent = response.content.find(block => block.type === 'text')
    const text = textContent?.type === 'text' ? textContent.text : '{}'

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
        throw new Error('Failed to parse AI evaluation response')
    }

    return JSON.parse(jsonMatch[0]) as EventPlanEvaluation
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
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: AGENDA_SYSTEM_PROMPT,
        messages: [{
            role: 'user',
            content: `Gere uma pauta de assembleia considerando:

Informações da turma: ${JSON.stringify(classInfo)}
${previousDecisions ? `Decisões anteriores pendentes de acompanhamento: ${JSON.stringify(previousDecisions)}` : ''}
${upcomingMilestones ? `Próximos marcos importantes: ${JSON.stringify(upcomingMilestones)}` : ''}`
        }],
    })

    const textContent = response.content.find(block => block.type === 'text')
    const text = textContent?.type === 'text' ? textContent.text : '{}'

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
        throw new Error('Failed to parse agenda response')
    }

    return JSON.parse(jsonMatch[0])
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
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: 'Você é um secretário de assembleias cooperativas. Gere atas formais e completas em formato Markdown.',
        messages: [{
            role: 'user',
            content: `Gere a ata da assembleia:

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
7. Encerramento`
        }],
    })

    const textContent = response.content.find(block => block.type === 'text')
    return textContent?.type === 'text' ? textContent.text : ''
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
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: `Você gera feedback educativo construtivo para avaliações do programa City Coop.
    
RESPONDA EM JSON:
{
  "feedback": "Texto geral de feedback",
  "strengths": ["ponto forte 1", "ponto forte 2"],
  "areasToImprove": ["área a melhorar 1", "área a melhorar 2"],
  "recommendations": ["recomendação 1", "recomendação 2"]
}`,
        messages: [{
            role: 'user',
            content: `Tipo de avaliação: ${assessmentType}
Nota obtida: ${score}/100
Respostas: ${JSON.stringify(answers, null, 2)}`
        }],
    })

    const textContent = response.content.find(block => block.type === 'text')
    const text = textContent?.type === 'text' ? textContent.text : '{}'

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
        return {
            feedback: 'Continue se esforçando e buscando aprender mais sobre cooperativismo!',
            strengths: [],
            areasToImprove: [],
            recommendations: []
        }
    }

    return JSON.parse(jsonMatch[0])
}
