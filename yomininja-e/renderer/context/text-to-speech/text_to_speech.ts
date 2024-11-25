import { TextToSpeechService, TTSSpeak_Input } from "./tts_types";

export class TextToSpeech {

    ttsServices: TextToSpeechService[];
    audioElement: HTMLAudioElement | undefined;

    constructor( ttsServices: TextToSpeechService[] ) {
        this.ttsServices = ttsServices;
    }

    async getVoices(): Promise<SpeechSynthesisVoice[]> {

        const voices = [];
        
        for ( const service of this.ttsServices ) {
            (await service.getVoices())
                .forEach( serviceVoice => {
                    if ( voices.some( v => v.voiceURI === serviceVoice.voiceURI ) )
                        return;
                    voices.push( serviceVoice );
                });
        } 

        return voices;
    }

    speak = async ( input: TTSSpeak_Input ) => {

        if ( input.cancelCurrentText )
            this.stopCurrentAudio();

        const ttsService = this.ttsServices.find(
            service => service.isVoiceSupported( input.voiceURI )
        );

        if ( !ttsService ) return;

        const audio = await ttsService.speak(input);

        const audioBlob = new Blob([audio], { type: "audio/wav" });
        const audioURL = window.URL.createObjectURL( audioBlob );

        if ( this.audioElement ) {

            if ( !input.cancelCurrentText ) {
                this.audioElement.addEventListener( 'ended', ( ) => {
                    this.audioElement.src = audioURL;
                    this.audioElement.play();
                });
                return;
            }
            else {
                this.stopCurrentAudio();
                this.audioElement.src = audioURL;
            }
        }
        else {
            this.audioElement = new Audio( audioURL );
            this.audioElement.addEventListener( 'ended', ( ) => {
                console.log('audio ended!');
                this.audioElement = undefined;
            });
        }
        
        this.audioElement.play();
    }

    private stopCurrentAudio() {
        if ( !this.audioElement ) return;
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
    }
}