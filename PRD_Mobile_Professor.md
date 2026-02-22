# 📱 PRD — Painel do Professor Mobile
## City Coop • Versão Mobile Responsiva

---

## 1. Visão Geral do Produto

### Objetivo
Transformar o Painel do Professor em uma experiência **mobile-first premium**, mantendo **100% das funcionalidades existentes** com uma interface moderna, intuitiva e de alto desempenho. O professor deve conseguir realizar todas as suas tarefas — desde gerenciar turmas até interagir com a IA — diretamente pelo celular, com a mesma eficiência do desktop.

### Problema Atual
O layout atual do Painel do Professor utiliza uma sidebar fixa de 256px (`w-64 hidden md:block`) que é **completamente escondida em telas menores que 768px**, sem nenhuma alternativa de navegação mobile. Isso torna o painel **inacessível em dispositivos móveis**.

### Público-alvo
Professores da rede de cooperativas escolares que precisam acessar o painel em movimento, entre aulas, ou em contextos onde o desktop não está disponível.

---

## 2. Inventário Completo de Funcionalidades

> [!IMPORTANT]
> **Nenhuma funcionalidade será removida.** Todas as telas e ações abaixo devem estar 100% funcionais no mobile.

### 2.1 Módulos Existentes

| # | Módulo | Rota | Tipo | Complexidade Mobile |
|---|--------|------|------|-------------------|
| 1 | **Visão Geral (Dashboard)** | `/professor` | Server Component | 🟡 Média — Grid de 4 cards + 2 painéis |
| 2 | **Diretrizes** | `/professor/diretrizes` | Client Component (788 linhas) | 🔴 Alta — Tabs + Accordions + Dados densos |
| 3 | **Estudantes** | `/professor/estudantes` | Server Component + Table | 🔴 Alta — Tabela de dados com ações |
| 4 | **Minhas Turmas** | `/professor/turmas` | Server Component | 🟡 Média — Grid de cards |
| 5 | **Turma Detalhe** | `/professor/turmas/[id]` | Server Component | 🟡 Média — Detalhes + Sub-rotas |
| 6 | **Nova Turma** | `/professor/turmas/nova` | Formulário | 🟢 Baixa — Form único |
| 7 | **Avaliações** | `/professor/avaliacoes` | Server Component | 🟡 Média — Cards com badges |
| 8 | **Avaliação Detalhe + Respostas** | `/professor/turmas/[id]/avaliacoes/[assessmentId]` | Server Component | 🟡 Média |
| 9 | **Nova Avaliação** | `/professor/turmas/[id]/avaliacoes/nova` | Formulário | 🟢 Baixa |
| 10 | **Eventos** | `/professor/eventos` | Server Component | 🟡 Média — Cards com status |
| 11 | **Evento Detalhe** | `/professor/turmas/[id]/eventos/[eventId]` | Server Component | 🟡 Média |
| 12 | **Eleições** | `/professor/eleicoes` | Client Component | 🟡 Média — Listagem + status |
| 13 | **Nova Eleição** | `/professor/eleicoes/nova` | Formulário | 🟢 Baixa |
| 14 | **Eleição Detalhe** | `/professor/eleicoes/[id]` | Server Component | 🟡 Média |
| 15 | **Resultados Eleição** | `/professor/eleicoes/[id]/resultados` | Server Component | 🟡 Média |
| 16 | **DOT Assistente (IA Chat)** | `/professor/ia` | Client Component (376 linhas) | 🔴 Alta — Chat + History Sidebar |
| 17 | **Criar Avaliação IA** | `/professor/ia/avaliacoes` | Client Component | 🟡 Média |
| 18 | **Núcleos** | `/professor/turmas/[id]/nucleos` | Server Component | 🟡 Média |
| 19 | **Perfil** | `/professor/perfil` | Shared Component | 🟢 Baixa |
| 20 | **Configurações** | `/professor/configuracoes` | Shared Component | 🟢 Baixa |

---

## 3. Arquitetura de Navegação Mobile

### 3.1 Bottom Tab Bar (Navegação Principal)

```
┌─────────────────────────────────────────────┐
│                  CONTEÚDO                   │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│  🏠    📚    👥    📝    ≡                  │
│ Home  Turmas Alunos Aval  Menu              │
└─────────────────────────────────────────────┘
```

