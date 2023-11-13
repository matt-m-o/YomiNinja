import bindings from 'bindings';
import os from 'os';
import { WindowManagerCppDummy } from './window_manager_dummy';
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
    setForegroundWindow( windowHandle: number ): void; // Set window to front
    getWindowProperties( windowHandle: number ): WindowProperties;
    getAllWindows(): any;
    getTaskBarProps(): TaskbarProperties;
};

export class WindowManager {

    private windowManager: WindowManagerCppInterface;

    constructor() {
        // TODO: Check platform and import the compatible biding

        if ( os.platform() === 'win32' )
            this.windowManager = bindings('window_manager_win32') as WindowManagerCppInterface;

        if ( os.platform() === 'linux' )
            this.windowManager = new WindowManagerLinuxX11();
    }

    setForegroundWindow( windowHandle: number ): void {

        this.windowManager.setForegroundWindow( windowHandle );
    }
    
    getWindow( windowHandle: number  ): WindowProperties {        

        const result = this.windowManager.getWindowProperties( windowHandle );
        this.fixTitle([result]);

        return result;
    }

    getAllWindows(): WindowProperties[] {

        const result = this.windowManager.getAllWindows();
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