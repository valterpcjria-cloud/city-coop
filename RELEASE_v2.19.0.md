# Release v2.19.0 — Painel do Professor Mobile

Esta versão implementa a experiência mobile completa para o Painel do Professor, com navegação nativa, drawer interativo e suporte ao DOT Assistente IA no celular — sem remover nenhuma funcionalidade existente.

## 📱 Navegação Mobile

### Bottom Tab Bar
- **[NOVO]** Componente `MobileBottomNav` com 5 itens: Home, Turmas, Alunos, Avaliações e Menu.
- **[NOVO]** Indicador visual de aba ativa com cor `city-blue` e ícone mais espesso.
- **[NOVO]** Suporte a Safe Area (iOS notch) via CSS `env(safe-area-inset-bottom)`.
- **[UX]** Áreas de toque de 44px mínimo e `touch-manipulation` para resposta instantânea.

### Drawer Lateral
- **[NOVO]** Componente `MobileDrawer` (slide-in da direita) com seções organizadas: Programa, Inteligência Artificial e Conta.
- **[NOVO]** Exibição de avatar, nome e email do professor no header do drawer.
- **[NOVO]** Backdrop com `backdrop-blur-sm` e bloqueio de scroll do body quando aberto.
- **[UX]** Fechamento automático ao navegar para outra página.

### Gerenciador de Estado
- **[NOVO]** Componente `MobileNavManager` como orquestrador client-side que gerencia o estado open/close do drawer e renderiza Bottom Nav + Drawer condicionalmente.

## 🤖 DOT Assistente IA Mobile

- **[NOVO]** Componente `DotMobileChat` com layout mobile-first (input fixo na base, mensagens com scroll).
- **[NOVO]** Integração com Supabase Realtime para recebimento de respostas em tempo real.
- **[NOVO]** Indicador de "digitando" com animação de bounce.
- **[NOVO]** Server Action `sendDotMessage` para persistência segura de mensagens via Supabase.

## 🗄️ Banco de Dados

- **[NOVO]** Tabela `dot_chat_sessions` — sessões de conversa do DOT por professor.
- **[NOVO]** Tabela `dot_messages` — mensagens com suporte a roles (user, assistant, system) e metadata JSONB.
- **[NOVO]** Índices otimizados para consulta por professor e por sessão.
- **[NOVO]** RLS habilitado com políticas de isolamento por usuário.
- **[NOVO]** Publicação Realtime habilitada para ambas as tabelas.

## 🎨 CSS & Design

- **[NOVO]** Classes utilitárias `pb-safe` e `pt-safe` para suporte a Safe Area do iOS.
- **[NOVO]** Classe `scrollbar-hide` para ocultar barras de rolagem em áreas mobile.
- **[MOD]** Layout do professor com `pb-20 md:pb-6` para compensar o bottom nav no mobile.

## 🔧 Arquitetura

- **[ARCH]** Todos os componentes mobile usam `md:hidden` — desktop permanece 100% inalterado.
- **[ARCH]** Sidebar desktop e header existentes preservados sem alteração.
- **[ARCH]** Imports adaptados às convenções do projeto (`@/lib/supabase/server`, `@/lib/supabase/client`).

---

### Arquivos Adicionados
| Arquivo | Tipo |
|---------|------|
| `src/components/navigation/MobileBottomNav.tsx` | Componente |
| `src/components/navigation/MobileDrawer.tsx` | Componente |
| `src/components/navigation/MobileNavManager.tsx` | Componente |
| `src/components/ia/DotMobileChat.tsx` | Componente |
| `src/app/actions/chat.ts` | Server Action |
| `PRD_Mobile_Professor.md` | Documentação |

### Arquivos Modificados
| Arquivo | Alteração |
|---------|-----------|
| `src/app/(dashboard)/professor/layout.tsx` | + MobileNavManager + padding mobile |
| `src/app/globals.css` | + Safe Area + scrollbar-hide utilities |

---
**City Coop Platform // Mobile-First Cooperativism**
