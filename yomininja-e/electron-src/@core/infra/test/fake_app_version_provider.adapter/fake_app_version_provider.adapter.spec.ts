import { FakeAppVersionProviderAdapter } from "./fake_app_version_provider.adapter";


describe( "FakeAppVersionProviderAdapter tests", () => {

    const runningVersion = '1.0.0';
    const releases = [
        { tag_name: '1.0.0' }
    ];

    let appVersionProvider: FakeAppVersionProviderAdapter;    

    beforeEach( () => {
        appVersionProvider = new FakeAppVersionProviderAdapter({
            runningVersion, releases
        });
    });

    it('should get the running app version', () => {

        const output = appVersionProvider.getRunningVersion();

        expect( output ).toStrictEqual( runningVersion );

    });

    it('should get the latest app version', async () => {

        const output = await appVersionProvider.getLatestVersion();

        expect( output ).toStrictEqual( releases[0].tag_name );

    });

    it('should say that the app up to date', async () => {

        const output = await appVersionProvider.isUpToDate();

        expect( output ).toStrictEqual( true );

    });

    it('should say that the app is NOT up to date', async () => {

        appVersionProvider.releases.unshift({
            tag_name: '1.1.0',
        });

        const output = await appVersionProvider.isUpToDate();

        expect( output ).toStrictEqual( false );

    });
})