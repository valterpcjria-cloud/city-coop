import { createClient } from '@/lib/supabase/server'
import { streamText, convertToModelMessages } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { getAIKeys } from '@/lib/ai/config'
import { TEACHER_SYSTEM_PROMPT, STUDENT_SYSTEM_PROMPT } from '@/lib/ai/claude'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const maxDuration = 30

// Function to retrieve relevant knowledge from the database
async function retrieveKnowledge(query: string, limit: number = 5): Promise<string> {
    try {
        const supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Fetch all knowledge base content
        const { data: knowledge, error } = await supabase
            .from('knowledge_base')
            .select('content, category, metadata')
            .order('created_at', { ascending: false })
            .limit(50)

        if (error || !knowledge || knowledge.length === 0) {
            return ''
        }

        // Simple keyword matching for relevance
        const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3)

        const scored = knowledge.map(item => {
            const content = item.content.toLowerCase()
            const title = (item.metadata?.title || '').toLowerCase()
            let score = 0

            for (const word of queryWords) {
                if (content.includes(word)) score += 1
                if (title.includes(word)) score += 2
            }

            return { ...item, score }
        })

        // Sort by relevance and take top results
        const relevant = scored
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)

        if (relevant.length === 0) {
            // If no keyword match, return most recent content
            return knowledge.slice(0, 3).map(item => {
                const title = item.metadata?.title || 'Documento'
                const source = item.metadata?.source_type || 'texto'
                return `[${title} (${source})]\n${item.content.substring(0, 2000)}`
            }).join('\n\n---\n\n')
        }

        // Format relevant knowledge for context
        return relevant.map(item => {
            const title = item.metadata?.title || 'Documento'
            const source = item.metadata?.source_type || 'texto'
            const url = item.metadata?.source_url || ''
            return `[${title} (Fonte: ${source}${url ? `, URL: ${url}` : ''})]\n${item.content.substring(0, 3000)}`
        }).join('\n\n---\n\n')

    } catch (error) {
        console.error('Error retrieving knowledge:', error)
        return ''
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        let { messages, conversationId, model: requestedModel, text } = body

        // ... existing robustness logic ...
        if (!messages && text) {
            messages = [{ role: 'user', content: text }]
        } else if (!messages && body.message) {
            messages = [{ role: 'user', content: body.message }]
        } else if (!messages) {
            messages = []
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const keys = await getAIKeys()

        // Determine role and select system prompt
        const { data: teacher } = await supabase
            .from('teachers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        const userType = teacher ? 'teacher' : 'student'

        // Get the last user message for knowledge retrieval
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || ''

        // Retrieve relevant knowledge from the database
        const knowledgeContext = await retrieveKnowledge(lastUserMessage)

        // Build enhanced system prompt with knowledge context
        let basePrompt = teacher ? TEACHER_SYSTEM_PROMPT : STUDENT_SYSTEM_PROMPT

        if (knowledgeContext) {
            basePrompt += `\n\n## BASE DE CONHECIMENTO DISPONÍVEL\n\nVocê tem acesso aos seguintes documentos e informações da base de conhecimento. Use estas informações para responder de forma precisa e contextualizada:\n\n${knowledgeContext}\n\n---\n\nIMPORTANTE: Use as informações acima para responder perguntas relacionadas. Cite as fontes quando apropriado.`
        }

        const aiModel = requestedModel === 'gpt'
            ? createOpenAI({ apiKey: keys.openai || process.env.OPENAI_API_KEY })('gpt-4o')
            : createAnthropic({ apiKey: keys.anthropic || process.env.ANTHROPIC_API_KEY })('claude-3-5-sonnet-20240620')

        const result = streamText({
            model: aiModel as any,
            messages: await convertToModelMessages(messages),
            system: basePrompt,
            onFinish: async (event) => {
                try {
                    console.log(`Chat finished: ${event.text.substring(0, 30)}...`)
                    // Persistent save to Supabase
                    const allMessages = [
                        ...messages,
                        { role: 'assistant', content: event.text }
                    ]

                    // Determine which ID to use
                    let targetId = conversationId && conversationId !== 'new' ? conversationId : null

                    if (!targetId && conversationId !== 'new') {
                        const { data: latest, error: fetchError } = await (supabase as any)
                            .from('ai_conversations')
                            .select('id')
                            .eq('user_id', user.id)
                            .eq('user_type', userType)
                            .order('updated_at', { ascending: false })
                            .limit(1)
                            .maybeSingle()

                        if (fetchError) console.error('Error fetching latest convo:', fetchError)
                        if (latest) targetId = latest.id
                    }

                    if (targetId) {
                        const { error: updateError } = await (supabase as any)
                            .from('ai_conversations')
                            .update({
                                messages: allMessages,
                                updated_at: new Date().toISOString()
                            } as any)
                            .eq('id', targetId)

                        if (updateError) console.error('Error updating chat history:', updateError)
                        else console.log(`Chat history updated for ${targetId}`)
                    } else {
                        // Create new conversation
                        const { error: insertError } = await (supabase as any)
                            .from('ai_conversations')
                            .insert({
                                user_id: user.id,
                                user_type: userType,
                                messages: allMessages,
                                title: messages.find((m: any) => m.role === 'user')?.content?.substring(0, 50) || 'Nova Conversa'
                            } as any)

                        if (insertError) console.error('Error creating chat history:', insertError)
                        else console.log(`New chat conversation created`)
                    }
                } catch (err) {
                    console.error('Critical failure in chat onFinish:', err)
                }
            }
        })

        return result.toUIMessageStreamResponse()

    } catch (error: any) {
        console.error('--- CHAT API ERROR ---')
        console.error('Type:', error?.constructor?.name || typeof error)
        console.error('Message:', error.message)
        if (error.status) console.error('Status:', error.status)
        if (error.data) console.error('Data:', JSON.stringify(error.data))
        console.error('--- END ERROR ---')
        return new Response(JSON.stringify({
            error: error.message || 'Internal Server Error',
            details: error.data || null
        }), {
            status: error.status || 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
