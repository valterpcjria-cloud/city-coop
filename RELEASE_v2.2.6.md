# 🚀 Release v2.2.6 - Gestão de Núcleos

Esta versão traz ferramentas avançadas para a organização dos alunos em núcleos operacionais, facilitando a gestão da cooperativa pelo professor.

## 📋 Alterações Principais

### 🏢 Gestão de Núcleos (Professor)
- **NucleusDialog**: Novo componente para adicionar e remover membros de núcleos em tempo real.
- **Atribuição de Papéis**: Possibilidade de definir quem é o Coordenador e quem é Membro de cada núcleo.
- **UX Aprimorada**: Lista lateral de alunos "Não Alocados" para fácil identificação de quem ainda precisa de um grupo.

### 🎨 Visualização e Interatividade
- **Badges de Identificação**: Alunos agora possuem badges coloridos na lista geral da turma, indicando seu núcleo.
- **Cores por Núcleo**: Identificação visual rápida (Financeiro em Vermelho, Logística em Verde, etc).
- **Feedback Instantâneo**: Atualização da interface imediatamente após alterações nos núcleos.

### 🛠️ Notas Técnicas
- **Refatoração**: Otimização das consultas Supabase para incluir dados relacionados de alunos e núcleos em uma única chamada.
- **Consistência**: Garantia de que um aluno alocado saia automaticamente da lista de "Não Alocados".

---
*City Coop Platform - Desenvolvido com ❤️ para a educação.*
