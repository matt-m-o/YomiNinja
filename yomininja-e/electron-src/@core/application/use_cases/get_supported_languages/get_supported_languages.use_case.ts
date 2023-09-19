import { OcrAdapter } from "../../adapters/ocr.adapter";


export class GetSupportedLanguagesUseCase {    

    constructor( public ocrAdapters: OcrAdapter[] ) {}

    async execute(): Promise< GetSupportedLanguagesOutput[] > {

        const result: GetSupportedLanguagesOutput[] = [];

        for ( const adapter of this.ocrAdapters ) {

            const languageCodes = await adapter.getSupportedLanguages();

            result.push({
                adapterName: adapter.name,
                languageCodes,
            });
        }

        return result;
    }
}

export type GetSupportedLanguagesOutput = {
    adapterName: string;
    languageCodes: string[];
};