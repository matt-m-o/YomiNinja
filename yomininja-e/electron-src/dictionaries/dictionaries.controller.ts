import { BrowserWindow, IpcMainInvokeEvent, ipcMain, shell } from "electron";
import { YomichanImportService } from "./yomichan/yomichan_import.service";
import { Language, LanguageJson } from "../@core/domain/language/language";
import { DictionaryDefinition } from "../@core/domain/dictionary/dictionary_definition/dictionary_definition";
import { DictionariesService } from "./dictionaries.service";
import { DictionaryHeadword } from "../@core/domain/dictionary/dictionary_headword/dictionary_headword";

type DictionaryFormats = 'yomichan';

export class DictionariesController {

    private yomichanImportService: YomichanImportService;
    private dictionariesService: DictionariesService;

    private mainWindow: BrowserWindow;

    constructor( input: {
        yomichanImportService: YomichanImportService,
        dictionariesService: DictionariesService,
    }) {

        this.yomichanImportService = input.yomichanImportService;
        this.dictionariesService = input.dictionariesService;
    }

    init( mainWindow: BrowserWindow ) {

        this.mainWindow = mainWindow;

        // this.importDictionary({
        //     format: 'yomichan',
        //     sourceLanguage: Language.create({ name: 'japanese', two_letter_code: 'ja' }).toJson(),
        //     targetLanguage: Language.create({ name: 'english', two_letter_code: 'en' }).toJson(),
        //     zipFilePath: './data/jmdict_english.zip',
        // });                
    }

    importDictionary( 
        input: {
            format: DictionaryFormats,            
            sourceLanguage: LanguageJson,
            targetLanguage: LanguageJson,
            zipFilePath: string,
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
                zipFilePath: input.zipFilePath,
                sourceLanguage,
                targetLanguage
            });

        }
    }


    async search( text: string ): Promise< DictionaryHeadword[] > {        

        text = text.slice(0, 15);

        const headwords = await this.dictionariesService.searchHeadwords(text);

        return headwords;
    }

}

