'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { dotAssistanteStudent } from '@/lib/ai/claude';

export async function sendDotMessage(
    sessionId: string,
    content: string,
    role: 'user' | 'assistant' | 'system' = 'user',
    studentContext?: {
        scores: { conhecimento: number; engajamento: number; colaboracao: number };
        xp: number;
        level: number;
        nextMission?: string;
    }
) {
    const supabase = await createClient();
    const adminAuth = await createAdminClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Não autorizado');

    // 1. Save the user message or system injection
    const { data: message, error: messageError } = await (adminAuth as any)
        .from('dot_messages')
        .insert({
            session_id: sessionId,
            role: role,
            content: content,
            metadata: studentContext || {}
        })
        .select()
        .single();

    if (messageError) throw new Error(`Erro ao salvar mensagem: ${messageError.message}`);

    // Update session timestamp
    await (adminAuth as any)
        .from('dot_chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

    // 2. If it's a student context, trigger the AI response automatically
    if (role === 'user' && studentContext) {
        try {
            // Get last 10 messages for context
            const { data: history } = await (adminAuth as any)
                .from('dot_messages')
                .select('role, content')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: false })
                .limit(10);

            const messages = (history || []).reverse();

            // Refined Coach Prompt
            const coachPrompt = `Você agora é o DOT COACH COOPERATIVISTA. 
Seu objetivo é ser um mentor motivador para o estudante.
STATUS ATUAL DO ALUNO:
- Nível: ${studentContext.level} (XP: ${studentContext.xp})
- Conhecimento: ${studentContext.scores.conhecimento}/100
- Engajamento: ${studentContext.scores.engajamento}/100
- Colaboração: ${studentContext.scores.colaboracao}/100
${studentContext.nextMission ? `- Próxima Missão: ${studentContext.nextMission}` : ''}

DIRETRIZES COACH:
1. Sempre relacione suas dicas ao status atual. Se Colaboração estiver baixa, sugira participar mais das assembleias.
2. Seja encorajador mas focado em resultados reais do cooperativismo.
3. Se o aluno perguntar algo genérico, puxe sempre para "Como isso ajuda seu núcleo cooperativo?".
4. Mantenha a blindagem pedagógica: nunca dê respostas prontas de avaliações.`;

            // Call AI with enhanced prompt
            const aiResponse = await dotAssistanteStudent(messages as any, {
                topic: 'Mobile Coach Strategy',
                nucleusName: 'Seu Núcleo'
            });

            // Prepend coach guidelines to the call if needed, but dotAssistanteStudent has its own prompt.
            // For now, we trust dotAssistanteStudent but we might want to override its base prompt.
            // Re-calling with custom prompt logic:
            const { generateText } = await import('ai');
            const { getAIModel } = await import('@/lib/ai/models');
            const model = await getAIModel();

            const { text } = await generateText({
                model,
                system: coachPrompt,
                messages: messages as any
            });

            // Save AI response
            await (adminAuth as any)
                .from('dot_messages')
                .insert({
                    session_id: sessionId,
                    role: 'assistant',
                    content: text,
                    metadata: { ai_generated: true }
                });

        } catch (aiErr) {
            console.error('AI Processing Error:', aiErr);
        }
    }

    revalidatePath('/professor/ia');
    revalidatePath(`/professor/ia/${sessionId}`);
    revalidatePath('/estudante/chat');

    return message;
}

