# Release Notes - v2.8.0

## 🚀 Segurança e Controle de Acesso

Esta versão foca na preparação do sistema para produção, restringindo o cadastro público e refinando as permissões de criação de usuários para garantir a integridade dos dados e o controle total pelos administradores.

### 🛡️ Restrição de Cadastro Público
*   Remoção de botões de "Cadastre-se" da Landing Page e Hero Section.
*   Limpeza da tela de login: remoção de links de cadastro, recuperação de senha e login social (Google).
*   Desativação da rota de registro pública com redirecionamento automático para o login.

### 👥 Gestão de Usuários Refinada
*   **Hierarquia de Criação**: Implementação de regras rígidas de criação de usuários.
    *   Apenas **Superadmins** podem criar novos **Gestores**.
    *   **Gestores** podem criar **Professores** e **Alunos**.
    *   **Professores** têm permissão exclusiva para criar **Alunos** de sua escola.
*   **Interface Dinâmica**: O modal de criação de usuários agora adapta as opções de cargo baseando-se no nível de acesso do usuário logado.

### ⚙️ Melhorias e Estabilidade
*   Reforço na validação de backend para criação de usuários.
*   Padronização do fluxo de alocação de escolas e séries no ato do cadastro.

---
**City Coop Platform** - *Semeando cooperação, colhendo futuro.*
