# Versão 2.3.8 - Importação e Performance 🚀🏢

Esta versão introduz o módulo de importação em massa de escolas do INEP e otimizações significativas na performance de navegação da listagem de escolas.

## ✅ O que há de novo:

### 📥 Importação de Escolas (INEP CSV)
- **Módulo de Importação Inteligente**: Nova interface para upload e processamento de arquivos CSV do INEP.
- **Mapeamento Automático**: Identificação automática de campos como Código INEP, Nome, Localização, Contato e Etapas de Ensino.
- **Validação Robusta**: Verificação de duplicados e integridade de dados antes da inserção no banco de dados.

### ⚡ Performance e UX Premium
- **Paginação no Servidor**: Listagem otimizada com limite de 25 itens por página, reduzindo Drasticamente o tempo de carregamento inicial.
- **Navegação Instantânea**: Sistema de cache e prefetching (pré-carregando dados ao passar o mouse) para transições entre páginas sem espera.
- **Animações Fluidas**: Uso de Framer Motion para transições de linhas suaves e estáveis.
- **Zero Layout Shift**: Padrão de persistência de dados que evita "pulos" visuais durante o carregamento de novas páginas.

### 🛠️ Estabilização
- **Correção de Listagem**: Refatoração da página de escolas para garantir estabilidade e evitar erros de carregamento assíncrono.
- **Feedback Visual**: Adição de barra de progresso sutil e loaders intuitivos.

---
*Construído com ❤️ pela equipe City Coop.*
