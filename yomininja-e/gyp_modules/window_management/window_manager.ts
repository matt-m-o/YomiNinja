import bindings from 'bindings';

export type WindowProperties = {
    title: string;
    handle: number;
    size: {
        width: number;
        height: number;
    };
    position: {
        x: number;
        y: number;
    };
}

interface WindowManagerCppInterface {
    setForegroundWindow( windowHandle: number ): void; // Set window to front
    getWindowProperties( windowHandle: number ): WindowProperties;
    getAllWindows(): any;
};

export class WindowManager {

    private windowManager: WindowManagerCppInterface;

    constructor() {
        // TODO: Check platform and import the compatible biding
        this.windowManager = bindings('window_manager_win32') as WindowManagerCppInterface;
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

    private fixTitle( items: WindowProperties[] ) {

        items.forEach( (item: any) => {    
            item.title = item.title.replace( '\x00', '' );            
        });
    }
}