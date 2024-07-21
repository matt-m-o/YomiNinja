import { PropsWithChildren, createContext, useEffect, useState } from "react";

export type TTSSpeak_Input = {
    text: string,
    voice?: SpeechSynthesisVoice,
    voiceURI?: string,
    cancelCurrentText?: boolean;
    volume?: number;
    speed?: number;
    pitch?: number;
}

export type TTSContextType = {
    speak: ( input: TTSSpeak_Input ) => void;
    getVoices: ( bcp47Tag?: string ) => SpeechSynthesisVoice[];
};



export const TTSContext = createContext( {} as TTSContextType );


export const TTSProvider = ( { children }: PropsWithChildren ) => {
    
    const [ voices, setVoices ] = useState< SpeechSynthesisVoice[] >([]);
    
    useEffect( () => {

        window.speechSynthesis.onvoiceschanged = ( voicesChangedEvent ) => {
            const voices = window.speechSynthesis.getVoices();
            setVoices( window.speechSynthesis.getVoices() );
            console.log({ voicesChangedEvent });
            console.log({ voices });
        }
    }, [] );

    function speak( input: TTSSpeak_Input ) {

        if ( input.cancelCurrentText )
            window.speechSynthesis.cancel();

        const speechSU = new SpeechSynthesisUtterance();

        speechSU.text = input.text;

        let voice: SpeechSynthesisVoice | undefined;

        if ( input.voice )
            voice = input.voice;

        else if ( input.voiceURI ) {
            voice = voices.find(
                item => item.voiceURI === input.voiceURI
            );
        }

        if ( voice )
            speechSU.voice = voice;

        if ( input.volume !== undefined )
            speechSU.volume = input.volume;

        if ( input.speed !== undefined )
            speechSU.rate = input.speed;

        if ( input.pitch !== undefined )
            speechSU.pitch = input.pitch;

        window.speechSynthesis.speak( speechSU );
    }
    
    function getVoices( bcp47Tag?: string ): SpeechSynthesisVoice[] {

        if ( !bcp47Tag )
            return voices;

        return voices.filter( voice => voice.lang !== bcp47Tag );
    }
    
    return (
        <TTSContext.Provider
            value={{
                speak,
                getVoices
            }}
        >            
            {children}
        </TTSContext.Provider>
    );
}