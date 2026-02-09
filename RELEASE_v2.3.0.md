# 🎓 Release v2.3.0 - Gestão Total de Educadores e Alunos

Esta é uma atualização maior que traz o controle completo sobre os usuários da plataforma para o perfil Gestor (Superadmin).

## 🚀 Novas Funcionalidades

### 👨‍🏫 CRUD de Professores
- **Nova Tabela Premium**: Listagem completa de educadores com visualização de CPF, Escola e Telefone.
- **Gestão de Status**: Agora é possível ativar ou desativar o acesso de professores em tempo real.
- **Alocação Rápida**: Modal para editar dados e vincular professores a escolas de forma intuitiva.

### 🎓 CRUD de Estudantes
- **Tabela Refatorada**: Interface premium para gestão de alunos, incluindo busca por CPF.
- **Controle de Matrícula**: Facilidade para atualizar a série (incluindo EJA) e a escola do aluno.
- **Status Ativo/Inativo**: Bloqueio de acesso para alunos que não fazem mais parte do programa.

### 🛠️ Melhorias Técnicas
- **API Unificada**: A rota `/api/gestor/users` agora suporta todas as operações de CRUD com validação de CPF e Toggle de status.
- **Dados Sincronizados**: Superadmins têm agora uma visão unificada de todos os CPFs na gestão geral de usuários.
- **Versão**: Atualizado para `city-coop-platform@2.3.0`.

---
*City Coop Platform - Escalando a gestão cooperativa com segurança e eficiência.*
