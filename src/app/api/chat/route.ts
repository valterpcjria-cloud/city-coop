import { createClient } from '@/lib/supabase/server'
import { Anthropic } from '@anthropic-ai/sdk'
import { StreamingTextResponse, AnthropicStream } from 'ai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Check for API Key
        if (!process.env.ANTHROPIC_API_KEY) {
            return new Response('Missing API Key', { status: 500 })
        }

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        })

        // Ask Claude
        const response = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1024,
            messages: messages.map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            })),
            system: "Você é o Coop Buddy, um assistente especializado em cooperativismo escolar. Ajudê os alunos a entenderem conceitos como democracia, intercooperação, e a organizar seus núcleos (Financeiro, Logística, Marketing, etc). Seja encorajador, didático e breve."
        })

        // Convert to stream
        // Note: Anthropic SDK + AI SDK stream handling varies.
        // Since 'response' above is non-streaming unless we use .stream(), let's fix.

        const stream = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1024,
            stream: true,
            messages: messages.map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            })),
            system: "Você é o Coop Buddy, um assistente especializado em cooperativismo escolar. Ajudê os alunos a entenderem conceitos como democracia, intercooperação, e a organizar seus núcleos (Financeiro, Logística, Marketing, etc). Seja encorajador, didático e breve."
        });

        const aiStream = AnthropicStream(stream);
        return new StreamingTextResponse(aiStream);

    } catch (error: any) {
        console.error(error)
        return new Response(error.message, { status: 500 })
    }
}