| Ícone | Label | Rota | Justificativa |
|-------|-------|------|---------------|
| 🏠 | Home | `/professor` | Acesso rápido ao dashboard |
| 📚 | Turmas | `/professor/turmas` | Ação mais frequente |
| 👥 | Alunos | `/professor/estudantes` | Consulta constante |
| 📝 | Aval. | `/professor/avaliacoes` | Gestão de avaliações |
| ≡ | Menu | Abre Drawer | Acesso a todas as outras seções |

### 3.2 Drawer Menu (Overflow Navigation)

Ao tocar no botão "Menu" (≡), abre um **slide-in drawer** da direita com:

```
┌──────────────────────────────┐
│  ✕                    MENU   │
│─────────────────────────────│
│  👤 Nome do Professor        │
│  📧 email@escola.com         │
│─────────────────────────────│
│  📖 Diretrizes               │
│  🗳️ Eleições                 │
│  📅 Eventos                  │
│─────────────────────────────│
│  ⚡ FERRAMENTAS IA           │
│  🤖 DOT Assistente           │
│  ✨ Criar Avaliação IA       │
│─────────────────────────────│
│  👤 Perfil                   │
│  ⚙️ Configurações            │
│─────────────────────────────│
│  🚪 Sair                     │
└──────────────────────────────┘
```

### 3.3 Header Mobile

```
┌─────────────────────────────────────────────┐
│  [Logo]   Painel do Professor    [Avatar]   │
└─────────────────────────────────────────────┘
```

- **Logo** reduzido (ícone 32px) com link para `/professor`
- **Avatar** com dropdown existente (Perfil, Config, Sair)
- **Sticky top** com `backdrop-blur-sm` para transparência premium

---

## 4. Design System Mobile

### 4.1 Princípios de Design

| Princípio | Implementação |
|-----------|---------------|
| **Touch-First** | Áreas de toque mínimas de 44×44px (WCAG) |
| **Thumb Zone** | Ações primárias na parte inferior da tela |
| **Progressive Disclosure** | Informações em camadas, expandíveis |
| **Consistent Motion** | Transições de 200-300ms com `ease-out` |
| **Visual Hierarchy** | Tipografia escalonada e espaçamento generoso |

### 4.2 Paleta de Cores (Manter existente)

```css
--city-blue: #4A90D9       /* Primária */
--city-blue-dark: #3B7AC2  /* Hover/Active */
--coop-orange: #F5A623     /* Acentuação */
--tech-gray: #6B7C93       /* Texto secundário */
--bg-surface: #FAFBFC      /* Background */
--glass-bg: rgba(255,255,255,0.7)  /* Glassmorphism */
```

### 4.3 Tipografia Mobile

| Element | Desktop | Mobile |
|---------|---------|--------|
| Page Title (h2) | `text-3xl` (30px) | `text-2xl` (24px) |
| Card Title | `text-lg` (18px) | `text-base` (16px) |
| Body Text | `text-sm` (14px) | `text-sm` (14px) |
| Stat Numbers | `text-3xl` (30px) | `text-2xl` (24px) |
| Labels / Badges | `text-xs` (12px) | `text-xs` (12px) |

### 4.4 Spacing & Grid

```css
/* Mobile Container */
padding: 16px;           /* p-4 */
gap: 12px;               /* gap-3 */
border-radius: 12px;     /* rounded-xl */

/* Cards */
padding: 16px;           /* p-4 */
min-height: 80px;        /* Altura mínima */
```

---

## 5. Especificações por Tela

### 5.1 📊 Dashboard (Visão Geral)

**Layout atual:** Grid 4 colunas (stats) + Grid 7 colunas (4+3 painéis)

**Layout mobile:**

```
┌─────────────────────────────┐
│  Visão Geral          [+]  │  ← Header compacto
│  Acompanhe suas turmas      │
├─────────────────────────────┤
│ ┌────────┐ ┌────────┐       │  ← Grid 2x2 de stats
│ │ Turmas │ │ Alunos │       │
│ │  12    │ │  156   │       │
│ └────────┘ └────────┘       │
│ ┌────────┐ ┌────────┐       │
│ │ Aval.  │ │ Event. │       │
│ │  8     │ │  3     │       │
│ └────────┘ └────────┘       │
├─────────────────────────────┤
│ Turmas Recentes             │  ← Full-width card
│ [Ver todas as turmas →]     │
├─────────────────────────────┤
│ Atividades Recentes         │  ← Full-width card
│ • Ação 1...                 │
│ • Ação 2...                 │
└─────────────────────────────┘
```

