import { desktopCapturer } from "electron";
import { TaskbarProperties } from "../../gyp_modules/window_management/window_manager";
import { GetActiveSettingsPresetUseCase } from "../@core/application/use_cases/get_active_settings_preset/get_active_settings_preset.use_case";
import { getActiveProfile, windowManager } from "../@core/infra/app_initialization";
import { CaptureSource, ExternalWindow } from "./types";
import { screen } from 'electron';
import sharp from "sharp";


export const entireScreenAutoCaptureSource: CaptureSource = {
    id: '',
    name: 'Entire screen',
    displayId: -1,
    type: 'screen',
};

export class AppService {

    getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;

    constructor( input: {
        getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase
    }) {
        this.getActiveSettingsPresetUseCase = input.getActiveSettingsPresetUseCase;
    }

    
    async getActiveSettingsPreset() {
        return await this.getActiveSettingsPresetUseCase.execute({
            profileId: getActiveProfile().id
        });
    }

    getTaskbar(): TaskbarProperties {

        return windowManager.getTaskbar();
    }

    async getAllCaptureSources(): Promise< CaptureSource[] > {

        const isWaylandSession = (
            process.platform === 'linux'&&
            Boolean(process.env.WAYLAND_DISPLAY)
        );

        const types: ("screen" | "window")[] = [ 'screen', 'window' ];
        const thumbnailSize = { width: 0, height: 0 };
        
        let sources: Electron.DesktopCapturerSource[] = [];

        if ( !isWaylandSession ) {
            sources = await desktopCapturer.getSources({
                types,
                thumbnailSize
            });
        }
        else {
            // sources = [
            //     ...( await desktopCapturer.getSources({
            //         types: [ types[0] ],
            //         thumbnailSize
            //     })),
            //     ...( await desktopCapturer.getSources({
            //         types: [ types[1] ],
            //         thumbnailSize
            //     }))
            // ];

            sources = await desktopCapturer.getSources({
                types,
                thumbnailSize
            });
        }
        

        const results: CaptureSource[] = sources.map( source => ({
            id: source.id,
            displayId: Number(source.display_id),
            name: source.name,
            type: source.id.includes('window') ? 'window' : 'screen',
        }));

        const displaysSources = sources.filter( source => source.display_id );
            
        // If there are more than 1 display, the auto capture source option must be available
        if ( displaysSources.length > 1 )
            results.unshift( entireScreenAutoCaptureSource );

        return results;
    }

    getDisplay( id: number ): Electron.Display | undefined {
        return screen.getAllDisplays()
            .find( display => display.id === id );
    }

    getCurrentDisplay(): Electron.Display {
        
        // screen.getAllDisplays().forEach( ({ id, label }, idx ) => console.log({
        //     idx, id, label
        // }));
            
        const { getCursorScreenPoint, getDisplayNearestPoint } = screen;
        
        return getDisplayNearestPoint( getCursorScreenPoint() );
    }

    getAllDisplays(): Electron.Display[] {
        return screen.getAllDisplays();
    }

    async getExternalWindow( id: number ): Promise< ExternalWindow | undefined > {

        const sources = await desktopCapturer.getSources({
            types: [ 'window' ],
            thumbnailSize: {
                width: 0,
                height: 0
            },
        });

        const windowCaptureSource = sources.find( source => source.id.includes( String(id) ) );

        if ( !windowCaptureSource ) return;
                
        const windowProps = await windowManager.getWindow( Number( windowCaptureSource?.id.split(':')[1] ) );
        if ( !windowProps ) return;

        const externalWindow: ExternalWindow = {
            id: Number(windowCaptureSource.id.split(':')[1]),
            name: windowCaptureSource.name,
            position: windowProps.position,
            size: windowProps.size
        };

        return externalWindow;
    }
    
    async getCaptureSourceImage( input: {
        image?: Buffer;
        display?: Electron.Display;
        window?: ExternalWindow;
    }): Promise< Buffer | undefined > {

        let { image, display, window } = input;

        if ( !image ) {
            image = await this.takeScreenshot({ display, window });
        }
        else if (window) {
            // cropping image according to window properties
            image = await this.cropWindowFromImage( window, image );
        }

        return image;
    }

    private async takeScreenshot( input: { display?: Electron.Display, window?: ExternalWindow }): Promise< Buffer | undefined > {
        // console.time('takeScreenshot');        

        const { display, window } = input;

        let sourceTypes: ( 'window' | 'screen' )[] = [];          

        if ( display )
            sourceTypes.push('screen');
        else if ( window )
            sourceTypes.push('window');

        const sources = await desktopCapturer.getSources({
            types: sourceTypes,
            thumbnailSize: {
                width: window?.size.width || display?.size.width || 1920, // workAreaSize.width, // 2560 // 1920 // 1280
                height: window?.size.height || display?.size.height || 1080, // workAreaSize.height, // 1440 // 1080 // 720
            },
        });
        
        let source: Electron.DesktopCapturerSource | undefined;

        if ( display ) {
            const displayId = display.id.toString();
            source = sources.find( source => source.display_id.includes( displayId ) );

            if ( !source )
                source = sources.find( source => source.name.includes( 'Entire screen' ) );
        }
        else if ( window ) {
            const windowId = window.id.toString();
            source = sources.find( source => source.id.includes( windowId ) );
        }

        // sources.forEach( ({ id, display_id, name } ) => console.log({
        //     id, display_id, name
        // }));

        // console.timeEnd('takeScreenshot');

        if ( !source )
            return;

        if ( display ) {
            
            return source.thumbnail.toPNG()
        }

        return source.thumbnail.toPNG();
    }


    async cropWindowFromImage( window: ExternalWindow, image: Buffer ): Promise<Buffer> {

        // console.log('cropping window from image')

        const metadata = await sharp(image).metadata();

        if (
            metadata.width == window.size.width &&            
            metadata.height == window.size.height
        )
            return image;

        return await sharp(image).extract({
                left: window.position.x,
                top: window.position.y,
                width: window.size.width,
                height: window.size.height,
            })
            .toBuffer();    
    }
}


