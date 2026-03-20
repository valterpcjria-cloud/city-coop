import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { rewardSchool } from '@/lib/coopcoins/services';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: quizId } = await params;
  const { answers, timeTaken } = await request.json();

  // Busca o aluno
  const { data: student } = await (supabase.from('students') as any)
    .select('id').eq('user_id', user.id).single();
  if (!student) return NextResponse.json({ error: 'Aluno nao encontrado' }, { status: 404 });

  // Verifica se ja respondeu
  const { data: existing } = await (supabase.from('quiz_responses') as any)
    .select('id').eq('quiz_id', quizId).eq('student_id', student.id).maybeSingle();
  if (existing) return NextResponse.json({ error: 'Quiz ja respondido' }, { status: 400 });

  // Busca questoes para corrigir
  const { data: questions } = await (supabase.from('quiz_questions') as any)
    .select('*').eq('quiz_id', quizId).order('order_num');

  // Calcula score
  let acertos = 0;
  questions.forEach((q: any) => {
    if (answers[q.id] === q.correct) acertos++;
  });
  const score = Math.round((acertos / questions.length) * 100);
  const perfect = score === 100;

  // Salva resposta
  const { error: responseError } = await (supabase.from('quiz_responses') as any)
    .insert({
      quiz_id: quizId,
      student_id: student.id,
      answers,
      score,
      time_taken: timeTaken || null,
      coopcoins_awarded: true,
    });
  if (responseError) return NextResponse.json({ error: responseError.message }, { status: 500 });

  // Credita COOPCOINS
  const ccBase = 20;
  const ccBonus = perfect ? 5 : 0;
  const ccTotal = ccBase + ccBonus;

  const { data: quiz } = await (supabase.from('quizzes') as any)
    .select('title').eq('id', quizId).single();

  await rewardSchool(
    student.id,
    ccTotal,
    `Quiz: ${quiz?.title}${perfect ? ' (100% de acertos!)' : ''}`,
    'quiz'
  );

  return NextResponse.json({
    success: true,
    score,
    acertos,
    total: questions.length,
    coopcoins: ccTotal,
    perfect,
  });
}
