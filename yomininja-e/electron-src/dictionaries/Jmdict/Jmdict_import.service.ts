import { FuriganaDictionaryItem } from "../../@core/application/use_cases/dictionary/import_furigana_dictionary/furigana_dictionary_types";
import { ImportFuriganaDictionaryUseCase } from "../../@core/application/use_cases/dictionary/import_furigana_dictionary/import_furigana_dictionary.use_case";

import fs from 'fs';

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
        }
    ) {
        const { txtFilePath } = input;

        const lines = fs.readFileSync( txtFilePath, 'utf8' ).split('\n');
    
        const items = JmdictImportService.parseFuriganaDictionaryLines( lines );

        const batchSize = 10_000;        

        for ( let i = 0; i < items.length; i += batchSize ) {

            console.log('Furigana dictionary import batch: '+ i/batchSize + '/'+ items.length/batchSize);

            const batch = items.slice( i, i + batchSize );
            await this.importFuriganaDictionaryUseCase.execute({
                items: batch
            });
        }
        

        console.log('Furigana dictionary importation completed!')
    }

    static parseFuriganaDictionaryLines( lines: string[] ): FuriganaDictionaryItem[] {
        
        return lines.map( ( line, idx ) => {

            const [ text, reading, furigana ] = line.split('|');

            return { text, reading, furigana };
        });
    }
}