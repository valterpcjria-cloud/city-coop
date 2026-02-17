# Versão v2.12.0 - Dashboard Cleanup & Real Data

Esta versão remove todos os dados de "Mockup" dos painéis e implementa a visualização de atividades reais da plataforma.

## 🚀 Novidades e Melhorias

### 📊 Dashboards com Dados Reais
- **Atividade Recente**: Substituição de dados estáticos por logs reais vindos da auditoria do sistema.
- **Componente `ActivityList`**: Novo componente padronizado para exibir ações de forma humanizada e com ícones contextuais.
- **Contadores Dinâmicos**:
    - **Gestor**: Escolas, Professores, Estudantes e Eventos em Revisão.
    - **Professor**: Turmas Ativas, Total de Alunos e Avaliações Criadas.
    - **Estudante**: Avaliações Pendentes e Próximo Evento do Núcleo.

### 🛠️ Backend & Infra
- Implementação da função `getRecentAuditLogs` em `src/lib/audit.ts` para consulta eficiente de logs de auditoria.
- Limpeza de placeholders `lorem ipsum` e arrays de teste `[1, 2, 3]` em todos os dashboards.

---
**Data da Release**: 17 de Fevereiro de 2026
**Responsável**: Antigravity AI
