import { CheckForAppUpdatesUseCase, CheckForAppUpdates_Output } from "../@core/application/use_cases/check_for_app_updates/check_for_app_updates.use_case";
import { differenceInMinutes } from 'date-fns';
import os, { platform } from 'os';
import { isLinux, isWaylandDisplay } from "../util/environment.util";

export class AppInfoService {

    private checkForAppUpdatesUseCase: CheckForAppUpdatesUseCase;

    private appVersionCheckedAt: Date;
    private latestAppVersionCheck: CheckForAppUpdates_Output;

    constructor(
        input: {
            checkForAppUpdatesUseCase: CheckForAppUpdatesUseCase;            
        }
    ){        
        this.checkForAppUpdatesUseCase = input.checkForAppUpdatesUseCase;        
    }

    async checkForAppUpdates() {        

        if ( 
            !this.appVersionCheckedAt ||
            differenceInMinutes( new Date(), this.appVersionCheckedAt ) > 15
        ) {            
            this.appVersionCheckedAt = new Date();
            this.latestAppVersionCheck = await this.checkForAppUpdatesUseCase.execute();
        }

        return this.latestAppVersionCheck;
    }

    getSystemInfo(): SystemInfo {

        const info: SystemInfo = {
            platform: os.platform(),
            osVersion: os.version(),
            cpuModel: os.cpus()[0].model,
            cpuArch: os.arch(),
            appArch: process.arch,
        };

        if ( isLinux ) {
            info.windowSystem = isWaylandDisplay ?
                "Wayland" :
                "Xorg";
        }

        return info;
    }
}

export type SystemInfo = {
    platform: NodeJS.Platform;
    osVersion: string;
    cpuModel: string;
    cpuArch: string;
    appArch: string;
    windowSystem?: string;
}