# Release Notes - v2.7.0 🚀

Esta versão traz avanços significativos na inteligência do assistente DOT, melhorias críticas de segurança e uma experiência de usuário mais fluida e moderna.

## 🤖 DOT Assistente: Agora com Pesquisa Web
*   **Pesquisa na Internet**: O DOT agora pode consultar a web em tempo real através da API Tavily.
*   **Controle Total**: Adicionado toggle de ligar/desligar pesquisa web no painel do professor.
*   **Cérebro Primeiro**: O assistente continua priorizando o conhecimento interno do programa City Coop.

## 🔐 Segurança e Gestão de Acessos
*   **Restrição de Eleições**: Professores agora só visualizam e gerenciam as eleições de suas próprias turmas.
*   **Controle de Senhas**:
    *   Estudantes bloqueados de redefinir senhas administrativamente.
    *   Professores ganharam autonomia para resetar senhas de seus alunos diretamente na tabela de estudantes.
*   **Superadmin Privilegiado**: Garantido acesso total e irrestrito do Superadmin a todos os módulos e páginas.

## ⚡ Performance e UI/UX
*   **Carregamento Ultra-rápido**: Implementada busca de dados em paralelo (`Promise.all`) em todos os dashboards.
*   **Novo Look & Feel**: Estética *Glassmorphism* aplicada aos componentes, proporcionando profundidade e modernidade.
*   **Transições Fluidas**: Novas animações de entrada e troca de rotas utilizando `framer-motion`.
*   **Skeleton Loaders**: Melhoria na percepção de velocidade durante o carregamento.

## 🛠️ Outras Melhorias
*   **Senha Padrão**: Novos alunos agora utilizam o CPF (apenas números) como senha inicial.
*   **Debounce em Pesquisas**: Filtros de tabelas otimizados para evitar lag ao digitar.

---
*City Coop Platform - Inteligência e Cooperação em cada detalhe.*
