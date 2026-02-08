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

### 🛠️ Notas Técnicas
- **Migration**: Lançado script `supabase/REPARO_AVATAR_COMPLETO.sql` para ajuste de colunas e RLS.
- **API**: Atualizada rota `/api/user/profile` para suportar `avatar_url`.
- **UI**: Melhoria no tratamento de erros de upload para exibir mensagens detalhadas do servidor.

---
*City Coop Platform - Desenvolvido com ❤️ para a educação.*
