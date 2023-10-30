import fs from 'fs';
import {
    YomichanTagBankItem,
    YomichanDictionaryIndex,
    YomichanTermBankItem
} from '../../@core/application/use_cases/dictionary/import_yomichan_dictionary/yomichan_dictionary_types';
import { YomichanImportService } from './yomichan_import.service';



describe( 'YomichanImportService tests', () => {

    const dictionaryZipPath = './data/jmdict_english.zip';
    const extractedDictPath = './data/temp_dictionaries/jmdict_english';

    it('should extract a dictionary and return the extracted folder path', async () => {

        const extractedFolderPath = await YomichanImportService.extractDictionary( dictionaryZipPath );

        expect( extractedFolderPath ).toStrictEqual( extractedDictPath );
    });

    it('should read get dictionary index', async () => {
        
        const index = await YomichanImportService.getDictionaryIndex( extractedDictPath );

        expect( index.title ).toStrictEqual( 'JMdict (English)' );
        expect( index.format ).toStrictEqual( 3 );
        expect( index.revision ).toStrictEqual( 'jmdict4' );
        expect( index.sequenced ).toStrictEqual( true );
    });

    it('should read the dictionary tag bank', async () => {        

        const tagBank = await YomichanImportService.getDictionaryTagBank( extractedDictPath );
        
        expect( tagBank ).toHaveLength( 259 );
    });

    it('should read a dictionary term banks', () => {

        let termBanks: YomichanTermBankItem[][] = [];        

        const generator = YomichanImportService.getDictionaryTermBanks( extractedDictPath );

        for ( const { termBank } of generator ) {
            termBanks.push(termBank);
        }

        expect( termBanks ).toHaveLength( 34 );
    });

    it('should clean temporary files', () => {

        YomichanImportService.cleanTemporaryFiles();
        
        const files = fs.readdirSync('./data');        
        expect( files.includes('temp_dictionaries') ).toBeFalsy();            
    });
})
