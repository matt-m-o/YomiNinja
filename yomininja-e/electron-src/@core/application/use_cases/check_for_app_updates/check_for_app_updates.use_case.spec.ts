import { FakeAppVersionProviderAdapter } from "../../../infra/test/fake_app_version_provider.adapter/fake_app_version_provider.adapter";
import { CheckForAppUpdatesUseCase } from "./check_for_app_updates.use_case";



describe('CheckForAppUpdatesUseCase tests', () => {

    const runningVersion = '1.0.0';
    const releases = [
        { tag_name: '1.0.0' }
    ];

    let appVersionProvider: FakeAppVersionProviderAdapter;
    let checkForAppUpdates: CheckForAppUpdatesUseCase;

    beforeEach( () => {
        appVersionProvider = new FakeAppVersionProviderAdapter({
            runningVersion, releases
        });

        checkForAppUpdates = new CheckForAppUpdatesUseCase( appVersionProvider );
    });
    
    it('should say that the app is up to date', async () => {

        const output = await checkForAppUpdates.execute();

        expect( output.runningVersion ).toStrictEqual( runningVersion );
        expect( output.latestVersion ).toStrictEqual( releases[0].tag_name );
        expect( output.isUpToDate ).toBeTruthy();
    });

    it('should say that the app is NOT up to date', async () => {

        appVersionProvider.releases.unshift({
            tag_name: '1.1.0'
        });

        const output = await checkForAppUpdates.execute();

        expect( output.runningVersion ).toStrictEqual( runningVersion );
        expect( output.latestVersion ).toStrictEqual( '1.1.0' );
        expect( output.isUpToDate ).toBeFalsy();
    });
})