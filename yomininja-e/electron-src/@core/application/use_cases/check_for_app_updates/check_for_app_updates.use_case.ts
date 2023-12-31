import { AppVersionProviderAdapter } from "../../adapters/app_version_provider.adapter";


export type CheckForAppUpdates_Output = {
    runningVersion: string;
    latestVersion: string;
    isUpToDate: boolean;
    success: boolean;
}

export class CheckForAppUpdatesUseCase {

    constructor(        
        public appVersionProvider: AppVersionProviderAdapter,
    ) {}

    async execute(): Promise< CheckForAppUpdates_Output > {
        
        const runningVersion = await this.appVersionProvider.getRunningVersion();

        try {

            const latestVersion = await this.appVersionProvider.getLatestVersion();
            const isUpToDate = await this.appVersionProvider.isUpToDate();

            return {
                runningVersion,
                latestVersion,
                isUpToDate,
                success: true,
            }
            
        } catch (error) {
            
            return {
                runningVersion,
                latestVersion: runningVersion,
                isUpToDate: true,
                success: false,
            }
        }
    }   
}