**Mudanças no código:**
- Stats: `grid-cols-2` no mobile (já é `md:grid-cols-2 lg:grid-cols-4`, falta `grid-cols-2` base)
- Painéis inferiores: `col-span-full` em mobile (empilhados verticalmente)
- Header: Ocultar botão "Nova Turma" no mobile → substituir por FAB (Floating Action Button) ou ação no bottom bar

### 5.2 📚 Minhas Turmas

**Layout mobile:**
```
┌─────────────────────────────┐
│  Minhas Turmas        [+]  │
│  Gerencie suas turmas       │
├─────────────────────────────┤
│ ┌───────────────────────┐   │  ← Cards full-width
│ │ 🔵 Turma Alpha        │   │     empilhados
│ │    ABC123              │   │
│ │    👤 32 estudantes    │   │
│ │    📅 Jan-Jun 2026     │   │
│ │    [Ver Detalhes →]    │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ 🔵 Turma Beta         │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

**Mudanças no código:**
- Grid: `grid-cols-1` base (já funciona pois `md:grid-cols-2 lg:grid-cols-3`)
- Cards: Full-width com swipe-to-action (opcional)
- Botão "Nova Turma": FAB no canto inferior direito

### 5.3 👥 Estudantes

**Problema:** Tabela de dados é **incompatível com mobile** por natureza.

**Solução: Card List View**

```
┌─────────────────────────────┐
│  🔍 Buscar estudante...     │  ← Searchbar
├─────────────────────────────┤
│ ┌───────────────────────┐   │
│ │ 👤 Maria Silva        │   │  ← Card por aluno
│ │    3º ano             │   │
│ │    ✅ Ativo            │   │
│ │    [···]              │   │     Menu de ações
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ 👤 João Santos        │   │
│ │    2º ano             │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

**Implementação:**
- Detectar viewport < 768px → renderizar `<StudentCardList>` ao invés de `<StudentsTable>`
- Cada card mostra: Nome, Série, Status, Menu de ações (···)
- Ações: Ver detalhes, Editar, etc.

### 5.4 📝 Avaliações

**Layout mobile:**
- Cards full-width empilhados
- Badge de tipo (Cooperativismo, Participação, etc.) no topo do card
- Progresso visual com barra de cor
- Ações de card via long-press ou menu contextual

### 5.5 📅 Eventos

**Layout mobile:**
- Timeline vertical com cards expandíveis
- Status visual com badges coloridos
- Datas em formato compacto `dd/MM`
- Filtro deslizante por status (Todos, Ativos, Concluídos)

### 5.6 🗳️ Eleições

**Layout mobile:**
- Cards empilhados com status visual proeminente
- Progress steps para fases (Configuração → Inscrições → Campanha → Votação → Encerrada)
- Botões de ação touch-friendly

### 5.7 📖 Diretrizes (Alta Complexidade)

**Problema:** 788 linhas de conteúdo denso com Tabs + Accordions aninhados.

**Solução Mobile:**

```
┌─────────────────────────────┐
│  Diretrizes do Programa     │
├─────────────────────────────┤
│ [Fase 1] [Fase 2] [Fase 3] │  ← Tabs horizontais scrolláveis
├─────────────────────────────┤
│  📚 Fase 1 — Formação       │
│  Duração: 6 meses           │
│                              │
│  ▸ Atividades Pedagógicas   │  ← Accordions nativos
│  ▸ Governança               │
│  ▸ Sistema Gera             │
│                              │
│  ▾ Papel do Professor       │  ← Expandido
│    • Facilitador             │
│    • Mediador                │
│    • Avaliador               │
└─────────────────────────────┘
```

**Implementação:**
- Tabs: `overflow-x-auto` com scroll snap horizontal
- Accordions: Manter comportamento, aumentar touch targets
- Texto: Reduzir padding interno e usar `text-sm`
- Tabelas internas: Converter para listas mobile-friendly

### 5.8 🤖 DOT Assistente IA (Chat)

**Layout mobile:**

