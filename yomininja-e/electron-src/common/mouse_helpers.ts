import { UiohookMouseEvent } from "uiohook-napi";

// Converts MouseEvent.button to UiohookMouseEvent.button
export function htmlMouseButtonToUiohook( htmlMouseButton: number | string ): number {

    // HtmlMouseEvent: IOMouseButton
    // const buttonDict = {
    //     '1': 3,
    //     '3': 4,
    //     '4': 5,
    //      ...
    // };

    htmlMouseButton = Number( htmlMouseButton );

    if ( htmlMouseButton === 1 )
        htmlMouseButton = 3;
    else 
        htmlMouseButton++;

    return htmlMouseButton;
}

export function matchUiohookMouseEventButton( event: UiohookMouseEvent, registeredButton: string ): boolean {

    const shortcutButtonNumber = htmlMouseButtonToUiohook(
        registeredButton.split(' ')[1]
    );

    console.log({
        shortcutButtonNumber,
        eventButton: event.button,
        match: shortcutButtonNumber === event.button
    });
    
    if ( shortcutButtonNumber !== event.button )
        return false;

    return true;
}