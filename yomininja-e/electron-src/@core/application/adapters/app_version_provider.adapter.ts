

export interface AppVersionProviderAdapter {

    getRunningVersion: () => string;
    getLatestVersion: () => Promise< string >;
    isUpToDate: () => Promise< boolean >;
}