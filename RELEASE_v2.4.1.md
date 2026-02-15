
# Versão 2.4.1 - Correção Visibilidade de Gestores 🚀👥

Esta versão corrige um problema na listagem de usuários onde usuários do tipo Gestor não estavam sendo exibidos mesmo após a criação bem-sucedida.

## ✅ O que foi corrigido:

### 👥 Gestão de Usuários
- **Correção da Consulta SQL**: Removida a tentativa de junção (join) com a tabela de escolas para usuários do tipo Gestor. Como gestores são usuários globais na plataforma e não possuem um `school_id` vinculado, a consulta anterior falhava silenciosamente e ocultava os gestores da lista.
- **Sincronização entre API e Dashboard**: A correção foi aplicada tanto na rota de API (`/api/gestor/users`) quanto na renderização inicial do dashboard de usuários para garantir consistência total.

---
*Construído com ❤️ pela equipe City Coop.*
