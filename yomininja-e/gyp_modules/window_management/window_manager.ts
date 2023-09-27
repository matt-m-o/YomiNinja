import bindings from 'bindings';

export type WindowProperties = {
    size: {
        width: number,
        height: number
    },
    position: {
        x: number,
        y: number
    }
}

interface WindowManagerCppInterface {
    setForegroundWindow( windowTitle: string ): string; // Set window to front
    getWindowProperties( windowTitle: string ): WindowProperties;
};

export class WindowManager {

    private windowManager: WindowManagerCppInterface;

    constructor() {
        // TODO: Check platform and import the compatible biding
        this.windowManager = bindings('window_manager_win32') as WindowManagerCppInterface;
    }

    setForegroundWindow( windowTitle: string ): void {

        this.windowManager.setForegroundWindow( windowTitle );
    }

    getWindowProperties( windowTitle: string  ): WindowProperties {

        return this.windowManager.getWindowProperties( windowTitle );
    }
}
