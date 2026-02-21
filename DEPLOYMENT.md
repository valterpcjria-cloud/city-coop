# Guia de Deploy na Vercel — City Coop Platform

Guia completo para colocar a City Coop Platform em produção usando Vercel + Supabase.

---

## 📋 Checklist Pré-Deploy

Antes de fazer o deploy, confirme:

- [ ] Projeto Supabase criado em [supabase.com](https://supabase.com)
- [ ] Chaves da API Anthropic obtidas em [console.anthropic.com](https://console.anthropic.com)
- [ ] Chaves da API OpenAI obtidas em [platform.openai.com](https://platform.openai.com)
- [ ] Código enviado para um repositório GitHub/GitLab
- [ ] Conta Vercel conectada ao repositório

---

## 🚀 Passos para Implantação

### 1. Enviar o Código para o GitHub

```bash
git add .
git commit -m "chore: prepare for Vercel deploy"
git push origin main
```

### 2. Conectar ao Vercel

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Importe o repositório `city-coop-platform`
4. Framework: **Next.js** (detectado automaticamente)

### 3. Configurar Variáveis de Ambiente

Na seção **Environment Variables**, adicione **todas** as seguintes chaves:

| Variável | Descrição | Onde Obter |
|----------|-----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública do projeto Supabase | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (secreta!) | Supabase → Project Settings → API |
| `ANTHROPIC_API_KEY` | API key da Anthropic (Claude) | console.anthropic.com |
| `OPENAI_API_KEY` | API key da OpenAI (GPT-4o) | platform.openai.com/api-keys |
| `AUTH_SECRET` | Segredo JWT (string aleatória longa) | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | URL final do deploy Vercel | Ex: `https://city-coop.vercel.app` |

> ⚠️ **NUNCA** exponha `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` ou `OPENAI_API_KEY` no frontend. Essas variáveis só devem ser usadas em Server Components e API Routes.

### 4. Deploy!

Clique em **Deploy**. O build leva cerca de 2–3 minutos.

---

## ⚙️ Configuração Pós-Deploy no Supabase

Após o primeiro deploy, configure os seguintes itens no painel do Supabase:

### Auth → URL Configuration
1. Acesse **Authentication → URL Configuration**
2. Em **Site URL**, coloque a URL do Vercel: `https://seu-projeto.vercel.app`
3. Em **Redirect URLs**, adicione:
   - `https://seu-projeto.vercel.app/auth/callback`
   - `https://seu-projeto.vercel.app/**`

### Verificar Migrations
Certifique-se de que todas as migrations do banco estão aplicadas:
```bash
# Em ambiente local com Supabase CLI
supabase db push
```

---

## 🔄 Atualizações Contínuas

Todo `git push` para `main` dispara um novo deploy automaticamente.

Para deploys de preview (ambientes de teste), use branches separadas — o Vercel cria URLs únicas para cada branch automaticamente.

---

## 🐛 Troubleshooting Comum

| Problema | Causa Provável | Solução |
|----------|---------------|---------|
| Build falha com erro de types | Types do Supabase desatualizados | Rodar `npm run supabase:gen-types` e commitar |
| Erro 401 nas rotas de IA | `ANTHROPIC_API_KEY` ou `OPENAI_API_KEY` não configuradas | Verificar Environment Variables na Vercel |
| Redirect loop no login | `NEXT_PUBLIC_APP_URL` errada | Atualizar para URL exata do Vercel (sem `/` no final) |
| Dados não carregam | RLS bloqueando queries | Verificar políticas RLS no Supabase Studio |
| Chat IA sem resposta | Limite de tokens ou chave inválida | Verificar logs da Vercel em Functions |

---

## 📊 Monitoramento

- **Vercel Dashboard**: Logs de build, runtime e Edge Functions
- **Supabase Studio**: Queries, RLS, Auth logs e database usage
- **Vercel Analytics**: Core Web Vitals (ativar em Settings → Analytics)
