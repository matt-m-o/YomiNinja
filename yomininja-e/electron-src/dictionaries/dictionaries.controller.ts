import { BrowserWindow, IpcMainInvokeEvent, ipcMain, shell } from "electron";
import { YomichanImportService } from "./yomichan/yomichan_import.service";
import { Language, LanguageJson } from "../@core/domain/language/language";

type DictionaryFormats = 'yomichan';

export class DictionariesController {

    private yomichanImportService: YomichanImportService;
    private mainWindow: BrowserWindow;

    constructor( input: {
        yomichanImportService: YomichanImportService,
    }) {

        this.yomichanImportService = input.yomichanImportService;    
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

}

