

export type YomichanTagBankItem = {
    name: string;
    category: string;
    order: number;
    content: string;
    popularity_score: number;
}


export type YomichanTermBankItem = {
    term: string;
    reading: string;
    definition_tags?: string; // list, separated by spaces
    rule_id: string;
    popularity: number;
    definitions: string[];
    sequence: number;
    term_tags: string; // list, separated by spaces
}