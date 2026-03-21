import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function QuizResultadosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quiz } = await (supabase.from('quizzes') as any)
    .select('*').eq('id', id).single();

  const { data: responses } = await (supabase.from('quiz_responses') as any)
    .select('*, student:students(id, name)')
    .eq('quiz_id', id)
    .order('score', { ascending: false });

  const total = responses?.length || 0;
  const media = total > 0
    ? Math.round(responses.reduce((acc: number, r: any) => acc + (r.score || 0), 0) / total)
    : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/professor/quizzes" className="text-gray-400 hover:text-gray-600">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Resultados</h1>
          <p className="text-gray-500">{quiz?.title}</p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{total}</p>
          <p className="text-sm text-blue-500 mt-1">Respostas</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{media}%</p>
          <p className="text-sm text-green-500 mt-1">Média geral</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{total * 20} CC</p>
          <p className="text-sm text-amber-500 mt-1">COOPCOINS gerados</p>
        </div>
      </div>

      {/* Lista de respostas */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="font-bold text-gray-800 mb-4">👥 Alunos</h2>
        {total === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">⏳</p>
            <p className="font-medium">Nenhum aluno respondeu ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {responses.map((r: any, i: number) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="font-medium text-gray-700">{r.student?.name || 'Aluno'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-amber-600 font-medium">+20 CC 🪙</span>
                  <span className={`font-bold text-sm px-3 py-1 rounded-full ${
                    r.score >= 70 ? 'bg-green-100 text-green-700' :
                    r.score >= 50 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {r.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
