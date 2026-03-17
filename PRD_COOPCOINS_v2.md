# PRD — COOPCOINS v2.0 | Carteira Virtual da Escola
### City Coop Platform | Marco 2026

---

## INFORMACOES DO DOCUMENTO

| Campo | Valor |
|---|---|
| Produto | City Coop — Plataforma EAD + App Nativo |
| Feature | COOPCOINS — Carteira Virtual da Escola |
| Versao | 2.0 |
| Data | Marco 2026 |
| Mudanca principal | Carteira individual por aluno → Carteira coletiva da escola |
| Stack | Next.js (App Router) + Supabase + TypeScript |

---

## 1. VISAO GERAL

O sistema COOPCOINS e a moeda virtual do City Coop. Foi redesenhado para refletir o principio cooperativo: a contribuicao coletiva.

**Principio fundamental:**
- Nao existe carteira individual por aluno
- A carteira pertence a ESCOLA
- Cada acao de cada aluno credita automaticamente na escola
- Apenas o Gestor da escola pode debitar (usar no app nativo)

**O aluno contribui. A escola acumula. A cidade cresce.**

---

## 2. FONTES DE CREDITO (REGRA IMUTAVEL)

Estas sao as UNICAS fontes de credito. Nunca criar novas sem atualizar o COOPCOINS_SKILL.md.

| # | Evento | Moedas | Recorrencia | reference_type |
|---|---|---|---|---|
| 1 | Login diario na plataforma | **5 CC** | 1x por dia por aluno | `daily_login` |
| 2 | Submeter um Quiz | **20 CC** | Por quiz submetido | `quiz` |
| 3 | Completar uma Missao | **30 CC** | Por missao (1x cada) | `mission` |
| 4 | Submeter Avaliacao Mensal | **50 CC** | Por avaliacao (6 no total) | `assessment` |
| 5 | Concluir Ciclo 1 (mes 1) | **200 CC** | 1x | `cycle_1` |
| 6 | Concluir Ciclo 2 (mes 2) | **250 CC** | 1x | `cycle_2` |
| 7 | Concluir Ciclo 3 (mes 3) | **300 CC** | 1x | `cycle_3` |
| 8 | Concluir Ciclo 4 (mes 4) | **350 CC** | 1x | `cycle_4` |
| 9 | Concluir Ciclo 5 (mes 5) | **400 CC** | 1x | `cycle_5` |
| 10 | Concluir Ciclo 6 (mes 6) | **500 CC** | 1x | `cycle_6` |
| 11 | **Evento de Formacao Final** | **1000 CC** | 1x — apice da jornada | `graduation_event` |

### Regras criticas:
- Login diario e idempotente — checar antes de creditar (1x por dia por aluno)
- Missoes so creditam 1x por aluno — usar tabela `student_missions_completed`
- Sao exatamente 6 avaliacoes mensais — uma por ciclo
- O Evento Final so ocorre apos conclusao dos 6 ciclos
- Valor do login diario e SEMPRE 5 CC — nunca 10, nunca outro valor

---

## 3. MODELO DE DADOS

### 3.1 Tabelas necessarias

```sql
-- Carteira da escola (1 registro por escola)
CREATE TABLE IF NOT EXISTS school_wallets (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id  UUID NOT NULL UNIQUE,
  balance    INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transacoes vinculadas a escola
-- IMPORTANTE: school_id e OBRIGATORIO em toda transacao
CREATE TABLE IF NOT EXISTS coopcoin_transactions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id      UUID NOT NULL,
  student_id     UUID,           -- quem gerou o credito (null so em debitos do gestor)
  amount         INTEGER NOT NULL CHECK (amount > 0),
  type           TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  description    TEXT NOT NULL,
  reference_type TEXT,           -- valores: daily_login, quiz, mission, assessment, cycle_1..6, graduation_event, app
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Controle de missoes concluidas (evita duplicidade)
CREATE TABLE IF NOT EXISTS student_missions_completed (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id   UUID NOT NULL,
  mission_id   UUID NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id, mission_id)
);

-- RLS
ALTER TABLE school_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE coopcoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_missions_completed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_veem_school_wallets"
ON school_wallets FOR SELECT TO authenticated USING (true);

CREATE POLICY "todos_veem_transactions"
ON coopcoin_transactions FOR SELECT TO authenticated USING (true);
```

### 3.2 Campos obrigatorios em coopcoin_transactions

| Campo | Obrigatorio | Observacao |
|---|---|---|
| school_id | SIM | Sempre — e a carteira da escola |
| student_id | Condicional | Obrigatorio em creditos, null em debitos do gestor |
| amount | SIM | Sempre positivo |
| type | SIM | 'earn' para creditos, 'spend' para debitos |
| description | SIM | Texto descritivo da transacao |
| reference_type | Recomendado | Usar valores da tabela de fontes |

