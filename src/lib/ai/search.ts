/**
 * Utilitário de pesquisa web para o Assistente DOT.
 * Recomenda-se o uso da API Tavily (tavily.com) pela sua otimização para LLMs.
 */

export interface SearchResult {
    title: string;
    url: string;
    content: string;
    score?: number;
}

export async function performWebSearch(query: string, limit: number = 3): Promise<SearchResult[]> {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
        console.warn('TAVILY_API_KEY não configurada. Pesquisa web desativada.');
        return [];
    }

    try {
        // [WEB ON] PROTOCOLO DE FONTES RESTRITAS
        // Priorizando OCB, Sescoop e Legislação Governamental
        const domainQuery = `(site:ocb.org.br OR site:brasilcooperativo.coop.br OR site:planalto.gov.br) cooperativismo ${query}`;

        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: apiKey,
                query: domainQuery,
                search_depth: 'advanced',
                include_answer: false,
                include_images: false,
                max_results: limit,
            }),
        });

        if (!response.ok) {
            throw new Error(`Erro na API Tavily: ${response.statusText}`);
        }

        const data = await response.json();
        return data.results.map((result: any) => ({
            title: result.title,
            url: result.url,
            content: result.content,
            score: result.score,
        }));
    } catch (error) {
        console.error('Falha na pesquisa web:', error);
        return [];
    }
}

/**
 * Formata os resultados da pesquisa para inclusão no prompt.
 */
export function formatSearchResults(results: SearchResult[]): string {
    if (results.length === 0) return '';

    return results
        .map((r, i) => `[Resultado ${i + 1}: ${r.title}]\nURL: ${r.url}\nConteúdo: ${r.content}`)
        .join('\n\n---\n\n');
}
