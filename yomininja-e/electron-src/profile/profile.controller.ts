import { BrowserWindow, IpcMainInvokeEvent, shell } from "electron";
import { get_AppGithubUrl } from "../@core/infra/container_registry/adapters_registry";
import { ProfileService } from "./profile.service";
import { LanguageJson } from "../@core/domain/language/language";
import { getActiveProfile } from "../@core/infra/app_initialization";
import { Profile } from "../@core/domain/profile/profile";
import { ipcMain } from "../common/ipc_main";


export class ProfileController {

    private profileService: ProfileService;
    private mainWindow: BrowserWindow;
    private overlayWindow: BrowserWindow;

    constructor(
        input: {
            profileService: ProfileService,
        }
    ) {

        this.profileService = input.profileService;
    }

    init(
        input: {
            mainWindow: BrowserWindow,
            overlayWindow: BrowserWindow
        }
    ) {

        this.mainWindow = input.mainWindow;
        this.overlayWindow = input.overlayWindow;

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
                    
                await this.profileService.changeActiveOcrLanguage({
                    language: message,
                    profileId: getActiveProfile().id
                });

                const profile = await this.getActiveProfile();

                if ( profile ) {
                    this.overlayWindow?.webContents.send(
                        'profile:active_profile',
                        profile.toJson()
                    );
                }

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

    async getActiveProfile(): Promise<Profile | null> {
        return await this.profileService.getProfile({                    
            profileId: getActiveProfile().id
        });
    }

}