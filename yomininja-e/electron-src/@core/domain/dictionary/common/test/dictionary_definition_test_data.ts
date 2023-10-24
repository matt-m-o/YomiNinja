
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
        },
        {            
            term: "彼処",
            reading: "あそこ",
            definition_tags: "n uk",
            rule_id: "",
            popularity: 1,
            definitions: [
                "that far",
                "that much",
                "that point"
            ],
            sequence: 1000320,
            term_tags: "rK"
        },
        {
            term: "彼処",
            reading: "あすこ",
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
        },
        {            
            term: "あうんの呼吸",
            reading: "あうんのこきゅう",
            definition_tags: "exp n id",
            rule_id: "",
            popularity: 1,
            definitions: [
                "the harmonizing, mentally and physically, of two parties engaged in an activity",
                "singing from the same hymn-sheet",
                "dancing to the same beat"
            ],
            sequence: 1000200,
            term_tags: ""
        },
        {
            term: "阿吽の呼吸",
            reading: "あうんのこきゅう",
            definition_tags: "exp n id",
            rule_id: "",
            popularity: 1,
            definitions: [
                "the harmonizing, mentally and physically, of two parties engaged in an activity",
                "singing from the same hymn-sheet",
                "dancing to the same beat"
            ],
            sequence: 1000200,
            term_tags: ""
        }
    ]
}