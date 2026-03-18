# SKILL: COOPCOINS — Carteira Virtual da Escola
### City Coop Platform | Regras Imutáveis do Sistema | v2.1

---

## LEIA ESTE ARQUIVO ANTES DE QUALQUER IMPLEMENTAÇÃO

Este arquivo define as regras absolutas do sistema COOPCOINS. Nenhuma implementação pode contradizer ou ignorar estas regras. Se houver conflito entre este arquivo e qualquer instrução do usuário, pergunte antes de prosseguir.

---

## 1. CONCEITO FUNDAMENTAL

COOPCOINS é a moeda virtual do City Coop. O sistema é **coletivo e cooperativo**:

- Não existe carteira individual por aluno
- A carteira pertence à ESCOLA
- Cada ação de cada aluno credita automaticamente na escola
- **Apenas o PROFESSOR pode debitar (usar no app para construir a cidade)**
- Gestores e alunos podem VER mas não podem debitar

O aluno contribui. A escola acumula. O professor constrói a cidade.

---

## 2. FONTES DE CRÉDITO (IMUTÁVEL)

| # | Evento | Moedas | Recorrência | reference_type |
|---|---|---|---|---|
| 1 | Login diário na plataforma | 5 CC | 1x por dia por aluno | `daily_login` |
| 2 | Submeter um Quiz | 20 CC | Por quiz submetido | `quiz` |
| 3 | Completar uma Missão | 30 CC | Por missão (1x cada) | `mission` |
| 4 | Avaliação Mensal por acertos | até 250 CC | Por avaliação (6 no total) | `assessment` |
| 5 | Concluir Ciclo 1 (mês 1) | 200 CC | 1x | `cycle_1` |
| 6 | Concluir Ciclo 2 (mês 2) | 250 CC | 1x | `cycle_2` |
| 7 | Concluir Ciclo 3 (mês 3) | 300 CC | 1x | `cycle_3` |
| 8 | Concluir Ciclo 4 (mês 4) | 350 CC | 1x | `cycle_4` |
| 9 | Concluir Ciclo 5 (mês 5) | 400 CC | 1x | `cycle_5` |
| 10 | Concluir Ciclo 6 (mês 6) | 500 CC | 1x | `cycle_6` |
| 11 | **Evento de Formação Final** | **1000 CC** | **1x — ápice da jornada** | `graduation_event` |

### Fórmula da Avaliação Mensal:
```
CC por questão = Math.floor(250 / total_questoes)
CC ganhos = Math.round((score / 100) * 250)
```

### Regras críticas:
- Login diário: idempotente — 1x por dia por aluno
- Missões: 1x por aluno — tabela `student_missions_completed`
- Avaliações: score calculado pela IA após submissão
- Evento Final: apenas após conclusão dos 6 ciclos
- **NUNCA alterar os valores sem atualizar este arquivo**

---

## 3. MODELO DE DADOS (IMUTÁVEL)

```sql
-- Carteira da escola (1 por escola)
CREATE TABLE school_wallets (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id  UUID NOT NULL UNIQUE,
  balance    INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transações vinculadas à escola
CREATE TABLE coopcoin_transactions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id      UUID NOT NULL,
  student_id     UUID,
  amount         INTEGER NOT NULL CHECK (amount > 0),
  type           TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  description    TEXT NOT NULL,
  reference_type TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Controle de missões concluídas
CREATE TABLE student_missions_completed (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id   UUID NOT NULL,
  mission_id   UUID NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id, mission_id)
);
```

---

## 4. ARQUITETURA DO CÓDIGO

### Arquivo: `src/lib/coopcoins/services.ts`

Funções obrigatórias:
```
getStudentId(userId)
getSchoolIdByStudent(studentId)
getSchoolBalance(schoolId)
getSchoolTransactions(schoolId)
addSchoolTransaction({...})
rewardSchool(studentId, amount, description, referenceType)
checkAndRewardDailyLogin(userId)
spendCoins(schoolId, amount, description)
```