---

## 4. ARQUITETURA DO CODIGO

### 4.1 Arquivo: `src/lib/coopcoins/services.ts`

Substituir o conteudo atual por este:

```typescript
import { createAdminClient, createClient } from '@/lib/supabase/server';

// ─────────────────────────────────────────────
// AUXILIARES
// ─────────────────────────────────────────────

export async function getStudentId(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await (supabase.from('students') as any)
    .select('id')
    .eq('user_id', userId)
    .single();
  if (error) throw new Error('Estudante nao encontrado');
  return data.id;
}

export async function getSchoolIdByStudent(studentId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await (supabase.from('students') as any)
    .select('school_id')
    .eq('id', studentId)
    .single();
  if (error || !data?.school_id) return null;
  return data.school_id;
}

// ─────────────────────────────────────────────
// SALDO E HISTORICO
// ─────────────────────────────────────────────

export async function getSchoolBalance(schoolId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await (supabase.from('school_wallets') as any)
    .select('balance')
    .eq('school_id', schoolId)
    .maybeSingle();
  if (error) return 0;
  return data?.balance ?? 0;
}

export async function getSchoolTransactions(schoolId: string, limit = 50) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from('coopcoin_transactions') as any)
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data ?? [];
}

// ─────────────────────────────────────────────
// TRANSACOES
// ─────────────────────────────────────────────

export async function addSchoolTransaction({
  schoolId,
  studentId,
  amount,
  type,
  description,
  referenceType,
}: {
  schoolId: string;
  studentId?: string;
  amount: number;
  type: 'earn' | 'spend';
  description: string;
  referenceType?: string;
}) {
  const supabase = await createAdminClient();

  const currentBalance = await getSchoolBalance(schoolId);
  const newBalance = type === 'earn'
    ? currentBalance + amount
    : currentBalance - amount;

  if (newBalance < 0) throw new Error('Saldo insuficiente');

  const { error: tError } = await (supabase.from('coopcoin_transactions') as any)
    .insert({
      school_id: schoolId,
      student_id: studentId ?? null,
      amount,
      type,
      description,
      reference_type: referenceType ?? null,
    });
  if (tError) throw tError;

  const { data: wallet } = await (supabase.from('school_wallets') as any)
    .select('id')
    .eq('school_id', schoolId)
    .maybeSingle();

  if (!wallet) {
    await (supabase.from('school_wallets') as any)
      .insert({ school_id: schoolId, balance: newBalance });
  } else {
    await (supabase.from('school_wallets') as any)
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('school_id', schoolId);
  }

  return { success: true, newBalance };
}

export async function rewardSchool(
  studentId: string,
  amount: number,
  description: string,
  referenceType?: string
) {
  const schoolId = await getSchoolIdByStudent(studentId);
  if (!schoolId) return { success: false, reason: 'school_not_found' };

  return addSchoolTransaction({
    schoolId,
    studentId,
    amount,
    type: 'earn',
    description,
    referenceType,
  });
}

export async function spendCoins(
  schoolId: string,
  amount: number,
  description: string
) {
  return addSchoolTransaction({
    schoolId,
    amount,
    type: 'spend',
    description,
    referenceType: 'app',
  });
}

// ─────────────────────────────────────────────
// LOGIN DIARIO — 5 CC (NUNCA ALTERAR ESTE VALOR)
// ─────────────────────────────────────────────

export async function checkAndRewardDailyLogin(
  userId: string
): Promise<{ rewarded: boolean; amount?: number }> {
  try {
    const supabase = await createClient();
    const studentId = await getStudentId(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existing } = await (supabase.from('coopcoin_transactions') as any)
      .select('id')
      .eq('student_id', studentId)
      .eq('reference_type', 'daily_login')
      .gte('created_at', today.toISOString())
      .maybeSingle();

    if (existing) return { rewarded: false };

    const result = await rewardSchool(
      studentId,
      5, // VALOR FIXO — conforme COOPCOINS_SKILL.md
      'Login diario',
      'daily_login'
    );

    if (!result.success) return { rewarded: false };
    return { rewarded: true, amount: 5 };
  } catch (error) {
    console.error('checkAndRewardDailyLogin error:', error);
    return { rewarded: false };
  }
}
```

### 4.2 API Routes

#### `src/app/api/coopcoins/saldo/route.ts`
```typescript
import { createClient } from '@/lib/supabase/server';
import { getStudentId, getSchoolIdByStudent, getSchoolBalance } from '@/lib/coopcoins/services';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return Response.json({ erro: 'Nao autorizado' }, { status: 401 });

  try {
    const studentId = await getStudentId(user.id);
    const schoolId = await getSchoolIdByStudent(studentId);
    if (!schoolId) return Response.json({ erro: 'Escola nao encontrada' }, { status: 404 });

    const saldo = await getSchoolBalance(schoolId);
    return Response.json({ saldo, schoolId });
  } catch {
    return Response.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
```

