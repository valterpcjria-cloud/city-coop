import { createClient } from '@/lib/supabase/server';
import { getSchoolBalance, getSchoolTransactions } from '@/lib/coopcoins/services';

export default async function ProfessorCoopCoinsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let saldo = 0;
  let historico: any[] = [];

  if (user) {
    try {
      const { data: teacher } = await (supabase.from('teachers') as any)
        .select('school_id').eq('user_id', user.id).single();

      if (teacher?.school_id) {
        saldo = await getSchoolBalance(teacher.school_id);
        historico = await getSchoolTransactions(teacher.school_id, 50);
      }
    } catch {}
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          🪙 CoopCoins da Escola
        </h1>
        <p className="text-gray-500 mt-1">
          Saldo acumulado pelos alunos — use no app para construir a cidade
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6">
        <p className="text-blue-200 text-sm font-medium uppercase tracking-wide">Saldo Disponível para Construção</p>
        <p className="text-5xl font-bold mt-2">{saldo} <span className="text-2xl">CC</span></p>
        <p className="text-blue-200 text-sm mt-2">Acumulado por todos os alunos da escola</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
        <p className="text-amber-800 font-medium">🏙️ Como usar no app?</p>
        <p className="text-amber-700 text-sm mt-1">
          Acesse o app City Coop com sua conta de professor e use os COOPCOINS para construir a cidade da escola.
        </p>
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <h2 className="font-bold text-gray-800 text-lg mb-4">📋 Histórico de Transações</h2>
        {historico.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">Nenhuma transação ainda</p>
            <p className="text-sm">Os alunos ainda não acumularam COOPCOINS</p>
          </div>
        ) : (
          <div className="space-y-3">
            {historico.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">{tx.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleString('pt-BR', {
                      timeZone: 'America/Sao_Paulo',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`font-bold text-sm ${tx.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'earn' ? '+' : '-'}{tx.amount} CC
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
