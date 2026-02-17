# NOTAS DE LANÇAMENTO - v2.14.0

## [2.14.0] - 2026-02-17

### Adicionado
- **Exclusão Independente de Estudantes**: Nova funcionalidade que permite ao Superadmin remover perfis de estudantes em massa, limpando automaticamente notas, avaliações, frequências e vínculos com turmas.
- **Exclusão Independente de Professores**: Permite a remoção de professores em massa, tratando automaticamente o desvinculo de turmas e remoção de registros de núcleos de gestão.
- **Seletor de Tipo de Exclusão**: Interface aprimorada para alternar entre limpeza de Escolas, Estudantes ou Professores.
- **Paginação Universal**: Implementação de paginação para todas as categorias de listagem na ferramenta de Limpeza Crítica.

### Melhorias Técnicas
- **Refatoração de API**: Consolidação da rota `bulk-delete` para lidar com múltiplos tipos de entidades de forma segura.
- **Integridade Referencial**: Lógica recursiva aprimorada para garantir que nenhum dado órfão permaneça no banco após a exclusão.
- **Audit Log**: Registros de auditoria agora especificam o tipo exato de remoção em massa realizada (.e.g, `BULK_DELETE_STUDENTS_ONLY`).

### Segurança
- Diálogo de confirmação com avisos de impacto dinâmicos baseados no tipo de dado selecionado.
- Persistência das travas de confirmação (digitação do município + countdown de 5 segundos).
