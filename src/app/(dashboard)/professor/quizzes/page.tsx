import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ProfessorQuizzesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let quizzes: any[] = [];

  if (user) {
    try {
      const { data } = await (supabase.from('quizzes') as any)
        .select('*, quiz_questions(count), quiz_responses(count)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      quizzes = (data || []).map((q: any) => ({
        ...q,
        totalQuestoes: q.quiz_questions?.[0]?.count || 0,
        totalRespostas: q.quiz_responses?.[0]?.count || 0,
      }));
    } catch {}
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            ⚡ COOP Quiz
          </h1>
          <p className="text-gray-500 mt-1">Gerencie os quizzes da sua turma</p>
        </div>
        <Link href="/professor/quizzes/novo"
          className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
          + Criar Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🎮</p>
          <p className="font-medium text-lg">Nenhum quiz criado ainda</p>
          <p className="text-sm mt-1">Crie seu primeiro quiz para engajar os alunos!</p>
          <Link href="/professor/quizzes/novo"
            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Criar primeiro quiz
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz: any) => (
            <div key={quiz.id} className="bg-white rounded-2xl border-2 border-gray-100 p-5 flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
                  {quiz.ai_generated ? '🤖' : '📝'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{quiz.title}</h3>
                  {quiz.description && <p className="text-sm text-gray-500 mt-0.5">{quiz.description}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">📝 {quiz.totalQuestoes} questões</span>
                    <span className="text-xs text-gray-400">👥 {quiz.totalRespostas} respostas</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${quiz.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {quiz.is_active ? '● Ativo' : '○ Inativo'}
                    </span>
                    {quiz.ai_generated && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">🤖 IA</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/professor/quizzes/${quiz.id}/resultados`}
                  className="text-sm text-blue-600 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  Resultados
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
