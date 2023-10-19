
// Yomichan's term bank item format
export type RawDictionaryDefinition = {
    term: string;
    reading: string;
    definition_tags?: string; // list, separated by spaces
    rule_id: string;
    popularity: number;
    definitions: string[];
    sequence: number;
    term_tags: string; // list, separated by spaces
};

export function getRawDictionaryDefinitions(): RawDictionaryDefinition[] {
    return [
        {
            term: "彼処",
            reading: "あそこ",
            definition_tags: "pn uk",
            rule_id: "",
            popularity: 3,
            definitions: [
                "there",
                "over there",
                "that place",
                "yonder",
                "you-know-where"
            ],
            sequence: 1000320,
            term_tags: "rK"
        }    
    ]
}