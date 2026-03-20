import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET — lista quizzes da turma do aluno ou professor
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Tenta buscar como aluno
  const { data: student } = await (supabase.from('students') as any)
    .select('class_id').eq('user_id', user.id).maybeSingle();

  // Tenta buscar como professor
  const { data: teacher } = await (supabase.from('teachers') as any)
    .select('id').eq('user_id', user.id).maybeSingle();

  let query = (supabase.from('quizzes') as any).select('*').order('created_at', { ascending: false });

  if (student?.class_id) {
    query = query.eq('class_id', student.class_id).eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ quizzes: data });
}

// POST — professor cria quiz
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, class_id, questions, mode, timer_seconds } = await request.json();

  if (!title || !class_id || !questions?.length) {
    return NextResponse.json({ error: 'Campos obrigatorios: title, class_id, questions' }, { status: 400 });
  }

  const supabaseAdmin = await createClient();

  // Cria o quiz
  const { data: quiz, error: quizError } = await (supabaseAdmin.from('quizzes') as any)
    .insert({ title, description, class_id, created_by: user.id, mode: mode || 'solo', timer_seconds: timer_seconds || 30 })
    .select().single();

  if (quizError) return NextResponse.json({ error: quizError.message }, { status: 500 });

  // Cria as questoes
  const questionsWithQuizId = questions.map((q: any, index: number) => ({
    quiz_id: quiz.id,
    type: q.type,
    question: q.question,
    options: q.options || null,
    correct: q.correct,
    order_num: index + 1,
  }));

  const { error: questionsError } = await (supabaseAdmin.from('quiz_questions') as any)
    .insert(questionsWithQuizId);

  if (questionsError) return NextResponse.json({ error: questionsError.message }, { status: 500 });

  return NextResponse.json({ success: true, quiz });
}
