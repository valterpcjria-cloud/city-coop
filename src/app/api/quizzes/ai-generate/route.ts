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

  const model = await getAIModel();

  const { object } = await generateObject({
    model,
    prompt: `Crie um quiz educativo sobre cooperativismo com o tema: "${tema}".
    Gere ${numQuestoes} questoes do tipo ${tipo === 'multiple_choice' ? 'multipla escolha' : tipo === 'true_false' ? 'verdadeiro ou falso' : 'misturado entre multipla escolha e verdadeiro/falso'}.
    Para multipla escolha: 4 alternativas, apenas 1 correta.
    Para verdadeiro/falso: resposta e "true" ou "false".
    As questoes devem ser educativas, envolventes e adequadas para jovens estudantes.`,
    schema: z.object({
      title: z.string(),
      description: z.string(),
      questions: z.array(z.object({
        type: z.enum(['multiple_choice', 'true_false']),
        question: z.string(),
        options: z.array(z.string()).optional(),
        correct: z.string(),
      }))
    })
  });

  return NextResponse.json({ success: true, quiz: object });
}
