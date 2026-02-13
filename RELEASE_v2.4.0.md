# Versão 2.4.0 - Correção Crítica na Gestão de Usuários 🚀🔒

Esta versão corrige um erro impeditivo na criação de novos usuários do tipo Gestor.

## ✅ O que foi corrigido:

### 👥 Gestão de Usuários
- **Correção da Tabela `gestors`**: Adição definitiva da coluna `cpf` que estava ausente no ambiente de produção, causando erro ao tentar cadastrar novos gestores.
- **Unicidade Global de CPF**: Refatoração do gatilho (trigger) de validação de CPF para garantir que um CPF seja único em toda a plataforma, impedindo duplicidade entre Gestores, Professores e Estudantes.
- **Sincronização de Banco de Dados**: Inclusão de comando para forçar a atualização do cache do Supabase (PostgREST) após a aplicação da correção.

## 📦 Instruções de Atualização (Supabase)
Para resolver o erro de criação de usuários, por favor execute o seguinte script no seu Editor SQL do Supabase:
- `supabase/migrations/20260213_fix_gestors_cpf_and_triggers.sql`

---
*Construído com ❤️ pela equipe City Coop.*
