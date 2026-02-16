# Release Notes - v2.9.0

## 🔐 Segurança Enterprise e Blindagem de API

Esta versão eleva o patamar de segurança da plataforma City Coop, implementando defesas multicamadas contra vulnerabilidades comuns e estabelecendo um sistema robusto de auditoria para ações sensíveis.

### 🛡️ Blindagem de APIs e RBAC
*   **Guarda de Acesso Padronizada**: Implementação de verificações rigorosas de Role-Based Access Control (RBAC) em todas as rotas de API críticas.
*   **Controle de Superadmin**: Rotas de configuração de chaves de IA (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) e criação de novos gestores agora são exclusivas para Superadmins.
*   **Sanitização de Inputs**: Reforço na validação de dados em todas as rotas POST/PUT para prevenir injeções e dados malformados.

### 📝 Sistema de Auditoria Centralizado
*   **Audit Logs**: Criação de uma infraestrutura de logging que registra automaticamente cada ação administrativa importante.
*   **Rastreabilidade Total**: O sistema agora captura o usuário autor da ação, o recurso afetado, o endereço IP e os dados alterados (com sensibilidade para mascarar chaves e senhas).
*   **Segurança de Log**: Tabela de auditoria protegida por RLS, acessível apenas por Superadmins e imutável pelo frontend.

### ⚡ Rate Limiting e Escalabilidade
*   **Proteção Anti-Abuso**: Configuração de limites de requisições por IP e Usuário para prevenir brute-force e excesso de uso de IA.
*   **Suporte a Redis (Upstash)**: O sistema agora detecta automaticamente provedores de Redis para manter limites persistentes mesmo em ambientes serverless ou mult-instância.

### 🌐 Proteção de Front-end (CSP)
*   **Content Security Policy (CSP)**: Implementação de cabeçalhos rígidos no `next.config.ts` para mitigar ataques de XSS e Clickjacking.
*   **Headers de Segurança**: Ativação de `X-Frame-Options: DENY`, `Strict-Transport-Security` e políticas de referenciador aprimoradas.

---
**City Coop Platform** - *Semeando cooperação, colhendo futuro.*
