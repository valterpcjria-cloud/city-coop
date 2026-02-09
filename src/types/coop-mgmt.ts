export type TestCycle = {
    id: string;
    numero_ciclo: number;
    titulo: string;
    descricao: string | null;
    conteudo_pedagogico: string | null;
    data_inicio: string | null;
    data_fim: string | null;
    ativo: boolean;
    created_at: string;
    updated_at: string;
};

export type CycleTest = {
    id: string;
    cycle_id: string;
    titulo: string;
    instrucoes: string | null;
    tempo_limite_minutos: number;
    num_questoes: number;
    nota_aprovacao: number;
    ativo: boolean;
    created_at: string;
    updated_at: string;
};

export type TestQuestion = {
    id: string;
    test_id: string;
    questao_texto: string;
    opcao_a: string;
    opcao_b: string;
    opcao_c: string;
    opcao_d: string;
    resposta_correta: 'A' | 'B' | 'C' | 'D';
    ordem: number;
    created_at: string;
};

export type StudentTestResult = {
    id: string;
    student_id: string;
    test_id: string;
    nota: number | null;
    data_realizacao: string;
    tempo_gasto_minutos: number | null;
    respostas: Record<string, string>;
};

export type StudentScore = {
    id: string;
    student_id: string;
    conhecimento_score: number;
    engajamento_score: number;
    colaboracao_score: number;
    perfil_cooperativista_score: number;
    score_total: number;
    ultima_atualizacao: string;
};

export type NucleoGestorEscolar = {
    id: string;
    school_id: string;
    class_id: string | null;
    nome: string;
    descricao: string | null;
    data_formacao: string;
    status: 'Ativo' | 'Concluído' | 'Inativo';
    created_at: string;
    updated_at: string;
};

export type Cooperative = {
    id: string;
    razao_social: string;
    nome_fantasia: string | null;
    cnpj: string | null;
    ramo_cooperativista: string;
    endereco: string | null;
    cidade: string;
    estado: string;
    latitude: number | null;
    longitude: number | null;
    responsavel_nome: string;
    responsavel_email: string;
    ativo: boolean;
};

export type CooperativeOpportunity = {
    id: string;
    cooperative_id: string;
    titulo: string;
    descricao: string | null;
    tipo: string;
    vagas_disponiveis: number;
    status: string;
    created_at: string;
};
