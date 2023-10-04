import { Language } from "../../../domain/language/language";
import { LanguageRepository } from "../../../domain/language/language.repository";
import { OcrAdapter } from "../../adapters/ocr.adapter";


export class GetSupportedLanguagesUseCase {

    constructor(
        public ocrAdapters: OcrAdapter[],
        public languagesRepo: LanguageRepository,
    ) {}

    async execute(): Promise< GetSupportedLanguagesOutput[] > {

        const result: GetSupportedLanguagesOutput[] = [];

        const supportedLanguages: Language[] = [];

        for ( const adapter of this.ocrAdapters ) {

            const languageCodes = await adapter.getSupportedLanguages();

            for ( const languageCode of languageCodes ) {

                const languageInRepo = await this.languagesRepo.findOne({ two_letter_code: languageCode });

                if ( !languageInRepo ) continue;                

                supportedLanguages.push( languageInRepo );
            }

            result.push({
                adapterName: adapter.name,
                languages: supportedLanguages,
            });
        }

        return result;
    }
}

export type GetSupportedLanguagesOutput = {
    adapterName: string;
    languages: Language[];
};