# 🚀 Release v2.2.5 - Avatar & Segurança

Esta versão foca na personalização da conta e no reforço da segurança, permitindo o upload de fotos de perfil e a troca de senha por parte dos usuários.

## 📋 Alterações Principais

### 📸 Avatar do Usuário
- **Upload de Imagem**: Implementada integração com Supabase Storage (bucket `avatars`) para upload de fotos.
- **Exibição Dinâmica**: Fotos de perfil agora são exibidas nos cards laterais e no componente de perfil.
- **Persistência Master**: Scripts de reparo garantem que o link do avatar seja salvo em todas as tabelas (`gestors`, `managers`, `teachers`, `students`).

### 🔐 Segurança (Troca de Senha)
- **Central de Segurança**: Funcionalidade de troca de senha integrada em todos os painéis (Gestor, Professor, Estudante).
- **Validação Robustecida**: Verificação de força de senha e coincidência de campos no frontend.
- **Supabase Auth Sync**: Atualização direta e segura via Supabase Identity.

### 🎓 Alocação e Matrícula de Estudantes
- **Gestão de Alunos**: Implementada tabela de alunos no painel do gestor com suporte a alocação de escola e série.
- **Busca Global Resiliente**: Novo sistema de busca que localiza alunos em toda a rede corporativa, ignorando restrições de escola para casos de transferência.
- **Matrícula Facilitada**: Administradores agora podem matricular alunos em qualquer turma com permissões totais de sistema.
- **Vínculo Automático**: Sincronização automática do `school_id` ao matricular alunos que ainda não possuem vínculo escolar.

### 📚 Modalidade EJA
- **Suporte Nativo**: Implementado suporte completo para a modalidade EJA (Educação de Jovens e Adultos) em turmas, alunos e formulários de registro.
- **Validação Específica**: Atualizados validadores de série para incluir a nova modalidade em todos os fluxos do sistema.

### 🛠️ Notas Técnicas
- **Migration**: Lançados scripts `supabase/migrations/20260208_add_eja_grade.sql` e reparos de AVATAR.
- **API**: Atualizadas rotas `/api/school/students` e `/api/classes/[id]/students` com lógica administrativa e bypass de RLS.
- **TypeScript Clean Build**: Corrigidos erros de inferência e tipagens `never` para garantir deploys estáveis na Vercel.
- **UI**: Melhoria no tratamento de erros de upload e feedback de busca no `AddStudentDialog`.

---
*City Coop Platform - Desenvolvido com ❤️ para a educação.*