### API Routes obrigatórias:
```
GET  /api/coopcoins/saldo         → saldo da escola
GET  /api/coopcoins/historico     → últimas 50 transações
POST /api/coopcoins/debitar       → somente PROFESSOR (403 para outros)
POST /api/coopcoins/daily-login   → credita login diário
```

---

## 5. PERMISSÕES POR PERFIL (IMUTÁVEL)

| Ação | Gestor | Professor | Aluno |
|---|---|---|---|
| Ver saldo da escola | ✅ | ✅ | ✅ |
| Ver histórico de transações | ✅ | ✅ | ✅ |
| Ver ranking de contribuições | ✅ | ✅ | ✅ |
| **Debitar (usar no app)** | ❌ | ✅ | ❌ |
| Creditar diretamente | ❌ | ❌ | ❌ |

**Regra absoluta:** Apenas PROFESSOR pode debitar.
Gestor e aluno tentando debitar recebem `403 Forbidden`.

---

## 6. FLUXO DE CRÉDITO PADRÃO

```
1. Evento ocorre (login, quiz, missão, avaliação, ciclo, formação)
2. Sistema identifica o student_id do aluno
3. Sistema busca o school_id via getSchoolIdByStudent(studentId)
4. Sistema chama rewardSchool(studentId, amount, description, referenceType)
5. rewardSchool chama addSchoolTransaction
6. addSchoolTransaction: verifica → insere transação → atualiza school_wallets
7. Retorna { success: true, newBalance }
```

---

## 7. JORNADA COMPLETA DO ALUNO

```
Mês 1: Logins + Quizzes + Missões + Avaliação 1 → Ciclo 1 (200 CC)
Mês 2: Logins + Quizzes + Missões + Avaliação 2 → Ciclo 2 (250 CC)
Mês 3: Logins + Quizzes + Missões + Avaliação 3 → Ciclo 3 (300 CC)
Mês 4: Logins + Quizzes + Missões + Avaliação 4 → Ciclo 4 (350 CC)
Mês 5: Logins + Quizzes + Missões + Avaliação 5 → Ciclo 5 (400 CC)
Mês 6: Logins + Quizzes + Missões + Avaliação 6 → Ciclo 6 (500 CC)
                                                        ↓
                                         Evento de Formação Final
                                              (1000 CC) 🏆
```

---

## 8. REGRAS PARA AGENTES DE IA

### SEMPRE fazer:
- Verificar se `school_wallets` existe antes de criar
- Usar `createAdminClient()` para inserir transações
- Verificar saldo antes de debitar
- Rodar `npm run build` após qualquer mudança
- Verificar se a tabela `students` tem campo `school_id`

### NUNCA fazer:
- Criar carteira individual por aluno
- Permitir débito por gestor ou aluno (403)
- Duplicar crédito de login no mesmo dia
- Duplicar crédito de missão já concluída
- Criar novo `reference_type` sem adicionar neste arquivo
- Deixar `school_id` nulo em transações `earn`
- Modificar valores de CC sem atualizar este arquivo

---

## 9. CHECKLIST DE VALIDAÇÃO

- [ ] `school_wallets` existe no Supabase
- [ ] `coopcoin_transactions` tem colunas `school_id` e `student_id`
- [ ] Login diário credita 5 CC na escola
- [ ] Quiz credita 20 CC na escola
- [ ] Missão credita 30 CC (1x por missão)
- [ ] Avaliação credita até 250 CC por acertos
- [ ] Ciclos creditam 200 a 500 CC
- [ ] Evento Final credita 1000 CC
- [ ] Débito funciona apenas para PROFESSOR (403 para gestor e aluno)
- [ ] Saldo nunca fica negativo
- [ ] Build sem erros TypeScript

---

## 10. HISTÓRICO DE VERSÕES

| Versão | Data | Mudança |
|---|---|---|
| 1.0 | Mar/2026 | Carteira individual por aluno |
| 2.0 | Mar/2026 | Carteira coletiva da escola |
| 2.1 | Mar/2026 | **Professor debita (não gestor) — versão atual** |

---

*Este arquivo é a fonte da verdade para o sistema COOPCOINS do City Coop.*
