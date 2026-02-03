import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export const SYSTEM_PROMPT_COOP = `Você é um especialista em cooperativismo escolar e pedagogia. 
Sua função é auxiliar alunos e professores no desenvolvimento de uma cooperativa escolar.
Sempre responda de forma encorajadora, educativa e focado nos 7 princípios do cooperativismo.
`

export async function evaluateEventPlan(plan: any) {
    const prompt = `
    Analise o seguinte plano de evento escolar sob a ótica do cooperativismo:
    
    Título: ${plan.title}
    Descrição: ${plan.description}
    Orçamento Total: R$ ${plan.budget?.total}
    Itens do Orçamento: ${JSON.stringify(plan.budget?.items)}
    Cronograma: ${JSON.stringify(plan.timeline?.steps)}
    
    Por favor, forneça um feedback curto (máximo 3 parágrafos) avaliando:
    1. A viabilidade financeira (está realista?).
    2. O alinhamento com princípios cooperativistas.
    3. Sugestões de melhoria.
    
    Retorne apenas o texto do feedback.
    `

    const msg = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        system: SYSTEM_PROMPT_COOP,
        messages: [{ role: 'user', content: prompt }]
    });

    return msg.content[0].type === 'text' ? msg.content[0].text : '';
}
