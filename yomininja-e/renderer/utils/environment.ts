import { ipcRenderer } from "./ipc-renderer";

export function isElectronBrowser(): boolean {
    return typeof ipcRenderer.socket === 'undefined';
}

export function isFullscreenWindow( window: Window ): boolean {

    if ( typeof window === 'undefined' ) return false;

    return window.matchMedia("(display-mode: fullscreen").matches;
}