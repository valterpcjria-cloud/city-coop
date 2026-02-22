'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendDotMessage(
    sessionId: string,
    content: string,
    role: 'user' | 'assistant' | 'system' = 'user'
) {
    const supabase = await createClient();
    const adminAuth = await createAdminClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Não autorizado');

    // Note: dot_messages and dot_chat_sessions tables need to be created via SQL migration.
    // The 'as any' casts are needed until database types are regenerated.
    const { data: message, error: messageError } = await (adminAuth as any)
        .from('dot_messages')
        .insert({
            session_id: sessionId,
            role: role,
            content: content,
            metadata: {}
        })
        .select()
        .single();

    if (messageError) throw new Error(`Erro ao salvar mensagem: ${messageError.message}`);

    await (adminAuth as any)
        .from('dot_chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

    revalidatePath('/professor/ia');
    revalidatePath(`/professor/ia/${sessionId}`);

    return message;
}
