# 🚀 Release v2.2.3 - Gestão de Usuários & CPF

Esta versão traz melhorias críticas na autenticação de superadministradores e a inclusão do campo CPF para professores e alunos.

## 📋 Alterações Principais

### 🔐 Autenticação e Gestão de Usuários
- **Fix Superadmin Access**: Corrigido erro de acesso negado na página de usuários. Agora a validação ignora o RLS do Supabase usando a `service_role`.
- **User Management API**: Atualização das rotas de API para suportar corretamente campos opcionais e evitar erros de UUID.
- **Sidebar Integration**: Link de "Gestão de Usuários" integrado permanentemente na sidebar do gestor.

### 🛂 Novidade: Campo CPF
- **Cadastro de Professor/Aluno**: Adicionado campo CPF no modal de criação e edição.
- **Unicidade de CPF**: Implementado trigger no banco de dados que garante que um CPF seja único em todo o sistema (evita que um professor tenha o mesmo CPF de um aluno).
- **Mapeamento de Dados**: CPF agora é carregado corretamente na lista e no formulário de edição.

## 🛠️ Notas Técnicas
- **Migration**: Lançada a migration `20260207_add_cpf_column.sql`.
- **Database**: Adicionados índices nas colunas de CPF para performance.
- **Form Synch**: Corrigido bug onde campos ficavam vazios ao abrir o modal de edição (useEffect sync).

---
*City Coop Platform - Desenvolvido com ❤️ para a educação.*
