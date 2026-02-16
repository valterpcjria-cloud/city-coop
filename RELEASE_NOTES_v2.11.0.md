# Release Notes - v2.11.0

## 🎨 Padronização de UI e UX (Notificações)

Esta versão foca na consistência visual e na experiência do usuário ao realizar ações críticas no sistema.

### 🔔 Novo Sistema de Confirmações
*   **ConfirmModal**: Implementação de um componente de confirmação premium, substituindo os diálogos nativos do navegador e `AlertDialogs` genéricos.
*   **useActionToast**: Novo hook para gerenciar o feedback de ações assíncronas (Carregando, Sucesso e Erro) de forma automática e elegante.
*   **Ações Críticas**: Padronização de diálogos de exclusão, ativação/desativação e alterações importantes em todos os módulos de gestão.

### 🛠️ Correções e Melhorias (Módulo Escolar)
*   **Validação de Formulários**: Ajuste no `SchoolModal` para permitir campos opcionais (E-mail, Website, INEP) sem erros de validação quando vazios.
*   **Sincronização de Dados**: Fim do "delay" visual ao atualizar escolas. Implementação de invalidação de cache forçada para garantir que novos dados apareçam instantaneamente.
*   **Sanitização**: Implementação de `.trim()` automático em todos os campos do formulário para evitar erros de espaços em branco.

### 🚀 Performance
*   **Otimização de Cache**: Melhoria no prefetch de dados da tabela de escolas, garantindo transições suaves entre páginas sem sacrificar a integridade dos dados atualizados.
