import { GithubAppVersionProviderAdapter } from "./github_app_version_provider.adapter";


describe('GithubAppVersionProviderAdapter tests', () => {

    const runningVersion = '1.0.0';
    let appVersionProvider: GithubAppVersionProviderAdapter;

    beforeEach( () => {

        // Using an archived github repository
        appVersionProvider = new GithubAppVersionProviderAdapter({
            githubRepoUrl: 'https://github.com/twitter/AnomalyDetection',
        });

        // Forcing specific version for testing purposes;
        appVersionProvider.runningVersion = runningVersion;
    });
    

    it('should get the current running version', async () => {

        const output = appVersionProvider.getRunningVersion();

        expect(output).toStrictEqual( runningVersion );
    });

    it('should get the latest version available', async () => {

        const output = await appVersionProvider.getLatestVersion();

        expect(output).toStrictEqual( '1.0.0' );
    });

    it('should report that the app is up to date', async () => {

        const output = await appVersionProvider.isUpToDate();

        expect(output).toBeTruthy();
    });

    it('should report that the app is NOT up to date', async () => {

        appVersionProvider.runningVersion = '0.1.1'

        const output = await appVersionProvider.isUpToDate();

        expect(output).toBeFalsy();
    });
});