```
┌─────────────────────────────┐
│  [≡] DOT Assistente   [+]  │  ← Header com toggle sidebar
├─────────────────────────────┤
│                              │
│  ┌─────────────────────┐    │
│  │ 🤖 Olá! Como posso  │    │  ← Mensagem do DOT
│  │    ajudar hoje?      │    │
│  └─────────────────────┘    │
│                              │
│      ┌─────────────────┐    │
│      │ Preciso criar   │    │  ← Mensagem do professor
│      │ uma avaliação   │    │
│      └─────────────────┘    │
│                              │
├─────────────────────────────┤
│ [💬 Digite sua mensagem... ] │  ← Input fixo no bottom
│                        [➤]  │
└─────────────────────────────┘
```

**Implementação:**
- Chat History Sidebar: **Sheet/Drawer** em vez de sidebar fixa
- Input: `position: sticky; bottom: 0` com safe-area-inset
- Mensagens: Full-width com max-width 85%
- Auto-scroll mantido e otimizado
- Teclado virtual: Ajustar viewport com `visualViewport` API

### 5.9 👤 Perfil & ⚙️ Configurações

**Nota:** Ambas usam componentes compartilhados (`ProfileScreen`, `SettingsScreen`). A responsividade mobile deve ser aplicada nesses componentes shared, beneficiando todos os painéis (Professor, Gestor, Estudante).

---

## 6. Componentes Mobile Novos

### 6.1 `<MobileBottomNav>`

```tsx
// Componente de navegação inferior mobile-only
// Visível apenas em viewport < 768px
// 5 itens com ícone + label
// Indicador ativo com gradiente brand
// Safe area bottom padding (iOS notch)
```

### 6.2 `<MobileDrawer>`

```tsx
// Drawer lateral (slide from right)
// Backdrop com blur
// Lista de navegação secundária
// Info do usuário + avatar
// Botão de Sair
// Animação: translate-x com spring easing
```

### 6.3 `<MobileHeader>`

```tsx
// Header compacto para mobile
// Logo reduzido + Título + Avatar
// Sticky com backdrop-blur
// Altura: 56px (h-14)
```

### 6.4 `<StudentCardList>`

```tsx
// Alternativa mobile para StudentsTable
// Card por estudante com info compacta
// Ações via menu contextual (···)
// Virtualização para listas longas
```

### 6.5 `<FloatingActionButton>`

```tsx
// FAB para ações primárias (Nova Turma, Nova Avaliação)
// Posição: bottom-right acima do BottomNav
// Animação: scale-in on mount
// Gradiente brand (city-blue → city-blue-dark)
```

---

## 7. Especificações de Performance

### 7.1 Metas de Performance

| Métrica | Meta | Medição |
|---------|------|---------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Core Web Vitals |
| **FID** (First Input Delay) | < 100ms | Core Web Vitals |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Core Web Vitals |
| **TTI** (Time to Interactive) | < 3.5s | Lighthouse |
| **Bundle Size Increase** | < 15KB gzip | Webpack Analyzer |
| **Animações** | 60fps | Chrome DevTools |

### 7.2 Otimizações Técnicas

1. **Code Splitting:** Componentes mobile carregados via `dynamic()` do Next.js
2. **Lazy Loading:** Bottom Nav e Drawer carregados apenas em viewport mobile
3. **CSS Containment:** `contain: layout style paint` nos cards
4. **Image Optimization:** Logos/avatares com `next/image` e tamanhos responsivos
5. **Virtualização:** Listas longas (Estudantes, Avaliações) com `react-window` ou scroll infinito
6. **Touch Optimization:** `touch-action: manipulation` para reduzir delay de 300ms
7. **Safe Area:** `env(safe-area-inset-bottom)` para dispositivos com notch

### 7.3 Breakpoints

```css
/* Sistema de breakpoints */
xs: 0px      /* Mobile portrait */
sm: 640px    /* Mobile landscape */
md: 768px    /* Tablet / Transição Desktop */
lg: 1024px   /* Desktop */
xl: 1280px   /* Desktop wide */
```

**Regra de transição:** O layout mobile é ativo para `< md (768px)`. Acima disso, mantém o layout desktop existente inalterado.

---

## 8. Padrões de Interação Mobile

### 8.1 Gestos

| Gesto | Ação | Contexto |
|-------|------|----------|
| **Swipe Right** | Abrir Drawer | Qualquer tela |
| **Swipe Left** | Fechar Drawer | Drawer aberto |
| **Pull to Refresh** | Recarregar dados | Listas e Dashboard |
| **Long Press** | Menu contextual | Cards de turma/avaliação |
| **Tap** | Navegar / Expandir | Padrão |

