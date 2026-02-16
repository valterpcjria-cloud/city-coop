---
description: Procedimento padrão para garantir builds bem-sucedidos na Vercel
---

Para evitar falhas de deploy na Vercel e garantir a estabilidade da plataforma City Coop, siga sempre estes passos antes de qualquer commit/push para a branch `main`:

1.  **Validação Local**:
    Execute o comando de build no terminal local:
    ```bash
    npm run build
    ```

2.  **Correção de Erros**:
    - Se houver erros de **TypeScript**, corrija todos antes de prosseguir.
    - Se houver erros de **Lint**, resolva-os para manter o padrão de código.
    - Se o build falhar devido a variáveis de ambiente ausentes, verifique o arquivo `.env.local` e compare com as configurações da Vercel.

3.  **Verificação de Tipagem**:
    Certifique-se de que novos dados ou interfaces estão corretamente mapeados em todos os componentes que os utilizam.

4.  **Commit e Push**:
    Apenas após o `npm run build` terminar com a mensagem `✓ Compiled successfully`, realize o commit:
    ```bash
    git add .
    git commit -m "feat/fix: sua descrição"
    git push
    ```

// turbo-all
