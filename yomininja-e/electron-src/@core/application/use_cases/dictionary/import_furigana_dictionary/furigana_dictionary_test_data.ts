import { FuriganaDictionaryItem } from "./furigana_dictionary_types";

/* Original from github.com/Doublevil/JmdictFurigana
彼処|あそこ|0-1:あそこ
彼所|あそこ|0-1:あそこ
彼処|かしこ|0-1:かしこ
彼処|あこ|0:あ;1:こ
彼所|あこ|0:あ;1:こ
*/

export function getRawFuriganaDictionaryItems(): FuriganaDictionaryItem[] {
    return [
        {
            text: "彼処",
            reading: "あそこ",
            furigana: "0-1:あそこ",
        },
        {
            text: "彼所",
            reading: "あそこ",
            furigana: "0-1:あそこ"
        },
        {
            text: "彼処",
            reading: "かしこ",
            furigana: "0-1:かしこ"
        },
        {
            text: "彼処",
            reading: "あこ",
            furigana: "0:あ;1:こ"
        },
        {
            text: "彼所",
            reading: "あこ",
            furigana: "0:あ;1:こ"
        }
    ]
}