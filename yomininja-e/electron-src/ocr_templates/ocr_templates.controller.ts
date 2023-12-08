import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from "electron";
import { OcrTemplatesService } from "./ocr_templates.service";
import { OcrTemplateJson } from "../@core/domain/ocr_template/ocr_template";
import { GetOcrTemplates_Input } from "../@core/application/use_cases/ocr_template/get_ocr_template/get_ocr_templates.use_case";


export class OcrTemplatesController {

    ocrTemplatesService: OcrTemplatesService;
    mainWindow: BrowserWindow;

    constructor( input: {
        ocrTemplatesService: OcrTemplatesService
    }) {
        this.ocrTemplatesService = input.ocrTemplatesService;
    }


    init( input: { mainWindow: BrowserWindow }) {

        this.mainWindow = input.mainWindow;
    }

    private registersIpcHandlers() {

        ipcMain.handle( 'ocr_templates:create', 
            async ( event: IpcMainInvokeEvent, message: OcrTemplateJson ): Promise< void > => {
                
                if ( !message ) return;

                await this.ocrTemplatesService.createOcrTemplate( message );
            }
        );
        
        ipcMain.handle( 'ocr_templates:get', 
            async ( event: IpcMainInvokeEvent, message?: GetOcrTemplates_Input ): Promise< OcrTemplateJson[] > => {
                
                return await this.ocrTemplatesService.getOcrTemplates( message || {} );
            }
        );
    }
}