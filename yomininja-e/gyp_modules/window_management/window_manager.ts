import bindings from 'bindings';

interface WindowManagerCppInterface {
    setForegroundWindow( windowTitle: string ): string; // Set window to front
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
}
