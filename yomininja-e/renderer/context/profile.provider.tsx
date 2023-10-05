import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { ProfileJson } from '../../electron-src/@core/domain/profile/profile'
import { LanguageJson } from "../../electron-src/@core/domain/language/language";


export type ProfileContextType = {
    profile: ProfileJson;
    changeActiveOcrLanguage: ( language: LanguageJson ) => void
};


export const ProfileContext = createContext( {} as ProfileContextType );


export const ProfileProvider = ( { children }: PropsWithChildren ) => {
    
    const [ profile, setProfile ] = useState< ProfileJson >();
    
    function changeActiveOcrLanguage( language: LanguageJson ) {

        setProfile({ ...profile, active_ocr_language: language })

        global.ipcRenderer.invoke( 'profile:change_active_ocr_language', {
            two_letter_code: language.two_letter_code
        });
    }

    useEffect( () => {

        global.ipcRenderer.invoke( 'profile:get_profile' )
            .then( ( result: ProfileJson ) => {

                // console.log(result)
                setProfile(result);
            });
        
    }, [ global.ipcRenderer ] );
    
    return (
        <ProfileContext.Provider
            value={{
                profile,
                changeActiveOcrLanguage
            }}
        >            
            {children}
        </ProfileContext.Provider>
    );
}