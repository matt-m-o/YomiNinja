import bindings from 'bindings';
import { TaskbarProperties, WindowManagerNativeInterface, WindowProperties } from '../window_manager';

export function getWindowManagerWin32(): WindowManagerNativeInterface {
    return bindings('window_manager_win32') as WindowManagerNativeInterface;
}

export class WindowManagerWin32 implements WindowManagerNativeInterface {

    binding: WindowManagerNativeInterface;
    
    constructor() {
        this.binding = bindings('window_manager_win32');
    }

    setForegroundWindow( windowHandle: number ): void | Promise<void> {
        this.binding.setForegroundWindow( windowHandle );
    }

    getWindowProperties( windowHandle: number ): WindowProperties {
        
        const result = this.binding.getWindowProperties( windowHandle ) as WindowProperties;

        this.fixTitle([ result ]);

        return result;
    }

    getAllWindows(): WindowProperties[] {

        const results = this.binding.getAllWindows() as WindowProperties[];

        this.fixTitle( results );

        return results;
    }

    async searchWindowByTitle( title: string ): Promise< WindowProperties[] > {

        const windows = this.getAllWindows();

        return windows.filter( window => window.title.includes( title ) );
    }

    getTaskBarProps(): TaskbarProperties {
        return this.binding.getTaskBarProps();
    }

    private fixTitle( items: WindowProperties[] ) {

        items.forEach( (item: any) => {    
            item.title = item.title.replace( '\x00', '' );            
        });
    }
}