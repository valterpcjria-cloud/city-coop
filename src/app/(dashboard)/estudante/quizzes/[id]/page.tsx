import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QuizPlayer } from '@/components/quizzes/QuizPlayer';

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: student } = await (supabase.from('students') as any)
    .select('id').eq('user_id', user.id).single();

  // Verifica se ja respondeu
  const { data: existing } = await (supabase.from('quiz_responses') as any)
    .select('id, score').eq('quiz_id', id).eq('student_id', student?.id).maybeSingle();

  if (existing) redirect('/estudante/quizzes');

  // Busca quiz e questoes
  const { data: quiz } = await (supabase.from('quizzes') as any)
    .select('*').eq('id', id).single();

  const { data: questions } = await (supabase.from('quiz_questions') as any)
    .select('*').eq('quiz_id', id).order('order_num');

  if (!quiz || !questions) redirect('/estudante/quizzes');

  return <QuizPlayer quiz={quiz} questions={questions} />;
}
