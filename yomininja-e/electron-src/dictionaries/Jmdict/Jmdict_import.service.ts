import { FuriganaDictionaryItem } from "../../@core/application/use_cases/dictionary/import_furigana_dictionary/furigana_dictionary_types";
import { ImportFuriganaDictionaryUseCase } from "../../@core/application/use_cases/dictionary/import_furigana_dictionary/import_furigana_dictionary.use_case";

import fs from 'fs';
import { DictionaryImportProgressCallBack } from "../common/dictionary_import_progress";

export class JmdictImportService {
    
    private importFuriganaDictionaryUseCase: ImportFuriganaDictionaryUseCase;    

    constructor(
        input: {
            importFuriganaDictionaryUseCase: ImportFuriganaDictionaryUseCase;
        }
    ){        
        this.importFuriganaDictionaryUseCase = input.importFuriganaDictionaryUseCase;        
    }

    async importFuriganaDictionary(
        input: { 
            txtFilePath: string,
            progressCallBack: DictionaryImportProgressCallBack,
        }
    ) {
        const { txtFilePath, progressCallBack } = input;

        try {

            const lines = fs.readFileSync( txtFilePath, 'utf8' ).split('\n');
    
            const items = JmdictImportService.parseFuriganaDictionaryLines( lines );

            const batchSize = 5_000;        

            for ( let i = 0; i < items.length; i += batchSize ) {

                console.log('Furigana dictionary import batch: '+ i/batchSize + '/'+ items.length/batchSize);

                progressCallBack({
                    progress: (i / items.length) * 100,
                    status: 'importing',
                });

                const batch = items.slice( i, i + batchSize );
                await this.importFuriganaDictionaryUseCase.execute({
                    items: batch
                });
            }

            progressCallBack({
                progress: 100,
                status: 'completed',
            });

        } catch ( error ) {
            input.progressCallBack({
                progress: 0,
                status: 'failed',
                error: 'jmdict-furigana-dictionary-import-error'
            });
        }

        console.log('Furigana dictionary import is complete')
    }

    static parseFuriganaDictionaryLines( lines: string[] ): FuriganaDictionaryItem[] {
        
        return lines.map( ( line, idx ) => {

            const [ text, reading, furigana ] = line.split('|');

            return { text, reading, furigana };
        });
    }
}