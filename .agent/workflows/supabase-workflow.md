---
description: Procedimentos para gestão do banco de dados e sincronização de tipos com Supabase
---

# Fluxo de Trabalho do Supabase

Para manter a integridade e a tipagem do banco de dados, siga este fluxo:

## 1. Sincronização de Tipos (TypeScript)
Sempre que o schema do banco de dados for alterado no dashboard do Supabase, atualize as interfaces locais:

```bash
npm run supabase:gen-types
```
> **Nota**: Requer o `SUPABASE_ACCESS_TOKEN` configurado no seu sistema ou que você tenha feito `npx supabase login`.

## 2. Criação de Migrations
Para novas alterações, crie um arquivo de migration:

```bash
npx supabase migration new nome_da_minha_migracao
```
Isso criará um arquivo em `supabase/migrations/` que você pode editar.

## 3. Verificação de Status
Para ver o estado da sincronização entre seu ambiente local e o projeto remoto:

```bash
npm run supabase:status
```

## 4. Variáveis Necessárias
Certifique-se de que o projeto está linkado:
```bash
npm run supabase:link
```
*(Você precisará da senha do banco de dados do projeto)*

// turbo-all
