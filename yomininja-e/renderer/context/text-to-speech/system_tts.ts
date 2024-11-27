import { TextToSpeechService, TTSSpeak_Input } from "./tts_types";


export class SystemTTS implements TextToSpeechService {

    constructor() {}

    getVoices = async (): Promise<SpeechSynthesisVoice[]> => {
        return window.speechSynthesis.getVoices();
    }

    async speak( input: TTSSpeak_Input ): Promise< undefined > {

        if ( input.cancelCurrentText )
            window.speechSynthesis.cancel();

        const speechSU = new SpeechSynthesisUtterance();

        speechSU.text = input.text;

        let voice: SpeechSynthesisVoice | undefined;

        if ( input.voice )
            voice = input.voice;

        else if ( input.voiceURI ) {
            voice =  (await this.getVoices() ).find(
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

    isVoiceSupported = ( voiceURI: string ): boolean => {
        const voices = window.speechSynthesis.getVoices();
        return voices.some( voice => voice.voiceURI === voiceURI );;
    }
}