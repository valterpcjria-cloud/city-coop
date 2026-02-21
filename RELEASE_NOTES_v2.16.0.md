# Release Notes - v2.16.0 (The DOT 2.0 Update)

Esta versão marca o lançamento oficial do **DOT Assistente 2.0**, consolidando sua identidade como o maior especialista em Cooperativismo da plataforma, com uma interface totalmente polida e funcional para estudantes e professores.

## 🤖 DOT Assistente 2.0

- **Identidade Reforçada:** O DOT agora assume um tom profissional, técnico e conciso, focado exclusivamente no universo do cooperativismo.
- **Blindagem Pedagógica:** Implementação de regras estritas que impedem o assistente de fornecer respostas prontas para atividades, incentivando a aprendizagem por investigação (método socrático).
- **Tratamento de Escopo:** Resposta padrão obrigatória para qualquer tema fora do cooperativismo, garantindo a integridade educacional da ferramenta.

## 🎨 UI/UX & Chat Performance

- **Scroll Nativo Premium:** Substituição do `ScrollArea` por containers de scroll nativo em ambos os painéis (Estudante e Professor), eliminando travamentos e permitindo navegação fluida em conversas longas.
- **Correção de Visibilidade:** Resolvido o erro que ocultava o conteúdo das mensagens ("partes") nas versões mais recentes da SDK AI.
- **Interface Sincronizada:** Chat do estudante agora possui paridade total com o do professor, incluindo botão de limpar histórico, seleção de modelos (GPT/Claude) e alinhamento de mensagens ("EU").
- **Fim da Mensagem Fantasma:** Removida a duplicação da mensagem de boas-vindas que insistia em aparecer durante a conversa.

## 🛠️ Infraestrutura e Estabilidade

- **Next.js 16 Compatibility:** Correção crítica na tipagem de rotas dinâmicas (`params` como Promise), garantindo builds estáveis na Vercel.
- **Sincronia de Histórico:** Melhoria na comunicação com o backend para garantir que as trocas de modelo e limpezas de chat sejam persistidas corretamente no banco de dados.

---
*City Coop Platform - Inteligência e Cooperação em cada detalhe.*
