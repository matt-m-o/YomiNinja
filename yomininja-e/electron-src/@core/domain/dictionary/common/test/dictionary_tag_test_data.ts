// Yomichan's tag bank item format
export type RawDictionaryTag = {
    name: string;
    category: string;
    order: number;
    content: string;
    popularity_score: number;
};

export function getRawDictionaryTags(): RawDictionaryTag[] {
    return [
        {
            name: 'pn',
            category: 'partOfSpeech',
            order: -3,
            content: 'pronoun',
            popularity_score: 0
        },
        {            
            name: "rK",
            category: "",
            order: 0,
            content: "rarely-used kanji form",
            popularity_score: 0
        },
        {            
            name: "uk",
            category: "",
            order: 0,
            content: "word usually written using kana alone",
            popularity_score: 0
        }
    ]
}