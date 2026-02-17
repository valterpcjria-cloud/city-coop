# Release Notes - v2.13.0

## 🚀 Novas Funcionalidades
- **Módulo de Exclusão em Massa**: Ferramenta exclusiva para Superadmins que permite a remoção em massa de escolas e alunos filtrados por município.
- **Mecanismos de Segurança Crítica**: Implementação de confirmação em 3 etapas, incluindo digitação obrigatória do nome do município e contagem regressiva de segurança de 5 segundos.
- **Paginação de Alta Performance**: Listagem de escolas paginada (25 por página) no servidor para garantir fluidez mesmo em municípios com muitas instituições.
- **Limpeza Recursiva Profunda**: Lógica que remove dados de mais de 20 tabelas relacionadas, mantendo a integridade total do banco de dados.

## 🛠️ Melhorias Técnicas
- **APIs Otimizadas**: Novos endpoints especializados para gestão de municípios e exclusões em lote.
- **UI Premium**: Interface de Usuário desenvolvida com Glassmorphism e micro-animações para operações críticas.
- **Gestão de Roles**: Refreço na validação de permissões `is_superadmin` em nível de rota e componente.

## 📦 Alterações de Código
- Novos Endpoints: `/api/superadmin/bulk-delete`, `/api/superadmin/municipalities`.
- Novos Componentes: `BulkDeleteDialog`, `BulkDeletePage`.
- Ícones: Adição de `AlertTriangle` ao sistema de design.
