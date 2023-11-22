import bindings from 'bindings';
import os from 'os';
import { WindowManagerLinuxX11 } from './window_manager_linux_x11';

type Size = {
    width: number;
    height: number;
};
type Position = {
    x: number;
    y: number;
};

export type WindowProperties = {
    title: string;
    handle: number;
    size: Size;
    position: Position;
};

export type TaskbarProperties = {
    size: Size;
    position: Position;
    auto_hide: boolean;
};

export interface WindowManagerCppInterface {
    init?: () => Promise< void >;
    setForegroundWindow( windowHandle: number ): void | Promise< void >; // Set window to front
    getWindowProperties( windowHandle: number ): WindowProperties | Promise< WindowProperties | undefined >;
    getAllWindows(): Promise< WindowProperties[] >;
    getTaskBarProps(): TaskbarProperties;
};

export class WindowManager {

    private windowManager: WindowManagerCppInterface;

    constructor() {
        // TODO: Check platform and import the compatible biding

        if ( os.platform() === 'win32' )
            this.windowManager = bindings('window_manager_win32') as WindowManagerCppInterface;

        else if ( os.platform() === 'linux' )
            this.windowManager = new WindowManagerLinuxX11();
    }

    async init(): Promise< void > {
        if ( this.windowManager.init )
            await this.windowManager.init();
    }

    setForegroundWindow( windowHandle: number ): void {

        this.windowManager.setForegroundWindow( windowHandle );
    }
    
    async getWindow( windowHandle: number  ): Promise< WindowProperties | undefined > {

        const result = await this.windowManager.getWindowProperties( windowHandle );

        if ( !result ) return;

        this.fixTitle([result]);

        return result;
    }

    async getAllWindows(): Promise< WindowProperties[] >{

        const result = await this.windowManager.getAllWindows();
        this.fixTitle(result);

        return result;
    }

    getTaskbar(): TaskbarProperties {
        return this.windowManager.getTaskBarProps();
    }

    private fixTitle( items: WindowProperties[] ) {

        items.forEach( (item: any) => {    
            item.title = item.title.replace( '\x00', '' );            
        });
    }
}