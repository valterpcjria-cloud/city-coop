# Release Notes - v2.18.4

## Resumo da Atualização
Esta sub-versão (v2.18.4) consolida as melhorias de navegação e identidade visual da plataforma, focando na interatividade da marca City Coop e no comportamento dinâmico de links de acordo com o contexto do usuário.

---

## 🎨 Logomarca Interativa & Estética Neon

A logomarca oficial foi transformada em um elemento central de navegação em toda a plataforma:

- **Redirecionamento Inteligente de Login**: Na página de login, clicar na logo agora redireciona o usuário para a **Landing Page (`/`)**, facilitando o retorno ao início do portal.
- **Redirecionamento de Dashboard**: Dentro dos painéis (Gestor, Professor e Estudante), a logomarca agora atua como um link direto para a **"Visão Geral"** do respectivo módulo, simplificando o fluxo de trabalho.
- **Expansão do Efeito Neon**: Aplicado um brilho dinâmico (glow) na logomarca em toda a interface:
    - **Glow Ambiente**: Um brilho azul suave e constante.
    - **Hover Dinâmico**: Ao passar o mouse, a logo cresce levemente (105%) e projeta um contorno neon intenso mesclando azul e dourado/âmbar.
- **Z-Index & Visibilidade**: Aumentada a prioridade de renderização da logo para evitar sobreposições e garantir que o clique seja detectado instantaneamente.

## 🛠️ Notas Técnicas
- Atualizada a estrutura de links de `Link` (Next.js) para tags `<a>` otimizadas em pontos críticos de navegação global.
- Refinados os _overflows_ dos containers de sidebar para acomodar o brilho neon sem cortes visuais.
