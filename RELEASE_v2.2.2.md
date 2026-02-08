# 🚀 Release v2.2.2 - Security Hardening

**Data:** 07 de Fevereiro de 2026  
**Versão:** 2.2.2  
**Branch:** main  
**Commit:** 23eeb17

---

## 🔒 Segurança

### Auth Guard - Proteção de APIs
Implementado sistema de autenticação e autorização para todas as APIs do painel Gestor.

- **Validação JWT** obrigatória em todas as rotas `/api/gestor/*`
- **Controle de role** (gestor, professor, estudante)
- **Respostas padronizadas:**
  - `401 Unauthorized` - Usuário não autenticado
  - `403 Forbidden` - Usuário sem permissão para o recurso
  - `429 Too Many Requests` - Rate limit excedido

### Rate Limiting
Proteção contra ataques de força bruta e DoS:

| Método | Limite | Janela |
|--------|--------|--------|
| GET | 100 req | 1 min |
| POST | 30 req | 1 min |
| PUT | 30 req | 1 min |
| DELETE | 20 req | 1 min |
| Auth | 5 req | 1 min |
| AI | 10 req | 1 min |

### Input Validation
Validação de entrada com Zod para prevenir injection attacks:

- Validação de UUIDs
- Sanitização de strings (remove `<script>`, `javascript:`)
- Schemas tipados para todas as entidades
- Proteção contra prototype pollution

### Security Headers
Novos headers HTTP para proteção adicional:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cache-Control: no-store (APIs)
```

---

## 🏫 Modelo de Dados INEP para Escolas

### Novos Campos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `inep_code` | TEXT | Código INEP oficial (8 dígitos) |
| `administrative_category` | ENUM | Municipal, Estadual, Federal, Privada |
| `education_stages` | TEXT[] | Etapas de ensino oferecidas |
| `location_type` | ENUM | Urbana ou Rural |
| `director_name` | TEXT | Nome do(a) diretor(a) |
| `address_number` | TEXT | Número do endereço |
| `address_complement` | TEXT | Complemento |
| `secondary_phone` | TEXT | Telefone secundário |
| `website` | TEXT | Site institucional |

### Etapas de Ensino Disponíveis
- Creche
- Pré-escola
- Fundamental Anos Iniciais
- Fundamental Anos Finais
- Ensino Médio
- EJA
- Educação Especial

---

## 🧩 Componentes UI

### Novo: Checkbox
Componente de checkbox baseado em Radix UI para seleção múltipla.

---

## 📁 Arquivos Modificados

### Novos Arquivos
```
src/lib/auth-guard.ts          # Autenticação e autorização
src/lib/rate-limiter.ts        # Rate limiting
src/lib/validators.ts          # Validação Zod
src/components/ui/checkbox.tsx # Componente UI
supabase/migrations/20260207_schools_inep_fields.sql
```

### APIs Atualizadas (8 endpoints)
```
src/app/api/gestor/schools/route.ts
src/app/api/gestor/settings/route.ts
src/app/api/gestor/reports/metrics/route.ts
src/app/api/gestor/reports/schools/route.ts
src/app/api/gestor/reports/students/route.ts
src/app/api/gestor/reports/classes/route.ts
src/app/api/gestor/reports/events/route.ts
src/app/api/gestor/reports/elections/route.ts
```

### Configuração
```
next.config.ts                 # Security headers adicionados
```

---

## ⚠️ Breaking Changes

Nenhum breaking change nesta versão.

---

## 📋 Instruções de Atualização

1. **Pull das alterações:**
   ```bash
   git pull origin main
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Executar migration no Supabase:**
   ```sql
   -- Executar arquivo: supabase/migrations/20260207_schools_inep_fields.sql
   ```

4. **Reiniciar aplicação:**
   ```bash
   npm run dev
   ```

---

## 🔗 Links

- **Tag:** [v2.2.2](https://github.com/valterpcjria-cloud/city-coop/releases/tag/v2.2.2)
- **Commit:** 23eeb17
- **Comparação:** [v2.2.1...v2.2.2](https://github.com/valterpcjria-cloud/city-coop/compare/v2.2.1...v2.2.2)
