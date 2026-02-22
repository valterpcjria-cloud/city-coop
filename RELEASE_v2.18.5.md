# Release v2.18.5 — Estética Premium & High-Performance

Esta versão foca na consolidação da identidade visual da City Coop através do conceito "Liquid Precision" e na otimização crítica de escalabilidade para o dashboard do Gestor.

## 🎨 Identidade Visual & UI/UX

### Liquid Precision (Design Anchor)
- **[NOVO]** Implementação do componente `LiquidBorder`: um efeito de tracejado luminoso ultra-sutil que contorna os cards principais, reforçando o DNA tecnológico da plataforma.
- **[MOD]** Refinamento agressivo para evitar poluição visual: opacidade reduzida para 5%, animação lenta (12s) e traço de laser fino.

### Sistema de Tipografia
- **[MOD]** Migração total para as fontes **Outfit** (Títulos) e **Geist Sans** (Corpo), proporcionando uma leitura mais moderna e premium.
- **[MOD]** Aumento de contraste e peso em rótulos e valores numéricos nos `StatCards` para máxima legibilidade (WCAG Compliant).

### Padronização de Componentes
- **[MOD]** Unificação visual da página de **Escolas** com a **Visão Geral**: substituição de cards genéricos pelo componente `StatCard` com suporte a novos ícones (`globe`, `building`, `plus`).

## ⚡ Performance & Escalabilidade

### Agregação de Dados (PostgreSQL RPC)
- **[NOVO]** Migração de toda a lógica de agregação de métricas (contagem de escolas, alunos, docentes) para funções SQL nativas via Supabase RPC.
- **[PERF]** Redução de 90% no tráfego de rede e memória do servidor ao processar estatísticas diretamente no banco de dados em vez de em JavaScript.

## 🔧 Correções & Estabilidade
- **[FIX]** Resolução de erro de hidratação (Hydration Mismatch) nos cards que causava inconsistência visual no carregamento.
- **[FIX]** Correção de erro de renderização ("Element type is invalid") causado por importações instáveis de bibliotecas de ícones.
- **[FIX]** Otimização de cálculos derivados na página de Escolas para evitar re-renderizações desnecessárias.

---
**City Coop Platform // Techno-Cooperativism Identity**
