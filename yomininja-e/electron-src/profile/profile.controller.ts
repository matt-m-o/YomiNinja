import { BrowserWindow, IpcMainInvokeEvent, ipcMain, shell } from "electron";
import { get_AppGithubUrl } from "../@core/infra/container_registry/adapters_registry";
import { ProfileService } from "./profile.service";
import { LanguageJson } from "../@core/domain/language/language";
import { getActiveProfile } from "../@core/infra/app_initialization";


export class ProfileController {

    private profileService: ProfileService;
    private mainWindow: BrowserWindow;

    constructor( input: {
        profileService: ProfileService,
    }) {

        this.profileService = input.profileService;
    }

    init( mainWindow: BrowserWindow ) {

        this.mainWindow = mainWindow;

        this.registerHandlers();
    }

    private registerHandlers( ) {

        ipcMain.handle( 'profile:get_profile',
            async ( event: IpcMainInvokeEvent ) => {                        
                    
                const profile = await this.profileService.getProfile({                    
                    profileId: getActiveProfile().id
                });                

                return profile?.toJson();
            }
        );
        
        ipcMain.handle( 'profile:change_active_ocr_language',
            async ( event: IpcMainInvokeEvent, message: LanguageJson ) => {
                
                if ( !message ) return;
                    
                this.profileService.changeActiveOcrLanguage({
                    language: message,
                    profileId: getActiveProfile().id
                });

                return;
            }
        );

        ipcMain.handle( 'profile:change_selected_ocr_engine',
            async ( event: IpcMainInvokeEvent, ocrEngineAdapterName: string ) => {
                
                if ( !ocrEngineAdapterName ) return;
                    
                this.profileService.changeSelectedOcrEngine({
                    ocrEngineAdapterName,
                    profileId: getActiveProfile().id
                });

                return;
            }
        );
    }

}