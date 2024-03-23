import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { ProfileJson } from '../../electron-src/@core/domain/profile/profile'
import { LanguageJson } from "../../electron-src/@core/domain/language/language";


export type ProfileContextType = {
    profile: ProfileJson;
    changeActiveOcrLanguage: ( language: LanguageJson ) => void;
    changeSelectedOcrEngine: ( ocrEngineAdapterName: string ) => Promise< void >;
};


export const ProfileContext = createContext( {} as ProfileContextType );


export const ProfileProvider = ( { children }: PropsWithChildren ) => {
    
    const [ profile, setProfile ] = useState< ProfileJson >();
    
    function changeActiveOcrLanguage( language: LanguageJson ) {

        setProfile({ ...profile, active_ocr_language: language })

        global.ipcRenderer.invoke( 'profile:change_active_ocr_language', language );
    }

    async function changeSelectedOcrEngine( ocrEngineAdapterName: string ) {

        setProfile({
            ...profile,
            selected_ocr_adapter_name: ocrEngineAdapterName
        });

        await global.ipcRenderer.invoke(
            'profile:change_selected_ocr_engine',
            ocrEngineAdapterName
        );
    }

    function getActiveProfile() {
        global.ipcRenderer.invoke( 'profile:get_profile' )
            .then( ( result: ProfileJson ) => {
                // console.log(result)
                setProfile(result);
            });
    }

    useEffect( () => {
        getActiveProfile();
    }, [ global.ipcRenderer ] );
    
    return (
        <ProfileContext.Provider
            value={{
                profile,
                changeActiveOcrLanguage,
                changeSelectedOcrEngine
            }}
        >            
            {children}
        </ProfileContext.Provider>
    );
}