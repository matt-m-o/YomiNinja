import { desktopCapturer } from "electron";
import { TaskbarProperties } from "../../gyp_modules/window_management/window_manager";
import { GetActiveSettingsPresetUseCase } from "../@core/application/use_cases/get_active_settings_preset/get_active_settings_preset.use_case";
import { getActiveProfile, windowManager } from "../@core/infra/app_initialization";
import { CaptureSource, ExternalWindow } from "./types";
import { screen } from 'electron';
import sharp from "sharp";
const isMacOs = process.platform === 'darwin';
import { isLinux, isWaylandDisplay } from "../util/environment.util";


export const entireScreenAutoCaptureSource: CaptureSource = {
    id: '',
    name: 'Entire screen',
    displayId: -1,
    type: 'screen',
};

export class AppService {

    getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase;
    entireScreenCaptureSource: CaptureSource;


    constructor( input: {
        getActiveSettingsPresetUseCase: GetActiveSettingsPresetUseCase
    }) {
        this.getActiveSettingsPresetUseCase = input.getActiveSettingsPresetUseCase;
    }

    async init() {
        if ( this.entireScreenCaptureSource ) return;

        const sources = isWaylandDisplay ? []:
            await this.getAllCaptureSources();

        this.entireScreenCaptureSource = sources.find(
            source => source.name.includes( 'Entire screen' )
        ) || entireScreenAutoCaptureSource;
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

        // console.time('getAllCaptureSources time');
        
        console.log(`\nisWaylandDisplay: ${isWaylandDisplay}\n`);

        const types: ("screen" | "window")[] = [ 'screen', 'window' ];
        const thumbnailSize = { width: 0, height: 0 };
        
        let sources: Electron.DesktopCapturerSource[] = [];

        if ( !isWaylandDisplay ) {
            sources = await desktopCapturer.getSources({
                types,
                thumbnailSize,
            });
        }
        else {
            
            // sources.push(
            //     ...( await desktopCapturer.getSources({
            //         types: [ types[1] ],
            //         thumbnailSize
            //     }))
            // );
            
            // if ( sources.length === 0) {
            //     sources.push(
            //         ...( await desktopCapturer.getSources({
            //             types: [ types[0] ],
            //             thumbnailSize
            //         }))
            //     );
            // }

            sources = await desktopCapturer.getSources({
                types,
                thumbnailSize
            });
        }
        

        const results: CaptureSource[] = sources.map( source => ({
            id: source.id,
            displayId: Number(source.display_id),
            name: source.name || 'Unknown',
            type: source.id.includes('window') ? 'window' : 'screen',
        }));

        const displaysSources = sources.filter( source => source.display_id );
            
        // If there are more than 1 display, the auto capture source option must be available
        if ( displaysSources.length > 1 )
            results.unshift( entireScreenAutoCaptureSource );

        // console.timeEnd('getAllCaptureSources time');
        return results;
    }

    getDisplay( id: number ): Electron.Display | undefined {
        return screen.getAllDisplays()
            .find( display => display.id === id );
    }

    async getCurrentDisplay(): Promise< Electron.Display > {
            
        const cursorScreenPoint =  await windowManager.getCursorPosition();
        const displayNearestPoint = screen.getDisplayNearestPoint( cursorScreenPoint );
        
        return displayNearestPoint;
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
        autoCrop?: boolean;
    }): Promise< Buffer | undefined > {

        let { image, display, window, autoCrop } = input;

        if ( !image ) {
            console.time("Screenshot time");
            image = await this.takeScreenshot({ display, window });
            console.log()
            console.timeEnd("Screenshot time");
            console.log()
        }
        else if ( window && autoCrop !== false ) {
            // cropping image according to window properties
            image = await this.cropWindowFromImage( window, image );
        }

        return image;
    }

    private async takeScreenshot( input: { display?: Electron.Display, window?: ExternalWindow }): Promise< Buffer | undefined > {
        // console.time('takeScreenshot');        

        const { window } = input;
        let { display } = input;

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

        if ( isMacOs ) {
            return await this.cropWorkAreaFromImage({
                source
            });
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

            
        if ( !metadata.width || !metadata.height )
            return image;

        const width = window.size.width > metadata.width ?
            metadata.width : window.size.width;

        const height = window.size.height > metadata.height ?
            metadata.height : window.size.height;

        const windowArea = {
            left: window.position.x > 0 ? window.position.x : 0,
            top: window.position.y > 0 ? window.position.y : 0,
            width,
            height,
        };

        if ( windowArea.left + windowArea.width > metadata.width )
            windowArea.width = metadata.width - windowArea.left;

        if ( windowArea.top + windowArea.height > metadata.height )
            windowArea.height = metadata.height - windowArea.top
        
        return await sharp(image).extract(windowArea)
            .toBuffer();
    }

    async cropWorkAreaFromImage(
        input: {
            display?: Electron.Display,
            source: Electron.DesktopCapturerSource
        }
    ): Promise<Buffer | undefined> {
        let { display, source } = input;

        if ( !display ) {
            display = screen.getAllDisplays()
                .find( display => display.id == Number(source?.display_id) );

            display = display || (await this.getCurrentDisplay());
        }

        const imageSize = source.thumbnail.getSize();

        if (
            display && 
            (imageSize.height > display.workArea.height ||
             imageSize.width > display.workArea.width)
        ) {
            const workAreaImage = source.thumbnail.crop(display.workArea);
            return workAreaImage.toPNG();
        }

        return source.thumbnail.toPNG();
    }
}


