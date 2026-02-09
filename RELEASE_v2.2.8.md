# 🚀 Release v2.2.8 - Segurança Global & Inteligência DOT

Esta versão consolida avanços críticos em segurança de dados com a implementação da validação rigorosa de CPF, além de aprimorar a experiência de uso do Assistente DOT e facilitar a gestão administrativa de estudantes em toda a rede.

## 📋 Alterações Principais

### 🛡️ Segurança Master (CPF & Unicidade)
- **Validação de Checksum**: Implementado algoritmo oficial de validação de CPFs. O sistema agora impede cadastros com dados inválidos ou erros de digitação.
- **Unicidade Global**: Nova trava de banco de dados (triggers) que garante que um CPF seja único em todo o sistema. Se um CPF já estiver em uso por um Professor, um Aluno ou Gestor não poderá utilizá-lo, bloqueando duplicidades.
- **CPF para Gestores**: O campo CPF agora é parte integrante do perfil de Gestores e Administradores, reforçando a auditoria de dados.

### 🤖 DOT Assistente (UI/UX)
- **Scroll Inteligente**: Implementada rolagem automática de alta precisão. A tela agora acompanha as respostas da IA palavra por palavra (streaming), mantendo o foco sempre no texto mais recente.
- **Foco e Visibilidade**: Corrigidos problemas onde a caixa de entrada obstruía a leitura do histórico de mensagens.
- **Textarea Dinâmico**: O campo de pergunta agora se expande automaticamente conforme o texto, sem sacrificar a visibilidade do chat.

### 🎓 Gestão de Alunos & Alocação
- **Busca Global de Estudantes**: Novo sistema de localização que permite encontrar alunos em toda a base de dados, facilitando transferências e matrículas em novas escolas.
- **Alocação via Gestor**: Gestores e Administradores agora possuem uma interface direta para alocar escola e série de qualquer aluno.
- **Vínculo Automatizado**: Ao matricular um aluno sem escola em uma turma, o sistema vincula o aluno à escola da turma automaticamente.

### 📚 Modalidade EJA
- **Suporte Nativo**: Implementado suporte completo para a modalidade EJA (Educação de Jovens e Adultos) em todos os fluxos de matrícula e relatórios.

### 🛠️ Notas Técnicas
- **Data Engine**: Lançada migração `20260208_gestors_unique_cpf.sql` para unicidade global.
- **Otimização de Frontend**: Redução de redundâncias na lógica de scroll e correção de tipagens para deploys mais rápidos na Vercel.
- **Versão**: Atualizado para `city-coop-platform@2.2.8`.

---
*City Coop Platform - Segurança e Inovação para o Cooperativismo Escolar.*
