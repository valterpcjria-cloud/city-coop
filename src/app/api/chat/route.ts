import { createClient } from '@/lib/supabase/server'
import { streamText, convertToModelMessages } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { TEACHER_SYSTEM_PROMPT, STUDENT_SYSTEM_PROMPT } from '@/lib/ai/claude'

export const maxDuration = 30

export async function POST(req: Request) {
    try {
        const body = await req.json()
        let { messages, conversationId, model: requestedModel, text } = body

        // Robustness: Handle cases where sendMessage sends {text} instead of {messages}
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

        // Determine role and select system prompt
        const { data: teacher } = await supabase
            .from('teachers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        const systemPrompt = teacher ? TEACHER_SYSTEM_PROMPT : STUDENT_SYSTEM_PROMPT
        const userType = teacher ? 'teacher' : 'student'


        const aiModel = requestedModel === 'gpt'
            ? openai('gpt-4o')
            : anthropic('claude-3-5-sonnet-20240620')

        const result = streamText({
            model: aiModel as any,
            messages: await convertToModelMessages(messages),
            system: systemPrompt,
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

                    // If no ID provided and not explicitly a 'new' conversation, try to find the latest
                    if (!targetId && conversationId !== 'new') {
                        const { data: latest, error: fetchError } = await (supabase.from('ai_conversations') as any)
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
                        const { error: updateError } = await (supabase.from('ai_conversations') as any)
                            .update({
                                messages: allMessages,
                                updated_at: new Date().toISOString()
                            } as any)
                            .eq('id', targetId)

                        if (updateError) console.error('Error updating chat history:', updateError)
                        else console.log(`Chat history updated for ${targetId}`)
                    } else {
                        // Create new conversation
                        const { error: insertError } = await (supabase.from('ai_conversations') as any)
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
