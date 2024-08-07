import { app } from "electron";
import { AppVersionProviderAdapter } from "../../application/adapters/app_version_provider.adapter";
import axios, { AxiosInstance } from 'axios';
import semver from 'semver';

export class GithubAppVersionProviderAdapter implements AppVersionProviderAdapter {

    githubRepoUrl: string;
    runningVersion: string | undefined;
    httpClient: AxiosInstance;
    releases: GitHubRelease[] = [];

    constructor( input: { githubRepoUrl: string } ) {

        this.githubRepoUrl = input.githubRepoUrl;

        const githubApiUrl = 'https://api.github.com/repos';

        const repoApiUrl = githubApiUrl + this.githubRepoUrl.split("https://github.com")[1];

        this.httpClient = axios.create({
            baseURL: repoApiUrl,
        });
    }
    
    getRunningVersion(): string {

        if ( !this.runningVersion )
            this.runningVersion = app.getVersion();

        return this.runningVersion;
    }

    async getLatestVersion(): Promise< string > {

        if ( this.releases.length == 0 )
            await this.getGithubRepoReleases();

        const latest = this.releases[0];

        const tagName = semver.valid( latest?.tag_name );

        if ( !tagName )
            throw new Error('invalid-semver-tag');

        return tagName;
    }

    async isUpToDate(): Promise<boolean> {

        const latest = await this.getLatestVersion();

        const isNewerVersionAvailable = semver.gt( latest, this.getRunningVersion() );
                
        return !isNewerVersionAvailable;
    }

    private async getGithubRepoReleases(): Promise< GitHubRelease[] > {

        const { data } = await this.httpClient.get< GitHubRelease[] >('/releases');        

        this.releases = data;

        return data;
    }
}

interface GitHubRelease {
    id: number;
    tag_name: string;
    name: string;
}
