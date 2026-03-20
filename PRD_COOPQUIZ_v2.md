# PRD — COOP QUIZ ⚡
### City Coop Platform | Marco 2026 | v2.0

---

## 1. VISÃO DO PRODUTO

**"O quiz que transforma aprendizado em festa cooperativa"**

O COOP QUIZ não é um quiz comum. É uma experiência gamificada onde cada resposta certa contribui para a cidade da escola. Dois modos de jogo, efeitos visuais imersivos e a emoção de ver os COOPCOINS caindo na carteira em tempo real.

---

## 2. DOIS MODOS DE JOGO

### 🎯 Modo SOLO (Assíncrono)
- Aluno responde no seu próprio ritmo
- Disponível 24/7 enquanto o professor mantiver ativo
- Timer por questão (pressão leve)
- Feedback imediato após cada resposta
- Score final com resumo de desempenho

### ⚡ Modo LIVE (Síncrono — estilo Kahoot)
- Professor inicia a sessão ao vivo
- Todos os alunos da turma entram com um código
- Contador regressivo sincronizado para todos
- Ranking ao vivo atualizado após cada questão
- Pódio épico no final com animação
- Professor vê o placar em tempo real no seu painel

---

## 3. EXPERIÊNCIA VISUAL (UX/UI)

### Interface do aluno durante o quiz:
```
┌─────────────────────────────────────┐
│  ⚡ COOP QUIZ          Q 3/10       │
│  ████████░░░░░░░░░░░  30%           │
│                    ⏱ 00:12         │
│                                     │
│  "O cooperativismo surgiu em:"      │
│                                     │
│  🔵 A) 1844 na Inglaterra           │
│  🔵 B) 1920 no Brasil               │
│  🔵 C) 1900 na França               │
│  🔵 D) 1850 na Alemanha             │
│                                     │
│  🪙 +20 CC para sua escola!         │
└─────────────────────────────────────┘
```

### Ao acertar:
- ✅ Animação verde explosiva com confetes
- 🔊 Som de acerto (chime positivo)
- 💬 Feedback: "Correto! Rochdale, 1844!"
- 🪙 Mini-animação de moeda voando para carteira

### Ao errar:
- ❌ Animação vermelha com shake
- 🔊 Som de erro (buzzer suave)
- 💬 Feedback: "Quase! A resposta era A) 1844"
- 💪 Mensagem motivacional: "Continue! A escola conta com você!"

### Tela final:
```
┌─────────────────────────────────────┐
│         🏆 QUIZ CONCLUÍDO!          │
│                                     │
│     Você acertou 8 de 10            │
│     ⭐⭐⭐⭐⭐ (80%)               │
│                                     │
│  🪙 +20 CC adicionados à escola!    │
│  🏫 Saldo atual: 150 CC             │
│                                     │
│  [Ver Ranking]  [Novo Quiz]         │
└─────────────────────────────────────┘
```

---

## 4. MODO LIVE — FLUXO DETALHADO

```
Professor cria quiz e clica "Iniciar ao vivo"
        ↓
Sistema gera código de 6 letras (ex: COOP42)
        ↓
Alunos acessam /quiz/live e digitam o código
        ↓
Professor vê sala de espera com avatares dos alunos
        ↓
Professor clica "Começar!"
        ↓
Questões aparecem sincronizadas para todos
        ↓
Ranking ao vivo após cada questão
        ↓
Pódio final épico 🥇🥈🥉
        ↓
20 CC creditados para cada aluno que participou
```

---

## 5. CRIAÇÃO DO QUIZ

### Por Professor:
- Interface simples com campos de questão
- Adiciona opções de resposta
- Marca a correta
- Define timer por questão (10s / 20s / 30s / sem limite)
- Publica para a turma

### Por IA (DOT Assistente):
- Professor descreve o tema: "Crie um quiz sobre cooperativismo com 10 questões"
- IA gera questões automaticamente
- Professor revisa e edita se quiser
- Publica com 1 clique

---

## 6. REGRAS DE COOPCOINS

| Ação | CC | Observação |
|---|---|---|
| Submeter quiz (qualquer nota) | **+20 CC** | Crédito garantido pela participação |
| Participar do Modo LIVE | **+20 CC** | Mesmo valor — incentiva participação |
| Acertar 100% das questões | **+5 CC bonus** | Bônus de excelência |

**Regras:**
- Aluno só ganha CC uma vez por quiz (não repete)
- O crédito vai direto para a carteira da escola
- Professor vê no painel quantos CC o quiz gerou no total

---

## 7. MODELO DE DADOS

