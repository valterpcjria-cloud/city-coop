import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { getAIKeys } from './config'

export async function getAIModel() {
    const keys = await getAIKeys()

    const hasAnthropic = keys.anthropic && keys.anthropic !== 'your_anthropic_api_key'
    const hasOpenAI = keys.openai && keys.openai !== 'your_openai_api_key'

    if (hasOpenAI) {
        console.log('[DEBUG-TRACE:V3] Using OpenAI gpt-4o (Dynamic Key)')
        const openai = createOpenAI({ apiKey: keys.openai })
        return openai('gpt-4o')
    }

    if (hasAnthropic) {
        console.log('Using Anthropic Claude 3.5 Sonnet (Dynamic Key)')
        const anthropic = createAnthropic({ apiKey: keys.anthropic })
        return anthropic('claude-3-5-sonnet-20240620')
    }

    throw new Error('Nenhuma chave de API de IA configurada (Configurações ou .env)')
}
