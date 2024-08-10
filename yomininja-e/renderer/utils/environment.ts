import { ipcRenderer } from "./ipc-renderer";

export function isElectronBrowser(): boolean {
    return typeof ipcRenderer.socket === 'undefined';
}

export function isFullscreenWindow( window: Window ): boolean {

    if ( typeof window === 'undefined' ) return false;

    return window.matchMedia("(display-mode: fullscreen").matches;
}

export function onDisplayModeChange(
    window: Window,
    callBack: ( displayMode: string ) => void
): () => void {

    const modes = [
        'browser',
        'fullscreen',
        'window-controls-overlay',
        'standalone'
    ];


    const listener = ( e: MediaQueryListEvent ) => {
        let displayMode = 'browser';

        displayMode = modes.find( mode =>
            window.matchMedia(`(display-mode: ${mode})`).matches
        ) || displayMode;

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