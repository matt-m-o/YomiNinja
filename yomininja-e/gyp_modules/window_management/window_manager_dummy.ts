import { TaskbarProperties, WindowManagerCppInterface, WindowProperties } from './window_manager';

export class WindowManagerCppDummy implements WindowManagerCppInterface {

    constructor(){}
    setForegroundWindow(windowHandle: number): void {
        throw new Error('Method not implemented.');
    }
    getWindowProperties(windowHandle: number): WindowProperties {
        throw new Error('Method not implemented.');
    }
    getAllWindows() {
        throw new Error('Method not implemented.');
    }
    getTaskBarProps(): TaskbarProperties {
        throw new Error('Method not implemented.');
    }
}