#### `src/app/api/coopcoins/historico/route.ts`
```typescript
import { createClient } from '@/lib/supabase/server';
import { getStudentId, getSchoolIdByStudent, getSchoolTransactions } from '@/lib/coopcoins/services';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return Response.json({ erro: 'Nao autorizado' }, { status: 401 });

  try {
    const studentId = await getStudentId(user.id);
    const schoolId = await getSchoolIdByStudent(studentId);
    if (!schoolId) return Response.json({ historico: [] });

    const historico = await getSchoolTransactions(schoolId);
    return Response.json({ historico });
  } catch {
    return Response.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
```

#### `src/app/api/coopcoins/debitar/route.ts`
```typescript
import { createClient } from '@/lib/supabase/server';
import { spendCoins } from '@/lib/coopcoins/services';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return Response.json({ erro: 'Nao autorizado' }, { status: 401 });

  // Verifica se e gestor
  const { data: manager } = await (supabase.from('managers') as any)
    .select('school_id')
    .eq('user_id', user.id)
    .single();

  if (!manager?.school_id) {
    return Response.json({ erro: 'Apenas gestores podem debitar COOPCOINS' }, { status: 403 });
  }

  const { valor, motivo } = await request.json();
  if (!valor || !motivo) {
    return Response.json({ erro: 'Campos obrigatorios: valor, motivo' }, { status: 400 });
  }

  try {
    const resultado = await spendCoins(manager.school_id, valor, motivo);
    return Response.json(resultado);
  } catch (err: any) {
    const status = err.message === 'Saldo insuficiente' ? 422 : 500;
    return Response.json({ erro: err.message }, { status });
  }
}
```

#### `src/app/api/coopcoins/daily-login/route.ts`
```typescript
import { createClient } from '@/lib/supabase/server';
import { checkAndRewardDailyLogin } from '@/lib/coopcoins/services';

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await checkAndRewardDailyLogin(user.id);
  return Response.json({ rewarded: result.rewarded, amount: result.amount ?? 0 });
}
```

---

## 5. PERMISSOES POR PERFIL

| Acao | Gestor | Professor | Aluno |
|---|---|---|---|
| Ver saldo da escola | SIM | SIM | SIM |
| Ver historico de transacoes | SIM | SIM | SIM |
| Ver ranking de contribuicoes | SIM | SIM | SIM |
| **Debitar (usar no app)** | **SIM** | NAO (403) | NAO (403) |
| Creditar diretamente | NAO | NAO | NAO |

---

## 6. UI — O QUE ATUALIZAR

### Pagina /estudante/coopcoins
- Exibir saldo da ESCOLA (nao do aluno)
- Mensagem: "Saldo coletivo da sua escola — cada acao sua contribui para este total"
- Historico de transacoes da escola
- Manter "Como ganhar?" com os valores corretos da tabela de fontes

### Dashboard do estudante
- Card/widget mostrando saldo da escola
- Mensagem motivacional de contribuicao coletiva

### Painel do Gestor — criar /gestor/coopcoins
- Saldo total da escola em destaque
- Historico completo de transacoes
- Ranking dos alunos que mais contribuiram
- Botao "Disponivel para uso no app: X CC"

---

## 7. O QUE NAO FAZER

- NAO criar carteira individual por aluno
- NAO permitir debito por aluno ou professor (retornar 403)
- NAO usar valor diferente de 5 CC para login diario
- NAO deixar school_id nulo em transacoes do tipo 'earn'
- NAO criar loja, marketplace ou sistema de recompensas
- NAO fazer rollback sem aprovacao explicita do usuario
- NAO inventar novos reference_types sem adicionar no COOPCOINS_SKILL.md

---

## 8. CHECKLIST FINAL

Antes do commit verificar:

- [ ] Tabela `school_wallets` existe no Supabase
- [ ] `services.ts` tem todas as funcoes da secao 4.1
- [ ] Login diario credita 5 CC na escola
- [ ] Quiz credita 20 CC na escola
- [ ] Missao credita 30 CC na escola (1x)
- [ ] Avaliacao mensal credita 50 CC
- [ ] Ciclos creditam 200 a 500 CC
- [ ] Evento Final credita 1000 CC
- [ ] Debito funciona apenas para gestor (403 para outros)
- [ ] Saldo nunca fica negativo
- [ ] `npm run build` sem erros

---

*Versao 2.0 — Marco 2026 — City Coop*
*Para regras completas consulte tambem: COOPCOINS_SKILL.md*
