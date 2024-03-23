import { Language } from "../../../domain/language/language";
import { LanguageRepository } from "../../../domain/language/language.repository";
import { OcrEngineSettings } from "../../../domain/settings_preset/settings_preset";
import { OcrAdapter } from "../../adapters/ocr.adapter";


export class GetSupportedLanguagesUseCase< TOcrSettings extends OcrEngineSettings > {

    constructor(
        public ocrAdapters: OcrAdapter< TOcrSettings >[],
        public languagesRepo: LanguageRepository,
    ) {}

    async execute(): Promise< GetSupportedLanguagesOutput[] > {

        const result: GetSupportedLanguagesOutput[] = [];

        for ( const adapter of this.ocrAdapters ) {
            
            const supportedLanguages: Language[] = [];
            
            const languageCodes = await adapter.getSupportedLanguages();

            for ( const languageCode of languageCodes ) {

                let languageInRepo = await this.languagesRepo.findOne({ bcp47_tag: languageCode });

                if ( !languageInRepo )
                    languageInRepo = await this.languagesRepo.findOne({ two_letter_code: languageCode.slice(0, 2) });

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