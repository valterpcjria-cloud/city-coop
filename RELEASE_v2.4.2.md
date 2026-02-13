# Versão 2.4.2 - Reset de Senha Manual 🚀🔑

Esta versão introduz a capacidade de gestores resetarem senhas de usuários manualmente, digitando uma nova senha diretamente no painel.

## ✅ O que há de novo:

### 👥 Gestão de Usuários
- **Reset de Senha Manual**: Ao clicar em "Resetar Senha" na listagem de usuários, agora você pode escolher entre:
    1. **Enviar link por email**: Mantém o fluxo tradicional de recuperação de conta.
    2. **Definir senha manualmente**: Permite que o gestor digite uma nova senha para o usuário instantaneamente.
- **Segurança**: O reset manual utiliza o `supabase.auth.admin` para garantir que apenas gestores autorizados possam realizar a operação, sem a necessidade da senha antiga do usuário.

---
*Construído com ❤️ pela equipe City Coop.*