```sql
-- Quizzes
CREATE TABLE quizzes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id      UUID NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  created_by    UUID NOT NULL,
  ai_generated  BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  mode          TEXT DEFAULT 'solo' CHECK (mode IN ('solo', 'live', 'both')),
  timer_seconds INTEGER DEFAULT 30,
  live_code     TEXT UNIQUE,       -- codigo de 6 letras para modo live
  live_started_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Questões
CREATE TABLE quiz_questions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id    UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('multiple_choice', 'true_false')),
  question   TEXT NOT NULL,
  options    JSONB,               -- ["op1", "op2", "op3", "op4"]
  correct    TEXT NOT NULL,
  order_num  INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Respostas
CREATE TABLE quiz_responses (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id      UUID NOT NULL REFERENCES quizzes(id),
  student_id   UUID NOT NULL,
  answers      JSONB NOT NULL,
  score        INTEGER,           -- 0-100
  time_taken   INTEGER,          -- segundos para completar
  coopcoins_awarded BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (quiz_id, student_id)
);

-- Sessões Live
CREATE TABLE quiz_live_sessions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id     UUID NOT NULL REFERENCES quizzes(id),
  live_code   TEXT NOT NULL UNIQUE,
  current_question INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  started_at  TIMESTAMPTZ DEFAULT now(),
  ended_at    TIMESTAMPTZ
);

-- Participantes da sessão live
CREATE TABLE quiz_live_participants (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  UUID NOT NULL REFERENCES quiz_live_sessions(id),
  student_id  UUID NOT NULL,
  score       INTEGER DEFAULT 0,
  joined_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (session_id, student_id)
);
```

---

## 8. API ROUTES

```
-- Gestão de quizzes
GET    /api/quizzes                      → lista quizzes da turma
POST   /api/quizzes                      → professor cria quiz
GET    /api/quizzes/[id]                 → detalhe com questões
PATCH  /api/quizzes/[id]                 → editar quiz
DELETE /api/quizzes/[id]                 → remover quiz

-- IA
POST   /api/quizzes/ai-generate          → IA gera quiz

-- Submissão
POST   /api/quizzes/[id]/submit          → aluno submete → +20 CC

-- Modo Live
POST   /api/quizzes/[id]/live/start      → professor inicia sessão live
GET    /api/quizzes/live/[code]          → aluno entra na sessão
POST   /api/quizzes/live/[code]/join     → aluno confirma entrada
POST   /api/quizzes/live/[code]/answer   → aluno responde questão live
GET    /api/quizzes/live/[code]/ranking  → ranking em tempo real
POST   /api/quizzes/live/[code]/end      → professor encerra

-- Resultados
GET    /api/quizzes/[id]/results         → professor vê resultados completos
```

---

## 9. PÁGINAS

### Aluno:
```
/estudante/quizzes              → lista de quizzes disponíveis
/estudante/quizzes/[id]         → jogar quiz (modo solo)
/estudante/quizzes/live         → entrar em sessão live (digita código)
/estudante/quizzes/live/[code]  → jogar quiz ao vivo
```

### Professor:
```
/professor/quizzes              → gerenciar quizzes
/professor/quizzes/novo         → criar quiz
/professor/quizzes/[id]/editar  → editar quiz
/professor/quizzes/[id]/live    → painel do professor (modo live)
/professor/quizzes/[id]/resultados → ver resultados detalhados
```

---

## 10. SONS E ANIMAÇÕES (implementar com CSS + Tone.js ou Howler.js)

| Evento | Som | Animação |
|---|---|---|
| Iniciar quiz | Fanfarra curta | Contagem regressiva 3,2,1 |
| Resposta certa | Chime positivo | Confetes verdes + bounce |
| Resposta errada | Buzzer suave | Shake vermelho |
| Timer acabando | Bip acelerado (últimos 5s) | Timer fica vermelho |
| Ganhar CC | Moeda tilintando | Moeda voando animada |
| Pódio final | Música vitória | Animação 🥇🥈🥉 |
| Novo ranking | Swoosh | Cards reorganizando |

---

## 11. CHECKLIST DE IMPLEMENTAÇÃO

**Banco de dados:**
- [ ] Tabelas quizzes, quiz_questions, quiz_responses criadas
- [ ] Tabelas quiz_live_sessions, quiz_live_participants criadas
- [ ] RLS habilitado em todas as tabelas

**Backend:**
- [ ] API routes de gestão criadas
- [ ] API route de submissão com crédito de 20 CC
- [ ] API route de geração por IA
- [ ] API routes do modo live

**Frontend Aluno:**
- [ ] Lista de quizzes em /estudante/quizzes
- [ ] Interface de jogo com timer animado
- [ ] Animações de acerto/erro
- [ ] Tela de resultado com CC ganhos
- [ ] Entrada no modo live por código

**Frontend Professor:**
- [ ] Página de gestão de quizzes
- [ ] Formulário de criação
- [ ] Botão "Gerar com IA"
- [ ] Painel do modo live com ranking
- [ ] Página de resultados detalhados

**Integração COOPCOINS:**
- [ ] +20 CC ao submeter quiz solo
- [ ] +20 CC ao participar do modo live
- [ ] +5 CC bonus por 100% de acertos
- [ ] Histórico mostrando origem "quiz"

---

*City Coop 2026 | COOP QUIZ v2.0*
*Consulte tambem: COOPCOINS_SKILL.md*
