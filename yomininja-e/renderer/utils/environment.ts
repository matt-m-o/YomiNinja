import { ipcRenderer } from "./ipc-renderer";

export function isElectronBrowser(): boolean {
    return typeof ipcRenderer.socket === 'undefined';
}

export function isFullscreenWindow( window: Window ): boolean {

    if ( typeof window === 'undefined' ) return false;

    return window.matchMedia("(display-mode: fullscreen").matches;
}

export function getDisplayMode( window: Window ): string {
    const modes = [
        'browser',
        'fullscreen',
        'window-controls-overlay',
        'standalone'
    ];

    let displayMode = 'browser';

    displayMode = modes.find( mode =>
        window.matchMedia(`(display-mode: ${mode})`).matches
    ) || displayMode;

    return displayMode;
}

export function onDisplayModeChange(
    window: Window,
    callBack: ( displayMode: string ) => void
): () => void {

    const listener = ( e: MediaQueryListEvent ) => {
        const displayMode = getDisplayMode( window );
        
        // console.log(e)
        callBack( displayMode );
        console.log('display-mode: '+ displayMode);
    }

    window.matchMedia( '(display-mode: browser)' )
        .addEventListener( 'change', listener );

    window.matchMedia( '(display-mode: standalone)' )
        .addEventListener( 'change', listener );

    return () => {
        window.matchMedia( '(display-mode: browser)' )
            .removeEventListener( 'change', listener );

        window.matchMedia( '(display-mode: standalone)' )
            .removeEventListener( 'change', listener );
    };
}

export function isInPWAMode( window: Window ): boolean {
    return Boolean( 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches
    );
}