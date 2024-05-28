import { BrowserWindow, IpcMainInvokeEvent, dialog, ipcMain, shell } from "electron";
import { YomichanImportService } from "./yomichan/yomichan_import.service";
import { Language, LanguageJson } from "../@core/domain/language/language";
import { DictionaryDefinition } from "../@core/domain/dictionary/dictionary_definition/dictionary_definition";
import { DictionariesService } from "./dictionaries.service";
import { DictionaryHeadword } from "../@core/domain/dictionary/dictionary_headword/dictionary_headword";
import { JmdictImportService } from "./Jmdict/Jmdict_import.service";
import path from "path";
import { DictionaryImportProgress } from "./common/dictionary_import_progress";
import { Dictionary } from "../@core/domain/dictionary/dictionary";

export type DictionaryFormats = 'yomichan' | 'jmdictFurigana';

export type ImportDictionaryDto = {
    format: DictionaryFormats,
    sourceLanguage: LanguageJson, // two-letter code
    targetLanguage: LanguageJson, // two-letter code    
}

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
    }

    private registersIpcHandlers() {

        ipcMain.handle( 'dictionaries:search', 
            async ( event: IpcMainInvokeEvent, message: string ): Promise< DictionaryHeadword[] > => {

                if ( !message || message.length === 0 ) return[];                

                const result = await this.search( message );                

                return result;
            }
        );

        ipcMain.handle( 'dictionaries:import', 
            async ( event: IpcMainInvokeEvent, input: ImportDictionaryDto ): Promise< string | undefined > => {

                const { format, sourceLanguage, targetLanguage } = input;

                const filters: Electron.FileFilter[] = [];

                if ( format === 'yomichan' ) {
                    filters.push({
                        name: 'Zipped Yomichan Dictionary',
                        extensions: [ 'zip' ]
                    });
                }
                else if ( format === 'jmdictFurigana' ) {
                    filters.push({
                        name: 'JmdictFurigana file',
                        extensions: [ 'txt' ]
                    });
                }

                const { filePaths } = await dialog.showOpenDialog(
                    this.mainWindow,
                    {                        
                        properties: ['openFile'],
                        filters,
                    }
                );
                
                const fileName = path.basename( filePaths[0] );

                if ( fileName ) {
                    this.importDictionary({
                        filePath: filePaths[0],
                        format,
                        sourceLanguage,
                        targetLanguage
                    })
                }
                
                return fileName || '' ;
            }
        );

        ipcMain.handle( 'dictionaries:get_all_installed', 
            async ( event: IpcMainInvokeEvent ): Promise< Dictionary[] > => {
                return await this.dictionariesService.getInstalledDictionaries();
            }
        );

        ipcMain.handle( 'dictionaries:delete_all', 
            async ( event: IpcMainInvokeEvent ): Promise< void > => {
                await this.dictionariesService.deleteAllDictionaries();
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
                targetLanguage,
                progressCallBack: this.importProgressCallBack
            });

        }
        else if ( input.format === 'jmdictFurigana' ) {

            this.jmdictImportService.importFuriganaDictionary({
                txtFilePath: input.filePath,
                progressCallBack: this.importProgressCallBack
            });
        }
    }

    private importProgressCallBack = ( input: DictionaryImportProgress ) => {

        this.mainWindow.webContents.send( 'dictionaries:import_progress', input );
    }

}

