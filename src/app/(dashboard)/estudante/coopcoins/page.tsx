import { createClient } from '@/lib/supabase/server';
import { getStudentId, getSchoolIdByStudent, getSchoolBalance, getSchoolTransactions } from '@/lib/coopcoins/services';
import { DailyLoginTrigger } from '@/components/coopcoins/DailyLoginTrigger';

export default async function CoopCoinsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let saldo = 0;
  let historico: any[] = [];

  if (user) {
    try {
      const studentId = await getStudentId(user.id);
      const schoolId = await getSchoolIdByStudent(studentId);
      if (schoolId) {
        saldo = await getSchoolBalance(schoolId);
        historico = await getSchoolTransactions(schoolId, 20);
      }
    } catch {}
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <DailyLoginTrigger />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          🪙 CoopCoins
        </h1>
        <p className="text-gray-500 mt-1">
          Saldo coletivo da sua escola — cada ação sua contribui para este total
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6">
        <p className="text-blue-200 text-sm font-medium uppercase tracking-wide">Saldo Atual da Escola</p>
        <p className="text-5xl font-bold mt-2">{saldo} <span className="text-2xl">CC</span></p>
        <p className="text-blue-200 text-sm mt-2">Acumulado por todos os alunos da escola</p>
      </div>

      <div className="bg-white rounded-2xl border p-6 mb-6">
        <h2 className="font-bold text-gray-800 text-lg mb-4">🎯 Como ganhar CoopCoins?</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "📅", label: "Login diário", valor: "+5 CC" },
            { icon: "📝", label: "Submeter Quiz", valor: "+20 CC" },
            { icon: "🎯", label: "Completar Missão", valor: "+30 CC" },
            { icon: "📊", label: "Avaliação Mensal", valor: "+50 CC" },
            { icon: "🔄", label: "Concluir Ciclo", valor: "+200~500 CC" },
            { icon: "🏆", label: "Evento Final", valor: "+1000 CC" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                <p className="text-sm font-bold text-blue-600">{item.valor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <h2 className="font-bold text-gray-800 text-lg mb-4">📋 Histórico de Transações</h2>
        {historico.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">Nenhuma transação ainda</p>
            <p className="text-sm">Continue participando para ganhar CoopCoins!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {historico.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">{tx.description}</p>
                  <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
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
