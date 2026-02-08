# Guia de Implantação no Vercel - City Coop Platform

Este guia descreve como colocar seu sistema online usando o Vercel.

## Pré-requisitos
1. Uma conta no [GitHub](https://github.com).
2. Uma conta no [Vercel](https://vercel.com) (conectada ao seu GitHub).

## Passos para Implantação

### 1. Enviar o Código para o GitHub
Se você ainda não enviou seu código para o GitHub, siga estes comandos no seu terminal:
```bash
git add .
git commit -m "Preparando para deploy no Vercel"
git push origin main
```

### 2. Conectar ao Vercel
1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard).
2. Clique em **"Add New..."** e depois em **"Project"**.
3. Importe o repositório `city-coop-platform` do seu GitHub.

### 3. Configurar Variáveis de Ambiente
No Vercel, antes de clicar em "Deploy", abra a seção **Environment Variables** e adicione as seguintes chaves (copie os valores do seu arquivo `.env` local):

| Chave | Valor (Exemplo) |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Sua URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sua Anon Key do Supabase |
| `OPENAI_API_KEY` | Sua chave da OpenAI |
| `AUTH_SECRET` | Seu segredo de autenticação |
| `SUPABASE_SERVICE_ROLE_KEY` | Sua Service Role Key |
| `NEXT_PUBLIC_APP_URL` | A URL que o Vercel gerar (ex: `https://seu-projeto.vercel.app`) |

### 4. Deploy!
Clique em **Deploy**. O Vercel levará cerca de 2 minutos para construir e publicar seu site.

## Dicas Importantes
- **Supabase Auth**: No painel do Supabase, você precisará adicionar a nova URL do Vercel em `Authentication > URL Configuration > Site URL` e nos `Redirect URLs`.
- **Atualizações**: Sempre que você fizer um `git push`, o Vercel atualizará o site automaticamente.
