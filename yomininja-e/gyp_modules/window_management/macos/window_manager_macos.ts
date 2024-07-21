import { systemPreferences } from 'electron';
import { TaskbarProperties, WindowManagerNativeInterface, WindowProperties } from '../window_manager';
import { windowManager } from 'node-window-manager';
import os from 'os';

export class WindowManagerMacOS implements WindowManagerNativeInterface {

    hasAccessibilityAccess: any = false;

    constructor() {
        if ( os.platform() === 'darwin' ) {
            // this.hasAccessibilityAccess = windowManager.requestAccessibility();
            console.log({ hasAccessibilityAccess: this.hasAccessibilityAccess });
        }
    }

    async init() {
        this.requestAccessibility();
    }

    async searchWindowByTitle( title: string ): Promise<WindowProperties[]> {

        if ( !this.hasAccessibilityAccess )
            return this.requestAccessibility();

        console.log(`searchWindowByTitle: ${title}`);

        return this.getAllWindows()
            .filter( window => window.title.includes( title ) );
    }


    setForegroundWindow = ( windowHandle: number ): void =>{

        if ( !this.hasAccessibilityAccess )
            return this.requestAccessibility();

        console.log(`setForegroundWindow: ${windowHandle}`);
        
        this.activateWindow( windowHandle );
    }

    async getWindowProperties( windowHandle: number ): Promise< WindowProperties | undefined > {

        if ( !this.hasAccessibilityAccess )
            return this.requestAccessibility();

        console.log(`getWindowProperties: ${windowHandle}`);

        const window = windowManager.getWindows()
            .find( window => window.id === windowHandle );

        if ( !window ) return;

        const windowBounds = window.getBounds();

        if ( !windowBounds ) {
            console.log(`window ${windowHandle} doesn't exists!`);
            return;
        }

        return {
            handle: windowHandle,
            title: window.getTitle(),
            size: {
                width: windowBounds.width || 0,
                height: windowBounds.height || 0,
            },
            position: {
                x: windowBounds.x || 0,
                y: windowBounds.y || 0
            }
        }
    }

    getAllWindows(): WindowProperties[] {

        if ( !this.hasAccessibilityAccess )
            return this.requestAccessibility();

        const windows: WindowProperties[] = windowManager.getWindows()
            .map( window => {

                const bounds = window.getBounds();

                const windowProperties: WindowProperties = {
                    handle: window.id,
                    position: {
                        x: bounds.x || 0,
                        y: bounds.y || 0
                    },
                    size: {
                        width: bounds.width || 0,
                        height: bounds.height || 0
                    },
                    title: window.getTitle()
                };

                return windowProperties;
            });

        return windows;
    }
    
    getTaskBarProps(): TaskbarProperties {
        return {
            auto_hide: true,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 0,
                height: 0
            }
        }
    }


    activateWindow( windowId: number ) {

        if ( !this.hasAccessibilityAccess )
            return this.requestAccessibility();

        windowManager.getWindows()
            .find( window => {

                if ( window.id !== windowId )
                    return;

                window.bringToTop();

                return true;
            });
    }

    searchWindowByName( windowName: string ): number[] {

        if ( !this.hasAccessibilityAccess )
            return this.requestAccessibility();

        const ids = windowManager.getWindows()
            .filter( window => window.getTitle().includes( windowName ) )
            .map( window => window.id );

        return ids;
    }

    requestAccessibility(): any {
        this.hasAccessibilityAccess = systemPreferences.isTrustedAccessibilityClient(false);
        return this.hasAccessibilityAccess;
        // this.hasAccessibilityAccess = windowManager.requestAccessibility();
        // return this.hasAccessibilityAccess;
    }
}