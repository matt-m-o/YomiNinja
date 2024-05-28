import { PopupView } from "electron-chrome-extensions/dist/browser/popup";


export function handleJPDBReaderPopup( popup: PopupView ) {

    const { browserWindow } = popup;

    if ( !browserWindow ) return;

    popup.whenReady()
        .then( () => {
            browserWindow.webContents.executeJavaScript(`
                document.querySelector("article")
                    .style.maxWidth = '50%';
            `);
        });
}