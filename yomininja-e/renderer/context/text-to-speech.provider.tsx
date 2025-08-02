import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { VoiceVoxTTS } from "./text-to-speech/voicevox_tts";
import { TextToSpeech } from "./text-to-speech/text_to_speech";
import { SystemTTS } from "./text-to-speech/system_tts";

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
    const textToSpeech = new TextToSpeech([
        new SystemTTS(),
        new VoiceVoxTTS(),
    ]);
    
    useEffect( () => {
        
        window.speechSynthesis.onvoiceschanged = () => {
            textToSpeech.getVoices()
                .then( voices => {
                    setVoices( voices );
                    console.log({ voices });
                });
        };
        
    }, [] );

    function speak( input: TTSSpeak_Input ) {

        textToSpeech.speak({
            text: input.text,
            voice: input.voice,
            voiceURI: input.voiceURI,
            volume: input.volume,
            speed: input.speed,
            pitch: input.pitch,
            cancelCurrentText: input.cancelCurrentText
        });
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