# PRD — COOPCOINS v2.1 | Carteira Virtual da Escola
### City Coop Platform | Marco 2026

---

## MUDANÇA PRINCIPAL DA v2.1

**Quem usa as moedas no app mudou:**
- v2.0: Gestor debitava ❌
- v2.1: **Professor debita** ✅

O professor acompanha os alunos, conhece o progresso da turma e é quem constrói a cidade no app usando os COOPCOINS acumulados pelos alunos.

---

## 1. INFORMAÇÕES DO DOCUMENTO

| Campo | Valor |
|---|---|
| Produto | City Coop — Plataforma EAD + App Nativo |
| Feature | COOPCOINS — Carteira Virtual da Escola |
| Versão | 2.1 |
| Data | Marco 2026 |
| Mudança | Professor debita (não gestor) |
| Stack | Next.js + Supabase + TypeScript |

---

## 2. FONTES DE CRÉDITO

| # | Evento | Moedas | Recorrência | reference_type |
|---|---|---|---|---|
| 1 | Login diário | **5 CC** | 1x por dia por aluno | `daily_login` |
| 2 | Submeter Quiz | **20 CC** | Por quiz | `quiz` |
| 3 | Completar Missão | **30 CC** | 1x por missão | `mission` |
| 4 | Avaliação Mensal | **até 250 CC** | Por acertos (6 no total) | `assessment` |
| 5 | Ciclo 1 | **200 CC** | 1x | `cycle_1` |
| 6 | Ciclo 2 | **250 CC** | 1x | `cycle_2` |
| 7 | Ciclo 3 | **300 CC** | 1x | `cycle_3` |
| 8 | Ciclo 4 | **350 CC** | 1x | `cycle_4` |
| 9 | Ciclo 5 | **400 CC** | 1x | `cycle_5` |
| 10 | Ciclo 6 | **500 CC** | 1x | `cycle_6` |
| 11 | Evento Final | **1000 CC** | 1x — ápice | `graduation_event` |

### Fórmula da Avaliação:
```
CC ganhos = Math.round((score / 100) * 250)
```

---

## 3. PERMISSÕES POR PERFIL

| Ação | Gestor | Professor | Aluno |
|---|---|---|---|
| Ver saldo da escola | SIM | SIM | SIM |
| Ver histórico | SIM | SIM | SIM |
| Ver ranking de contribuições | SIM | SIM | SIM |
| **Debitar (usar no app)** | **NÃO (403)** | **SIM** | **NÃO (403)** |

---

## 4. O QUE MUDAR NA v2.1

### 4.1 Atualizar `/api/coopcoins/debitar/route.ts`

Trocar verificação de `managers` por `teachers`:

```typescript
// REMOVER:
const { data: manager } = await (supabase.from('managers') as any)
  .select('school_id').eq('user_id', user.id).single();
if (!manager?.school_id) {
  return Response.json({ erro: 'Apenas gestores podem debitar' }, { status: 403 });
}

// ADICIONAR:
const { data: teacher } = await (supabase.from('teachers') as any)
  .select('school_id').eq('user_id', user.id).single();
if (!teacher?.school_id) {
  return Response.json({ erro: 'Apenas professores podem debitar COOPCOINS' }, { status: 403 });
}
```

### 4.2 Criar página `/professor/coopcoins`

```typescript
// src/app/(dashboard)/professor/coopcoins/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getSchoolBalance, getSchoolTransactions } from '@/lib/coopcoins/services';

export default async function ProfessorCoopCoinsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let saldo = 0;
  let historico: any[] = [];
  let schoolId = '';

  if (user) {
    try {
      const { data: teacher } = await (supabase.from('teachers') as any)
        .select('school_id').eq('user_id', user.id).single();

      if (teacher?.school_id) {
        schoolId = teacher.school_id;
        saldo = await getSchoolBalance(schoolId);
        historico = await getSchoolTransactions(schoolId, 50);
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
                    {new Date(tx.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
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
```

### 4.3 Adicionar link na sidebar do professor

No arquivo `src/components/dashboard/professor/sidebar.tsx` (ou equivalente), adicionar:

```typescript
{
  label: 'CoopCoins',
  icon: Icons.trophy,  // ou o ícone disponível
  href: '/professor/coopcoins',
  active: pathname.startsWith('/professor/coopcoins'),
},
```

---

## 5. CHECKLIST FINAL

- [ ] `/api/coopcoins/debitar` verifica `teachers` (não `managers`)
- [ ] Página `/professor/coopcoins` criada
- [ ] Link CoopCoins na sidebar do professor
- [ ] Gestor tentando debitar recebe 403
- [ ] Aluno tentando debitar recebe 403
- [ ] Build sem erros
- [ ] Deploy na Vercel

---

## 6. HISTÓRICO DE VERSÕES

| Versão | Data | Mudança |
|---|---|---|
| 1.0 | Mar/2026 | Carteira individual por aluno |
| 2.0 | Mar/2026 | Carteira coletiva da escola, gestor debitava |
| 2.1 | Mar/2026 | **Professor debita — versão atual** |

---

*Para regras completas consulte: COOPCOINS_SKILL.md*
