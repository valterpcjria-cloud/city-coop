# PRD: Painel do Estudante Mobile — City Coop

Este documento define os requisitos e o design system para a versão mobile da Área do Estudante, visando uma experiência "premium", fluída e de alta performance.

---

## 1. Visão Geral
Transformar a Área do Estudante em um Web App (PWA-ready) que se comporte como um aplicativo nativo, priorizando a usabilidade com uma mão ("thumb-friendly") e estética moderna.

### Objetivos Principais:
- **Aesthetics**: Interface ultra-moderna com glassmorphism e cores vibrantes.
- **Fluidity**: Transições de página suaves e feedbacks táteis.
- **Performance**: Tempo de carregamento instantâneo e otimização de renderização.

---

## 2. Arquitetura de Navegação

A navegação será reestruturada para o mobile seguindo o padrão de **Bottom Tab Bar** (principal) e **Drawer lateral** (secundário).

### 2.1. Bottom Tab Bar (Os 5 Pilares)
Localizada fixamente no rodapé com suporte a Safe Area do iOS.

1.  **Home** (`/estudante`): Dashboard principal com visão geral.
2.  **Núcleo** (`/estudante/nucleo`): Acompanhamento do núcleo cooperativo.
3.  **Atividades** (`/estudante/atividades`): Lista de tarefas pendentes e concluídas.
4.  **IA Chat** (`/estudante/chat`): Chat direto com o DOT Assistente.
5.  **Menu**: Gatilho para abrir o Drawer lateral.

### 2.2. Mobile Drawer (Navegação Secundária)
Slide-in da direita cobrindo 80% da tela.

- **Header**: Avatar do aluno, nome, email e nome do Núcleo em destaque.
- **Seções**:
    - **Progresso**: Formação & Scores (`/estudante/formacao`).
    - **Engajamento**: Eleições (`/estudante/eleicoes`), Eventos (`/estudante/evento`).
    - **Conta**: Perfil (`/estudante/perfil`), Configurações (`/estudante/configuracoes`).
- **Footer**: Botão "Sair" em destaque (vermelho/soft).

---

## 3. Especificações por Tela (Experience Design)

### 3.1. Dashboard (Home)
- **Cartões de KPI**: Cards menores e mais densos para Scores.
- **Próxima Atividade**: Um card flutuante em destaque com a atividade mais urgente.
- **Feed de Eventos**: Scroll horizontal para próximos eventos do núcleo.

### 3.2. Atividades (Minhas Tarefas)
- **Filtros rápidos**: Badges de "Pendentes" e "Concluídas" fixas abaixo do header.
- **Activity Cards**: Lista vertical com design moderno (sombras suaves e cantos arredondados).
- **Empty State**: Ilustração minimalista e botão de "Conversar com IA" caso não haja tarefas.

### 3.3. Formação & Scores
- **Dashboard de Scores**: Gráficos circulares interativos que reagem ao toque.
- **Conhecimento**: Progress bars animadas para os Ciclos de Conhecimento.

### 3.4. Chat IA (DOT Mobile)
- **Interface Imersiva**: Desabilita o Bottom Nav enquanto o teclado estiver aberto.
- **Bubbles de Chat**: Design de bolhas modernas com sombras sutis e cores gradientes.
- **Sugestões Rápidas**: "Chips" acima da barra de input sugere perguntas ao DOT.

---

## 4. Design System Mobile (Estética Premium)

### Cores & Atmosfera
- **Base**: Fundo em `slate-50` com elementos em branco puro.
- **Brand**: Uso de `city-blue` para ações principais e `coop-orange` para alertas/scores.
- **Efeitos**: Glassmorphism (`backdrop-blur`) em headers e bottom bars.

### Tipografia
- **Títulos**: `Outfit` com pesos variados para hierarquia clara.
- **Corpo**: `Geist Sans` para máxima legibilidade em telas pequenas.

### Micro-interações
- **Feedback Visual**: Escalonamento leve (`scale-95`) ao tocar em botões.
- **Skeleton Screens**: Carregamento elegante enquanto os dados do Supabase são buscados.

---

## 5. Requisitos Técnicos & Performance

- **Frontend**: Next.js 15, Tailwind CSS 4, Lucide Icons.
- **Performance Goals**:
    - LCP (Largest Contentful Paint): < 1.2s
    - CLS (Cumulative Layout Shift): 0
    - Interaction to Next Paint (INP): < 50ms
- **Mobile First**: CSS utilities `pb-safe` e `pt-safe` obrigatórios para evitar cortes em notches.

---

## 6. Plano de Implementação

1.  **Fase 1: Infraestrutura** (CSS Safe Areas, Navigation Manager).
2.  **Fase 2: Navegação** (BottomNav, Drawer, Header Mobile).
3.  **Fase 3: Core Dash** (Adaptação da Home e Atividades).
4.  **Fase 4: IA & Scores** (Chat DOT Mobile e Gráficos de Score).
5.  **Fase 5: Polish** (Animações Framer Motion, Transições de Página).
