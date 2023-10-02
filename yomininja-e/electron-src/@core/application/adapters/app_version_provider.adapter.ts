

export interface AppVersionProviderAdapter {

    getRunningVersion: () => string;
    getLatestVersion: () => Promise< string >;
    isUpToDate: ( input?: { current: string, other: string }) => Promise< boolean >;
}