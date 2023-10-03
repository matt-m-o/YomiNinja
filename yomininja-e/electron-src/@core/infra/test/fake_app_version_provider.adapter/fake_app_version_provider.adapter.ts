import { AppVersionProviderAdapter } from "../../../application/adapters/app_version_provider.adapter";
import semver from 'semver';

export class FakeAppVersionProviderAdapter implements AppVersionProviderAdapter {
    
    runningVersion: string;    
    releases: Releases[] = [];

    constructor( input: { runningVersion: string, releases: Releases[] } ) {

        this.runningVersion = input.runningVersion;
        this.releases = input.releases;
    }
    
    getRunningVersion(): string {

        return this.runningVersion;        
    }

    async getLatestVersion(): Promise< string > {
        
        const latest = this.releases[0];

        const tagName = semver.valid( latest.tag_name );

        if ( !tagName )
            throw new Error('invalid-semver-tag');

        return tagName;
    }

    async isUpToDate(): Promise<boolean> {

        const latest = await this.getLatestVersion();

        const isNewerVersionAvailable = semver.gt( latest, this.runningVersion );
                
        return !isNewerVersionAvailable;
    }
}

interface Releases {    
    tag_name: string;    
}
