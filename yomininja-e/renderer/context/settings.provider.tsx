import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { DictionarySettings, OcrEngineSettings, SettingsPresetJson, SettingsPresetProps } from "../../electron-src/@core/domain/settings_preset/settings_preset";
import { Alert, Backdrop, CircularProgress, Snackbar, debounce } from "@mui/material";
import { OcrEngineSettingsU } from "../../electron-src/@core/infra/types/entity_instance.types";
import { OverlayBehavior, OverlayHotkeys, OverlayVisualCustomizations } from "../../electron-src/@core/domain/settings_preset/settings_preset_overlay";

export type SettingsContextType = {
    activeSettingsPreset: SettingsPresetJson;
    allSettingsPresets: SettingsPresetJson[];
    updateActivePreset: ( input: Partial<SettingsPresetJson> ) => void;
    updateActivePresetHotkeys: ( newHotkeys: Partial< OverlayHotkeys > ) => void;
    updateActivePresetVisuals: ( input: Partial< OverlayVisualCustomizations > ) => void;
    updateActivePresetBehavior: ( input: Partial< OverlayBehavior > ) => void; 
    updateActivePresetOcrEngine: ( input: Partial< OcrEngineSettingsU > ) => void; 
    updateActivePresetDictionary: ( input: Partial< DictionarySettings > ) => void;
    triggerOcrEngineRestart: ( engineName: string ) => void;
    loadCloudVisionCredentialsFile: () => Promise< void >;
    openCloudVisionPage: () => void;
};


export const SettingsContext = createContext( {} as SettingsContextType );


