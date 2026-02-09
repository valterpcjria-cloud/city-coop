# 🚀 Release v2.2.9 - Estabilização de Login

Esta versão foca na correção de instabilidades visuais e de redirecionamento durante o processo de autenticação, proporcionando um acesso mais fluido à plataforma.

## 📋 Alterações Principais

### 🔐 Estabilização de Autenticação
- **Fim do "Piscar" (Flash)**: Implementada uma tela de carregamento (spinner) inteligente que segura a interface de login enquanto a sessão do usuário é verificada. Isso elimina o flash visual do formulário antes do redirecionamento automático.
- **Sincronização de Dados**: O Middleware foi atualizado para utilizar exclusivamente a tabela `gestors`, eliminando conflitos com referências antigas à tabela `managers`.
- **Redirecionamento Inteligente**: Refinada a lógica que encaminha Gestores, Professores e Estudantes para seus respectivos painéis assim que o login é detectado.

### 🛠️ Notas Técnicas
- **Middleware**: Ajustada a lógica de `updateSession` em `src/lib/supabase/middleware.ts`.
- **UI de Login**: Adicionado estado `isCheckingSession` e componente de fallback na página de login.
- **Versão**: Atualizado para `city-coop-platform@2.2.9`.

---
*City Coop Platform - Estabilidade e Performance para sua Cooperativa.*
