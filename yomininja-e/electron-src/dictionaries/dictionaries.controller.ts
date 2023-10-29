import { BrowserWindow, IpcMainInvokeEvent, ipcMain, shell } from "electron";
import { YomichanImportService } from "./yomichan/yomichan_import.service";
import { Language, LanguageJson } from "../@core/domain/language/language";
import { DictionaryDefinition } from "../@core/domain/dictionary/dictionary_definition/dictionary_definition";
import { DictionariesService } from "./dictionaries.service";
import { DictionaryHeadword } from "../@core/domain/dictionary/dictionary_headword/dictionary_headword";
import { JmdictImportService } from "./Jmdict/Jmdict_import.service";

type DictionaryFormats = 'yomichan' | 'jmdictFurigana';

export class DictionariesController {

    private yomichanImportService: YomichanImportService;
    private dictionariesService: DictionariesService;
    private jmdictImportService: JmdictImportService;

    private mainWindow: BrowserWindow;
    private overlayWindow: BrowserWindow;

    constructor( input: {
        yomichanImportService: YomichanImportService,
        jmdictImportService: JmdictImportService,
        dictionariesService: DictionariesService,
    }) {

        this.yomichanImportService = input.yomichanImportService;
        this.dictionariesService = input.dictionariesService;
        this.jmdictImportService = input.jmdictImportService;
    }

    init( input: { 
        mainWindow: BrowserWindow,
        overlayWindow: BrowserWindow,
    }) {

        this.mainWindow = input.mainWindow;
        this.overlayWindow = input.overlayWindow;

        this.registersIpcHandlers();

        // this.importDictionary({
        //     format: 'yomichan',
        //     sourceLanguage: Language.create({ name: 'japanese', two_letter_code: 'ja' }).toJson(),
        //     targetLanguage: Language.create({ name: 'english', two_letter_code: 'en' }).toJson(),
        //     filePath: './data/jmdict_english.zip',
        // });

        // const language = Language.create({ name: 'japanese', two_letter_code: 'ja' }).toJson();
        // this.importDictionary({
        //     format: 'jmdictFurigana',
        //     filePath: './data/JmdictFurigana.txt',
        //     sourceLanguage: language,
        //     targetLanguage: language,
        // });
    }

    private registersIpcHandlers() {

        ipcMain.handle( 'dictionaries:search', 
            async ( event: IpcMainInvokeEvent, message: string ): Promise< DictionaryHeadword[] > => {

                if ( !message || message.length === 0 ) return[];                

                const result = await this.search( message );                

                return result;
            }
        );
    }

    async search( text: string ): Promise< DictionaryHeadword[] > {        

        const headwords = await this.dictionariesService.searchHeadwords(text);

        return headwords;
    }

    importDictionary( 
        input: {
            format: DictionaryFormats,            
            sourceLanguage: LanguageJson,
            targetLanguage: LanguageJson,
            filePath: string,
        }
    ) {         

        const sourceLanguage = Language.create({
            ...input.sourceLanguage,            
        });

        const targetLanguage = Language.create({
            ...input.targetLanguage,
        });


        if ( input.format === 'yomichan' ) {

            this.yomichanImportService.importYomichanDictionary({
                zipFilePath: input.filePath,
                sourceLanguage,
                targetLanguage
            });

        }
        else if ( input.format === 'jmdictFurigana' ) {

            this.jmdictImportService.importFuriganaDictionary({
                txtFilePath: input.filePath
            });
        }
    }

}

