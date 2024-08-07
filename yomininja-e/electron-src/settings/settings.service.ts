import { session } from "electron";
import { GetActiveSettingsPresetUseCase } from "../@core/application/use_cases/get_active_settings_preset/get_active_settings_preset.use_case";
import { UpdateSettingsPresetUseCase } from "../@core/application/use_cases/update_settings_preset/update_settings_preset.use_case";
import { SettingsPreset, SettingsPresetJson } from "../@core/domain/settings_preset/settings_preset";
import { CloudVisionAPICredentials } from "../@core/infra/ocr/cloud_vision_ocr.adapter/cloud_vision_api";
import { CloudVisionOcrEngineSettings, cloudVisionOcrAdapterName } from "../@core/infra/ocr/cloud_vision_ocr.adapter/cloud_vision_ocr_settings";
import { UpdateSettingsPresetUseCaseInstance } from "../@core/infra/types/use_case_instance.types";
import { GoogleLensOcrEngineSettings, googleLensOcrAdapterName } from "../@core/infra/ocr/google_lens_ocr.adapter/google_lens_ocr_settings";
import { get_GoogleLensOcrAdapter } from "../@core/infra/container_registry/adapters_registry";


export class SettingsService {

    private getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;
    private updateSettingsPresetUseCase: UpdateSettingsPresetUseCaseInstance;

    constructor(
        input: {
            getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;
            updateSettingsPresetUseCase: UpdateSettingsPresetUseCaseInstance;
        }
    ){
        this.getActiveSettingsPresetUseCase = input.getActiveSettingsPresetUseCase;
        this.updateSettingsPresetUseCase = input.updateSettingsPresetUseCase;
    }

    async getActiveSettings( input: { profileId: string }): Promise< SettingsPreset | null > {
        
        return await this.getActiveSettingsPresetUseCase.execute({
            ...input,
        });
    }

    async updateSettingsPreset( settingsPresetJson: SettingsPresetJson ) {

        return await this.updateSettingsPresetUseCase.execute( settingsPresetJson );
    }

    async updateCloudVisionCredentials(
        profileId: string,
        input: CloudVisionAPICredentials
    ) {
        const activeSettings = await this.getActiveSettings({ profileId });

        if ( !activeSettings ) return;

        const cloudVisionSettings = activeSettings
            .getOcrEngineSettings<CloudVisionOcrEngineSettings>(cloudVisionOcrAdapterName);

        if ( !cloudVisionSettings ) return;

        activeSettings?.updateOcrEngineSettings<CloudVisionOcrEngineSettings>({
            ocr_adapter_name: cloudVisionOcrAdapterName,
            private_key: input.privateKey,
            client_email: input.clientEmail,
            token: input.token
        });

        console.log( activeSettings.toJson().ocr_engines );

        await this.updateSettingsPreset( activeSettings.toJson() );
    }

    async getGoogleCookies(): Promise< Electron.Cookie[] > {

        const { defaultSession } = session;

        const allCookies = await defaultSession.cookies.get({
            domain: '.google.com'
        });

        return allCookies;
    }

    async removeGoogleCookies() {

        const { defaultSession } = session;

        const allCookies = await defaultSession.cookies.get({
            domain: '.google.com'
        });

        for ( const cookie of allCookies ) {

            await defaultSession.cookies.remove(
                `https://${cookie.domain}${cookie.path}`,
                cookie.name
            );
        }

        get_GoogleLensOcrAdapter()
            .removeCookies();
    }
}