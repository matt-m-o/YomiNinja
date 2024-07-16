import { ipcRenderer } from "./ipc-renderer";

export function isElectronBrowser(): boolean {
    return typeof ipcRenderer.socket === 'undefined';
}