# Release Notes - v2.18.0

## Resumo da Atualização
Esta versão (v2.18.0) é focada no aprimoramento da interface e experiência do usuário (UX/UI), além do refinamento do módulo de Inteligência Artificial (DOT Assistente) para o ambiente escolar. O destaque principal vai para o redesign integral da página de login, adotando uma estética "Premium Light", e o ajuste no comportamento da IA para fortalecer o ensino da gestão democrática.

---

## 🎨 Design e UI/UX (Tela de Login)

O portal de acesso ao City Coop foi completamente modernizado para transmitir uma percepção premium, mantendo a leveza e a acessibilidade visual:

- **Estética Premium Light**: Transição de fundos escuros para uma paleta clara (`slate-50` com gradientes neutros), eliminando inconsistências visuais e oferecendo uma abertura de sistema mais iluminada.
- **Glassmorphism Aprimorado**: O card principal agora possui `backdrop-blur-xl`, sombreados profundos e transparência elegante que interage com o background.
- **Neon Hover Effects**: Elementos interativos (border do card e botão de login) ganharam um brilho Neon sutil nas cores Azul (`#4A90D9`) e Dourado/Âmbar (`#F5A623`) ao passar o cursor do mouse.
- **Identidade Visual Preservada**: A marca e logo "City Coop" voltaram a ser renderizadas com suas cores originais, sem filtros invertidos.
- **Micro-interações de Inputs**: Adicionado um suave 'glow' ao redor dos campos de e-mail e senha quando em foco, melhorando a feedback de usabilidade.
- **Micro Espaçamentos Refinados**: Aumentado o espaçamento entre os ícones de e-mail/cadeado e os textos (placeholders/valores) nos inputs de login em 3px visando maior limpeza e legibilidade.

---

## 🤖 DOT Assistente (Inteligência Artificial)

O agente de IA da plataforma recebeu calibrações focadas no uso pedagógico e na redução de ruídos de UI:

- **Clean UI no Painel do Professor**: Removidos os botões de atalho/sugestões prontas do DOT Assistente, liberando espaço visual e focando a interface na interação orgânica com a IA.
- **Reforço de Prompt - Gestão Democrática**: O *System Prompt* nativo de Claude 3.5 Sonnet / GPT-4 foi atualizado em ambas as instâncias (Painel do Professor e Estudante). A IA agora possui uma diretiva principal injetada chamada "PILARES DO CONHECIMENTO: GESTÃO DEMOCRÁTICA", condicionando a IA a priorizar, sugerir e referenciar fortemente:
    - O princípio do "um associado, um voto".
    - Protagonismo juvenil.
    - Decisões por consenso formadas em fóruns e Assembleias.
    - Transparência e a lógica de autonomia do corpo estudantil no ambiente da cooperativa escolar.

## Notas Técnicas
- Alterada injeção de classes de `text-white` para `text-[#1a2332]` em views relativas à tela de login.
- Resolvidos potenciais conflitos de _hydration_ com a renderização server-vs-client das classes base do background.