export const SettingsProvider = ( { children }: PropsWithChildren ) => {
    
    const [ activeSettingsPreset, setActiveSettingsPreset ] = useState< SettingsPresetJson | null >( null );
    const [ allSettingsPresets, setAllSettingsPresets ] = useState< SettingsPresetJson[] >( [] );

    const updateActivePresetIPC = debounce( async ( updatedPreset: SettingsPresetJson ) => {
        const { restartOcrAdapter } = await global.ipcRenderer.invoke( 'settings_preset:update', updatedPreset );
        // console.log({ restartOcrAdapter });
    }, 1500 );


    function updateActivePresetDictionary( input: Partial< DictionarySettings > ) {

        activeSettingsPreset.dictionary = {
            ...activeSettingsPreset?.dictionary,
            ...input,
        };
        
        updateActivePreset( activeSettingsPreset );
    }

    function updateActivePresetOcrEngine( newEngineSettings: Partial< OcrEngineSettingsU > ) {

        console.log({ newEngineSettings })

        activeSettingsPreset.ocr_engines = activeSettingsPreset?.ocr_engines.map( item => {


            if ( newEngineSettings.ocr_adapter_name === item.ocr_adapter_name )
                return { ...item, ...newEngineSettings };

            return item;
        });

        // console.log( activeSettingsPreset );
        
        updateActivePreset( activeSettingsPreset );
    }

    function updateActivePresetBehavior( newBehavior: Partial< OverlayBehavior > ) {

        activeSettingsPreset.overlay.behavior = {
            ...activeSettingsPreset.overlay.behavior,
            ...newBehavior,
        };

        
        if ( activeSettingsPreset.overlay.behavior.click_through_mode === 'disabled' )
            activeSettingsPreset.overlay.behavior.always_on_top = false;
        
        if ( 
            activeSettingsPreset.overlay.behavior.always_on_top &&
            activeSettingsPreset.overlay.behavior.click_through_mode === 'disabled'
        )
            activeSettingsPreset.overlay.behavior.click_through_mode = "auto";
    
        updateActivePreset( activeSettingsPreset );
    }

    function updateActivePresetHotkeys( newHotkeys: Partial< OverlayHotkeys > ) {

        activeSettingsPreset.overlay.hotkeys = {
            ...activeSettingsPreset.overlay.hotkeys,
            ...newHotkeys,
        };

        updateActivePreset( activeSettingsPreset );
    }

    function updateActivePresetVisuals( newVisuals: Partial< OverlayVisualCustomizations>  ) {

        activeSettingsPreset.overlay.visuals = {

            ...activeSettingsPreset.overlay.visuals,

            ocr_item_box: {                     
                ...activeSettingsPreset.overlay.visuals.ocr_item_box,
                ...newVisuals.ocr_item_box,                
            },

            frame: {
                ...activeSettingsPreset.overlay.visuals.frame,
                ...newVisuals.frame,
            },

            ocr_region: {
                ...activeSettingsPreset.overlay.visuals.ocr_region,
                ...newVisuals.ocr_region,
            },

            mouse: {
                ...activeSettingsPreset.overlay.visuals.mouse,
                ...newVisuals.mouse,
            },
        };

        updateActivePreset( activeSettingsPreset );
    }
    
    function updateActivePreset( updatedPreset: Partial<SettingsPresetJson> ) {

        // console.log( updatedPreset );

        if ( !updatedPreset )
            return;
        
        setActiveSettingsPreset({
            ...activeSettingsPreset,
            ...updatedPreset,
        });
        
        // global.ipcRenderer.invoke( 'settings_preset:update', updatedPreset );
        updateActivePresetIPC( activeSettingsPreset );
    }

    function activeSettingsPresetHandler( data: SettingsPresetJson ) {
        
        // console.log(data);
        setActiveSettingsPreset( data );
    }

    async function loadCloudVisionCredentialsFile() {
        await global.ipcRenderer.invoke( 'settings_preset:load_cloud_vision_cred_file' );

        setTimeout( getActiveSettingsPreset, 1000 );
    }

    async function openCloudVisionPage() {
        global.ipcRenderer.invoke( 'settings_preset:open_cloud_vision_page' );
    }

    async function getActiveSettingsPreset(): Promise< SettingsPresetJson > {

        const settings = await global.ipcRenderer.invoke( 'settings_preset:get_active' ) as SettingsPresetJson;

        activeSettingsPresetHandler( settings );

        return settings;
    }

    
    useEffect( () => {

        global.ipcRenderer.on( 'settings_preset:active_data', ( event, data: SettingsPresetJson ) => {
            activeSettingsPresetHandler( data );
        });

        getActiveSettingsPreset();

        return () => {
            global.ipcRenderer.removeAllListeners( 'settings_preset:active_data' );
        }
    }, [ global.ipcRenderer ] );

    const [ openBackdrop, setOpenBackdrop ] = useState(false);
    const backdrop = (
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={openBackdrop}            
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    )
    
    const [ openSnackbar, setOpenSnackbar ] = useState(false);
    const snackbar = (
        <Snackbar open={openSnackbar} autoHideDuration={6000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            onClose={ () => setOpenSnackbar(false) }
            sx={{ minWidth: '300px' }}
        >
            <Alert severity="info" sx={{ width: '100%' }}
                onClose={ () => setOpenSnackbar(false) }
            >
                OCR Engine restarted!
            </Alert>
        </Snackbar>
    )

    function triggerOcrEngineRestart( engineName: string ) {
        global.ipcRenderer.invoke( 'ocr_recognition:restart_engine', engineName );
        setOpenBackdrop( true );
    }

    useEffect( () => {

        global.ipcRenderer.on( 'ocr_recognition:ocr_engine_restarted', ( ) => {
            setOpenBackdrop( false );
            setOpenSnackbar( true );
        });
        
        return () => {
            global.ipcRenderer.removeAllListeners( 'ocr_recognition:ocr_engine_restarted' );            
        }
    }, [ global.ipcRenderer ] );
    
    
    return (
        <SettingsContext.Provider
            value={{
                activeSettingsPreset,
                allSettingsPresets,
                updateActivePreset,
                updateActivePresetHotkeys,
                updateActivePresetVisuals,
                updateActivePresetBehavior,
                updateActivePresetOcrEngine,
                updateActivePresetDictionary,
                triggerOcrEngineRestart,
                loadCloudVisionCredentialsFile,
                openCloudVisionPage
            }}
        >

            {backdrop}
            {snackbar}

            {children}
            
        </SettingsContext.Provider>
    );
}