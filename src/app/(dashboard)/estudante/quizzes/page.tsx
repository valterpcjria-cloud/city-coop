import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function QuizzesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let quizzes: any[] = [];

  if (user) {
    try {
      const { data: student } = await (supabase.from('students') as any)
        .select('id, class_id').eq('user_id', user.id).single();

      if (student?.class_id) {
        const { data } = await (supabase.from('quizzes') as any)
          .select('*, quiz_questions(count), quiz_responses(id)')
          .eq('class_id', student.class_id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        // Verifica quais ja foram respondidos
        const { data: responses } = await (supabase.from('quiz_responses') as any)
          .select('quiz_id').eq('student_id', student.id);

        const respondedIds = new Set(responses?.map((r: any) => r.quiz_id) || []);

        quizzes = (data || []).map((q: any) => ({
          ...q,
          respondido: respondedIds.has(q.id),
          totalQuestoes: q.quiz_questions?.[0]?.count || 0,
        }));
      }
    } catch {}
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          ⚡ COOP Quiz
        </h1>
        <p className="text-gray-500 mt-1">
          Responda os quizzes e ganhe COOPCOINS para a escola!
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🎮</p>
          <p className="font-medium text-lg">Nenhum quiz disponível ainda</p>
          <p className="text-sm mt-1">Seu professor vai criar em breve!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz: any) => (
            <div key={quiz.id} className={`bg-white rounded-2xl border-2 p-5 flex items-center justify-between transition-all ${quiz.respondido ? 'border-green-200 bg-green-50' : 'border-blue-200 hover:border-blue-400 hover:shadow-md'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${quiz.respondido ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {quiz.respondido ? '✅' : '⚡'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{quiz.title}</h3>
                  {quiz.description && <p className="text-sm text-gray-500 mt-0.5">{quiz.description}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">📝 {quiz.totalQuestoes} questões</span>
                    <span className="text-xs text-gray-400">⏱ {quiz.timer_seconds}s por questão</span>
                    {quiz.respondido
                      ? <span className="text-xs text-green-600 font-medium">+20 CC ganhos! 🪙</span>
                      : <span className="text-xs text-blue-600 font-medium">+20 CC disponíveis 🪙</span>
                    }
                  </div>
                </div>
              </div>
              {!quiz.respondido ? (
                <Link href={`/estudante/quizzes/${quiz.id}`}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
                  Jogar!
                </Link>
              ) : (
                <span className="text-green-600 font-bold text-sm">Concluído ✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
