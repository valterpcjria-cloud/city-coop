import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { getAIModel } from '@/lib/ai/models';
import { z } from 'zod';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { tema, numQuestoes = 5, tipo = 'both' } = await request.json();
  if (!tema) return NextResponse.json({ error: 'Tema e obrigatorio' }, { status: 400 });

  try {
    const model = await getAIModel();
    const { object } = await generateObject({
      model,
      prompt: `Crie um quiz educativo sobre cooperativismo com o tema: "${tema}".
      Gere exatamente ${numQuestoes} questoes.
      IMPORTANTE: Para questoes de multipla escolha, sempre inclua exatamente 4 opcoes no campo "options".
      Para questoes de verdadeiro/falso, deixe "options" como array vazio [] e use "true" ou "false" no campo "correct".
      As questoes devem ser educativas e adequadas para jovens estudantes.`,
      schema: z.object({
        title: z.string(),
        description: z.string(),
        questions: z.array(z.object({
          type: z.enum(['multiple_choice', 'true_false']),
          question: z.string(),
          options: z.array(z.string()),
          correct: z.string(),
        }))
      })
    });
    return NextResponse.json({ success: true, quiz: object });
  } catch (error: any) {
    console.error('AI quiz generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
