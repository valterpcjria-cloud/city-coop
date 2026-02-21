# Changelog — City Coop Platform

Todas as alterações notáveis do projeto estão documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [2.16.0] — 2026-02-20 — *The DOT 2.0 Update*

### Adicionado
- **DOT Assistente 2.0**: Nova identidade com tom profissional e técnico exclusivo de cooperativismo
- Blindagem pedagógica usando método socrático (não fornece respostas prontas)
- Tratamento padronizado de temas fora do escopo cooperativista
- Paridade total do chat do estudante com o do professor (botão limpar, seleção de modelo)

### Corrigido
- Visibilidade das mensagens corrigida para compatibilidade com a versão mais recente da Vercel AI SDK
- Scroll nativo substituindo `ScrollArea` em ambos os painéis (Estudante e Professor)
- Duplicação da mensagem de boas-vindas durante conversas (`useEffect` corrigido)
- Tipagem de rotas dinâmicas Next.js 16 (`params` como Promise)

### Melhorado
- Sincronia de histórico de chat com backend para trocas de modelo e limpezas

---

## [2.9.3] — 2026-02-19

### Corrigido
- Email do usuário não carregava no formulário de edição de usuários
- Permissão de reset de senha para Admins (agora restrita; exclusão só para SuperAdmins)

---

## [2.9.2] — 2026-02-19

### Adicionado
- CRUD completo de usuários no painel administrativo
- API `/api/gestor/users/[id]` com UPDATE e DELETE
- API `/api/gestor/users/[id]/reset-password` com controle de permissão por role

---

## [2.9.0] — 2026-02-18 — *Reports Overhaul*

### Adicionado
- Módulo de Relatórios completo substituindo "Alíquotas"
- Dashboard de KPIs consolidados em tempo real
- Exportação em CSV, XLSX e PDF
- Relatórios categorizados: escolas, alunos, engajamento, conexões produtivas

### Alterado
- Rota `/aliquotas` renomeada para `/relatorios` com redirect automático

---

## [2.8.0] — 2026-02-19

### Adicionado
- Filtro "Fórmulas" visível apenas para SuperAdmins no menu lateral
- Processo de hide/show condicional baseado em role no sidebar

---

## [2.7.0] — 2026-02-15 — *Data Import/Export*

### Adicionado
- Importação em massa de alunos via planilha (XLSX/CSV)
- Exportação de dados em múltiplos formatos
- Validação de dados na importação com relatório de erros

---

## [2.6.0] — 2026-02-12

### Adicionado
- Diretrizes pedagógicas para professores
- Módulo de configurações avançadas por turma

---

## [2.5.0] — 2026-02-10 — *AI Knowledge Base*

### Adicionado
- Upload e processamento de vídeos do YouTube (extração de transcrições)
- Busca na web com filtro de escopo cooperativista
- RAG com scoring por palavra-chave para recuperação de conhecimento relevante

---

## [2.4.0] — 2026-02-05

### Adicionado
- Módulo de Cooperativas Parceiras com matching geográfico
- Banco de oportunidades de estágio por região

---

## [2.3.6] — 2026-02-01

### Adicionado
- Geração inteligente de questões (objetiva, dissertativa, redação)
- Editor de questões com revisão manual pré-publicação

---

## [2.0.0] — 2026-01-15 — *Multi-Tenant Launch*

### Adicionado
- Arquitetura SaaS multi-tenant com isolamento por escola (RLS)
- Sistema de eleições democráticas com votação secreta
- DOT Assistente inicial (versão 1.0)
- Middleware de autenticação por role (Superadmin/Gestor/Professor/Estudante)
