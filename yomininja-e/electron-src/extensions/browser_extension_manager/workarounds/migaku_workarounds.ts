import { BrowserWindow } from "electron";
import { PopupView } from "electron-chrome-extensions/dist/browser/popup";


export function handleMigakuPopup( popup: PopupView, openWindow?: ( url: string ) => BrowserWindow ) {

    const { browserWindow: popupWindow } = popup;

    if ( !popupWindow ) return;

    popupWindow.setResizable(true);

    const fixButtons = () => {
        const url = location.href;
        const baseURL = url.slice(0, url.indexOf( 'pages' ) );
        
        document.querySelectorAll('button').forEach(button => {
                const span = button.querySelector('span');
                if (
                    location.href.includes("pages/menu/index.html#/app-login-required") &&
                    span &&
                    span.textContent?.toLowerCase() === "log in"
                ) {
                    button.addEventListener('click', () => {
                        location.href = location.href.replace(
                            'pages/menu/index.html#/app-login-required',
                            'pages/app-window/index.html#/login'
                        );
                    });
                }

                if ( button.classList.contains('MenuMainView__openAppWindow' )) {
                    button.addEventListener('click', () => {
                        location.href = baseURL + 'pages/app-window/index.html#/app/Dashboard';
                    });
                }

                if (
                    span && 
                    span.textContent?.toLowerCase() === "go to app" ||
                    span?.textContent?.toLowerCase() === 'show app'
                ) {
                    button.addEventListener('click', () => {
                        location.href = baseURL + 'pages/app-window/index.html#/app/Dashboard';
                    });
                }

                if (
                    button.getAttribute('aria-labelledby') === 'tooltip--clipboard' ||
                    button.getAttribute('title')?.toLowerCase() === 'clipboard'
                ) {
                    button.addEventListener('click', () => {
                        location.href = baseURL + 'pages/clipboard/index.html';
                    });
                }

                if (
                    button.getAttribute('aria-labelledby') === 'tooltip--study' ||
                    button.getAttribute('title')?.toLowerCase() === 'memory'
                ) {
                    button.addEventListener('click', () => {
                        location.href = 'https://study.migaku.com/';
                    });
                }
            });
    }


    const applyFixes = ( window: BrowserWindow ) => {

        window.webContents.executeJavaScript(`
            (${fixButtons.toString()})();
        `);

        window.webContents.on('update-target-url', ( e, url ) => {

            setTimeout( () => {
                window.webContents.executeJavaScript(`
                    (${fixButtons.toString()})();
                `);
            }, 5000 );
        });

        window.webContents.on('will-navigate', (e, url) => {
            // if (
            //     openWindow &&
            //     window.id !== popupWindow.id &&
            //     ( url.includes('pages/clipboard/index.html') ||
            //      url.includes('.com') )
            // ) {

            //     if ( e.defaultPrevented )
            //         return;

            //     e.preventDefault();
            
            //     openWindow( url );
            // }
        });
    }


    popup.whenReady()
        .then( () => {

            applyFixes(popupWindow);

            popupWindow.webContents.on('will-navigate', ( e, url ) => {
                if ( openWindow ){

                    const extensionWindow = openWindow( url );

                    extensionWindow.webContents.on('page-title-updated', ( e, title ) => {

                        if ( !title.includes('Loading') )                        
                            applyFixes(extensionWindow);

                    });
                }
            });
            
        });
}