### 8.2 Feedback Tátil

- **Ripple effect** nos botões (CSS-only)
- **Haptic feedback** opcional via `navigator.vibrate()`
- **Loading skeletons** durante transições de página
- **Toast notifications** com posicionamento mobile (topo, evitar bottom nav)

### 8.3 Estados Vazios

Todos os estados vazios existentes devem ser mantidos com:
- Ícone centralizado + texto descritivo
- CTA com botão de ação principal
- Animação sutil (`animate-in zoom-in`)

---

## 9. Acessibilidade Mobile

| Requisito | Implementação |
|-----------|---------------|
| **Touch targets** | Mín. 44×44px |
| **Color contrast** | Ratio ≥ 4.5:1 (AA) |
| **Focus management** | Trap focus no Drawer quando aberto |
| **Screen readers** | `aria-label` em ícone-only buttons |
| **Reduced motion** | `@media (prefers-reduced-motion)` para desabilitar animações |
| **Text scaling** | Suportar até 200% zoom sem quebra de layout |

---

## 10. Fluxo de Implementação

### Fase 1: Infraestrutura de Navegação (Prioridade Alta)
1. Criar `<MobileBottomNav>` com 5 tabs
2. Criar `<MobileDrawer>` para navegação secundária
3. Criar `<MobileHeader>` compacto
4. Atualizar `layout.tsx` para detectar viewport e renderizar condicionalmente

### Fase 2: Páginas Core (Prioridade Alta)
5. Dashboard — Grid 2x2 stats, painéis empilhados
6. Turmas — Cards full-width
7. Avaliações — Cards full-width com badges
8. Estudantes — `StudentCardList` como alternativa mobile

### Fase 3: Páginas Secundárias (Prioridade Média)
9. Eventos — Timeline mobile
10. Eleições — Cards com progress steps
11. Diretrizes — Tabs scrolláveis + accordions otimizados

### Fase 4: Páginas Interativas (Prioridade Média)
12. DOT Assistente IA — Chat mobile-first com Sheet sidebar
13. Criar Avaliação IA — Formulário responsivo
14. Formulários de criação (Nova Turma, Nova Eleição, etc.)

### Fase 5: Polish & Performance (Prioridade Alta)
15. FAB (Floating Action Button) contextual
16. Pull-to-refresh
17. Loading skeletons
18. Testes de performance (Lighthouse ≥ 90)
19. Testes de acessibilidade

---

## 11. Critérios de Aceitação

### Funcionalidade
- [ ] Todas as 20 telas acessíveis via navegação mobile
- [ ] Nenhum recurso removido ou degradado
- [ ] Formulários funcionais com teclado virtual
- [ ] Chat IA totalmente operacional no mobile

### UX/Design
- [ ] Bottom Navigation intuitiva com 5 itens
- [ ] Drawer com todas as seções secundárias
- [ ] Cards touch-friendly (mín. 44px targets)
- [ ] Transições suaves (200-300ms)
- [ ] Feedback visual em todas as interações

### Performance
- [ ] LCP < 2.5s em 4G
- [ ] CLS < 0.1
- [ ] Lighthouse Performance ≥ 90
- [ ] Animações a 60fps
- [ ] Bundle size increase < 15KB gzip

### Compatibilidade
- [ ] iOS Safari 15+
- [ ] Chrome Android 90+
- [ ] Samsung Internet 15+
- [ ] Viewport: 320px a 767px

---

## 12. Referências Visuais

### Inspiração de Design

| Aspecto | Referência |
|---------|-----------|
| Bottom Nav | Google Material Design 3 |
| Card Layout | Apple Health / Google Classroom |
| Chat Mobile | WhatsApp / Telegram |
| Drawer | iOS Settings / Google Maps |
| Stats Cards | Notion Mobile / Linear Mobile |
| Glassmorphism | Apple iOS Design Language |

### Identidade Visual Mantida
- Gradientes `city-blue → coop-orange` 
- Glassmorphism com `backdrop-blur-sm`
- Border-left accent nos cards
- Neon hover effects no logo
- Brand gradient headers

---

> [!TIP]
> Este PRD foi construído com base na análise completa de **20 telas** e **11 módulos** do Painel do Professor existente. A implementação deve seguir a ordem das fases para entregar valor incremental.
