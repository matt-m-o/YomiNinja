import os from 'os';
import { WindowManagerLinuxX11 } from './window_manager_linux_x11';
import { WindowManagerWin32 } from './window_manager_win32';

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

export interface WindowManagerNativeInterface {
    init?: () => Promise< void >;
    setForegroundWindow( windowHandle: number ): void | Promise< void >; // Set window to front
    getWindowProperties( windowHandle: number ): WindowProperties | Promise< WindowProperties | undefined >;
    getAllWindows(): WindowProperties[] | Promise< WindowProperties[] >;
    getTaskBarProps(): TaskbarProperties;
};

export class WindowManager {

    private windowManager: WindowManagerNativeInterface;

    constructor() {
        // TODO: Check platform and import the compatible biding

        if ( os.platform() === 'win32' )
            this.windowManager = new WindowManagerWin32();

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

        return result;
    }

    async getAllWindows(): Promise< WindowProperties[] >{

        const result = await this.windowManager.getAllWindows();

        return result;
    }

    getTaskbar(): TaskbarProperties {
        return this.windowManager.getTaskBarProps();
    }

    
}