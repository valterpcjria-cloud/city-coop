# Release Notes - v2.3.6 🏢🤝

Esta versão traz a esperada gestão completa de Cooperativas Parceiras, permitindo um controle granular e seguro das conexões do ecossistema City Coop.

## 📋 Resumo das Novidades
- **CRUD de Cooperativas**: Gestão integral (Criação, Edição, Exclusão e Listagem).
- **Security Check**: Validação rigorosa de permissões gestoras para operações em cooperativas.
- **UI Fluida**: Integração de modais responsivos e alertas de confirmação.

---

## 🚀 Novas Funcionalidades

### 🏢 Gestão de Cooperativas Parceiras
- **Novo Cadastro**: Botão "+ Nova Cooperativa" agora permite registrar todos os dados vitais (CNPJ, Ramo, Responsável).
- **Edição em Tempo Real**: Altere dados de contato ou endereço instantaneamente através do ícone de engrenagem.
- **Exclusão Segura**: Implementação de confirmação em duas etapas para evitar perda acidental de dados.
- **Feedback Visual**: Toasts de sucesso e erro integrados para todas as operações.

---

## 🛠️ Melhorias Técnicas
- **Endpoints CRUD Individuais**: Criação da rota `/api/cooperatives/[id]` para operações específicas.
- **Supabase Type Bypass**: Correção de tipagem em operações de inserção para maior estabilidade.
- **Refatoração de Estado**: Migração do gerenciamento de modais para o nível da página, otimizando a performance da lista.
- **Sincronização**: Uso de `refreshTrigger` para atualização instantânea da UI após mudanças no banco de dados.

---

**Release Date:** 09/02/2026
**Version:** 2.3.6
**Status:** Stable 🟢
