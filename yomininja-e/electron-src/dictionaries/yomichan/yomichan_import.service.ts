import { ImportYomichanDictionaryUseCase } from "../../@core/application/use_cases/dictionary/import_yomichan_dictionary/import_yomichan_dictionary.use_case";
import fs from 'fs';
import fsPromises from 'fs/promises';
import { YomichanDictionaryIndex, YomichanTagBankItem, YomichanTermBankItem } from "../../@core/application/use_cases/dictionary/import_yomichan_dictionary/yomichan_dictionary_types";
import path, { join } from "path";
// import isDev from 'electron-is-dev';
import StreamZip from 'node-stream-zip';
import { Language } from "../../@core/domain/language/language";
import { DictionaryImportProgress, DictionaryImportProgressCallBack } from "../common/dictionary_import_progress";


export class YomichanImportService {
    
    private importYomichanDictionaryUseCase: ImportYomichanDictionaryUseCase;    

    constructor(
        input: {
            importYomichanDictionaryUseCase: ImportYomichanDictionaryUseCase;
        }
    ){        
        this.importYomichanDictionaryUseCase = input.importYomichanDictionaryUseCase;        
    }

    async importYomichanDictionary(
        input: { 
            zipFilePath: string,
            sourceLanguage: Language,
            targetLanguage: Language,
            progressCallBack: DictionaryImportProgressCallBack,
        }
    ) {
        const {
            zipFilePath,
            sourceLanguage,
            targetLanguage,
            progressCallBack
        } = input;

        try {

            const extractedDictPath = await YomichanImportService.extractDictionary( zipFilePath );

            const index = await YomichanImportService.getDictionaryIndex( extractedDictPath );        

            const tagBank = await YomichanImportService.getDictionaryTagBank( extractedDictPath );
            
            // Creating dictionary and importing Tags
            await this.importYomichanDictionaryUseCase.execute({
                dictionaryName: index.title,
                dictionaryVersion: index.revision,
                sourceLanguage,
                targetLanguage,
                tagBank: tagBank
            });

            const termBankGenerator = YomichanImportService.getDictionaryTermBanks( extractedDictPath );

            let iterator = termBankGenerator.next();
            
            // Importing terms (Headwords and Definitions)
            while ( !iterator.done ) {

                const { termBank, progress } = iterator.value;
                
                await this.importYomichanDictionaryUseCase.execute({
                    dictionaryName: index.title,
                    sourceLanguage,
                    targetLanguage,
                    termBank
                });

                console.log(`term bank import progress: ${progress}%`);

                progressCallBack({
                    progress,
                    status: 'importing',
                });
            
                // Move to the next item in the generator
                iterator = termBankGenerator.next();
            }            

            // // Importing terms (Headwords and Definitions)
            // for ( const { termBank, progress } of termBankGenerator ) {

            //     await this.importYomichanDictionaryUseCase.execute({
            //         dictionaryName: index.title,
            //         sourceLanguage,
            //         targetLanguage,
            //         termBank
            //     });

            //     console.log(`term bank import progress: ${progress}%`);

            //     progressCallBack({
            //         progress,
            //         status: 'importing',
            //     });
            // }

            YomichanImportService.cleanTemporaryFiles();
            
            progressCallBack({
                progress: 100,
                status: 'completed',
            });

        } catch ( error ) {
            console.error( error );

            progressCallBack({
                progress: 0,
                status: 'failed',
                error: 'yomichan-dictionary-import-error'                
            });
        }

        
    }

    static async extractDictionary( zipFilePath: string ): Promise<string> {        

        
        const fileName = path.basename( zipFilePath ).split('.zip')[0];
            
        const extractedDictPath = './data/temp_dictionaries/'+fileName;

        if ( !fs.existsSync( extractedDictPath ))
            fs.mkdirSync( extractedDictPath, { recursive: true } );

        const zip = new StreamZip.async({ file: zipFilePath });
        
        const count = await zip.extract( null, extractedDictPath );        
        await zip.close();
        
        return extractedDictPath;
    }

    static cleanTemporaryFiles() {

        fs.rmSync('./data/temp_dictionaries', { recursive: true, force: true });
    }

    // static getDictionariesPath() {

    //     const dictionariesPath = isDev
    //     ? join( DATA_DIR, '/temp_dictionaries' )
    //     : join( process.resourcesPath, '../data/temp_dictionaries' );

    //     return dictionariesPath;
    // }

    static async getDictionaryIndex( dictionaryPath: string ): Promise< YomichanDictionaryIndex > {

        const indexRaw = await fsPromises.readFile( dictionaryPath+'/index.json', 'utf-8' );

        return JSON.parse( indexRaw ) as YomichanDictionaryIndex;
    }

    static async getDictionaryTagBank( dictionaryPath: string ): Promise< YomichanTagBankItem[] > {

        const files = fs.readdirSync(dictionaryPath);

        let tagBankRaw: string = '';

        for ( const filename of files ) {

            if ( !filename.includes('tag_bank') ) continue;

            const filePath = path.join(dictionaryPath, filename);

            tagBankRaw = await fsPromises.readFile( filePath, 'utf-8' );

            break;
        }

        return ( JSON.parse( tagBankRaw ) as any[] )
            ?.map( item => {
                const [
                    name,
                    category,
                    order,
                    content,
                    popularity_score
                ] = item;

                return {
                    name,
                    category,
                    order,
                    content,
                    popularity_score
                }
            });        
    }

    static * getDictionaryTermBanks( dictionaryPath: string ): Generator<
        { termBank: YomichanTermBankItem[], progress: number }
    > {

        const files = fs.readdirSync(dictionaryPath);

        let fileCount = 0;
        const total: number = files.filter(
            fileName => fileName.includes( 'term_bank' )
        ).length;

      
        for (const fileName of files) {

          if ( fileName.includes('term_bank') ) {

            const filePath = path.join(dictionaryPath, fileName);
            const fileContent = fs.readFileSync(filePath, 'utf8');

            fileCount++;

            const progress = ( fileCount / total ) * 100;

            const termBank = (JSON.parse(fileContent) as any[])
                ?.map( item => {
                    const [
                        term,
                        reading,
                        definition_tags,
                        rule_id,
                        popularity,
                        definitions,
                        sequence,
                        term_tags
                    ] = item;

                    return {
                        term,
                        reading,
                        definition_tags,
                        rule_id,
                        popularity,
                        definitions,
                        sequence,
                        term_tags
                    }
                });

                yield {
                    termBank,
                    progress
                }
            }
            
        }

      }
}