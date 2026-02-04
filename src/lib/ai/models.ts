import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'

export function getAIModel() {
    const hasAnthropic = process.env.ANTHROPIC_API_KEY &&
        process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key'

    const hasOpenAI = process.env.OPENAI_API_KEY &&
        process.env.OPENAI_API_KEY !== 'your_openai_api_key'

    if (hasOpenAI) {
        console.log('[DEBUG-TRACE:V3] Using OpenAI gpt-4o')
        return openai('gpt-4o')
    }

    if (hasAnthropic) {
        console.log('Using Anthropic Claude 3.5 Sonnet')
        return anthropic('claude-3-5-sonnet-20240620')
    }

    // Fallback or error
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
        console.log('Fallback: Using OpenAI')
        return openai('gpt-4o')
    }

    throw new Error('Nenhuma chave de API de IA configurada (.env)')
}
