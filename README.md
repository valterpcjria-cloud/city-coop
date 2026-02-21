# City Coop Platform 🤝🚀

> **Plataforma SaaS de EAD e Gestão para o Cooperativismo Escolar**  
> Uma solução completa baseada em Next.js 16 e Inteligência Artificial para fomentar a cultura cooperativista entre estudantes e escolas brasileiras.

**Versão atual:** `v2.16.0` (The DOT 2.0 Update) · **Status:** Produção ✅

---

## 🌟 Visão Geral

A City Coop Platform é um sistema SaaS multi-tenant que conecta escolas, professores e estudantes em torno da prática do cooperativismo. Cada escola opera em um ambiente isolado e seguro, com perfis de acesso diferenciados e inteligência artificial especializada.

### Perfis de Usuário

| Perfil | Acesso | Responsabilidades |
|--------|--------|-------------------|
| **Superadmin** | Total | Controle de todas as escolas, usuários e sistema |
| **Gestor** | Por escola | Administração, base de conhecimento, relatórios |
| **Professor** | Por turma | Turmas, avaliações, eleições, eventos |
| **Estudante** | Por cooperativa | Formação, eleições, chat com DOT, entregas |

---

## 📦 Módulos Principais

### 🎓 Painel do Gestor
- **Gestão de Usuários**: CRUD completo com validação de CPF, reset de senha, ativação/desativação
- **Gestão de Escolas**: Cadastro multi-escola com metadados INEP e métricas de engajamento
- **Base de Conhecimento IA**: Upload de PDFs, DOCX, TXT, imagens, URLs e vídeos do YouTube
- **Cooperativas Parceiras**: Cadastro de cooperativas reais com matching geográfico
- **Relatórios & KPIs**: Dashboard consolidado com exportação em CSV, XLSX e PDF
- **Importação de Dados**: Upload em massa de alunos e usuários via planilha

### 📝 Painel do Professor
- **Turmas**: Criação com série e modalidade, matrícula de alunos, organização dos 6 núcleos
- **Avaliações com IA**: Geração inteligente de questões (objetiva, dissertativa, redação), editor manual
- **Eleições Democráticas**: Configuração de candidatos, votação secreta, apuração de resultados
- **Eventos e Projetos**: Ciclos, cronogramas, avaliação de planos por IA
- **DOT para Professores**: Suporte metodológico especializado em cooperativismo
- **Diretrizes Pedagógicas**: Regras e orientações para condução de turmas

### 🧑‍🎓 Painel do Estudante
- **Formação**: Trilha completa de aprendizado com 6 núcleos de atuação
- **Eleições**: Candidatura, votação secreta e acompanhamento de resultados
- **DOT Assistente 2.0**: Chat IA com blindagem pedagógica (método socrático)
- **Atividades e Entregas**: Tarefas por núcleo, uploads e colaboração
- **Planejamento de Evento**: Proposta e acompanhamento de planos da cooperativa

### 🤖 Inteligência Artificial (DOT Assistente 2.0)
- **Dual Model**: Claude 3.5 Sonnet (Anthropic) + GPT-4o (OpenAI)
- **RAG Interno**: Recuperação de conhecimento da base do gestor por relevância
- **Busca na Web**: Pesquisa contextual com filtros de escopo cooperativista
- **Blindagem Pedagógica**: Não fornece respostas prontas; estimula investigação autônoma
- **Histórico Persistente**: Conversas salvas por usuário no Supabase
- **Filtragem de Escopo**: Resposta padrão para off-topic (ex: futebol, política)

---

## 🛠️ Stack Tecnológica

### Frontend / Backend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **Next.js** | 16.1.6 | Framework principal (App Router) |
| **React** | 19.2.3 | Interface do usuário |
| **TypeScript** | ^5 | Tipagem estática |
| **Tailwind CSS** | ^4 | Estilização |
| **Framer Motion** | ^12 | Animações e transições |
| **Recharts** | ^3 | Gráficos e relatórios |
| **TanStack Query** | ^5 | Cache de dados do servidor |

### IA & Dados
| Tecnologia | Uso |
|-----------|-----|
| **Vercel AI SDK** | Streaming de respostas IA |
| **Anthropic Claude 3.5** | Modelo principal do DOT |
| **OpenAI GPT-4o** | Modelo alternativo do DOT |
| **Supabase (PostgreSQL)** | Banco de dados principal |
| **Supabase Auth** | Autenticação e sessões |
| **Row Level Security** | Isolamento multi-tenant |

### Utilitários
`react-hook-form` · `zod` · `Radix UI` · `jsPDF` · `xlsx` · `mammoth` · `pdf-parse` · `date-fns` · `zustand` · `sonner`

---

## ⚙️ Configuração e Desenvolvimento

### Pré-requisitos
- Node.js 20+
- Uma conta no [Supabase](https://supabase.com)
- Chave de API da [Anthropic](https://anthropic.com) e/ou [OpenAI](https://openai.com)

### Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente (veja abaixo)
cp .env.example .env.local

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

### Variáveis de Ambiente

Crie `.env.local` com as seguintes chaves:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# IA
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=sua-chave-secreta-aleatoria
```

### Scripts Disponíveis

```bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npm run start            # Iniciar em produção
npm run lint             # Linting
npm run supabase:gen-types  # Gerar types TypeScript do Supabase
npm run supabase:link    # Vincular ao projeto Supabase
```

---

## 📋 Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/              # Login, registro, recuperação de senha
│   ├── (dashboard)/
│   │   ├── gestor/          # Painel do Gestor (13 módulos)
│   │   ├── professor/       # Painel do Professor (9 módulos)
│   │   └── estudante/       # Painel do Estudante (8 módulos)
│   └── api/                 # 16 grupos de endpoints REST
├── components/
│   ├── dashboard/           # Componentes dos painéis
│   └── ui/                  # Design system (Radix UI + Tailwind)
├── lib/
│   ├── ai/                  # Config IA, prompts do DOT, busca na web
│   └── supabase/            # Clientes server/client
└── types/                   # Types gerados do banco + customizados
```

---

## 🔒 Segurança

- **Row Level Security (RLS)**: Cada escola só acessa seus próprios dados
- **JWT + Supabase Auth**: Tokens seguros com refresh automático
- **Middleware de rotas**: Proteção de dashboards por role
- **Validação dupla**: Frontend (Zod) + Backend (API routes)
- **Rate Limiting**: Proteção contra abuso nos endpoints de IA
- **Service Role isolado**: Apenas no servidor, nunca exposto ao cliente

---

## 📄 Documentação Adicional

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Guia de deploy na Vercel
- [CHANGELOG.md](./CHANGELOG.md) — Histórico de versões
- **Documentação interativa** disponível em `/gestor/documentacao` (usuários autenticados)

---

*City Coop Platform v2.16.0 · Inteligência e Cooperação em cada detalhe. 🤝*
