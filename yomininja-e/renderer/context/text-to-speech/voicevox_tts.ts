import axios, { AxiosInstance } from 'axios';
import { TextToSpeechService, TTSSpeak_Input } from './tts_types';

type Speaker = {
    name: string;
    styles: {
        name: string;
        id: number;
    }[];
}

export class VoiceVoxTTS implements TextToSpeechService {

    url: string;
    speakers: Speaker[] = [];
    voices: Map<string, SpeechSynthesisVoice>;
    httpClient: AxiosInstance;

    constructor( url: string = 'http://localhost:50021' ) {
        this.url = url;
        this.httpClient = axios.create({
            baseURL: this.url
        });
        this.voices = new Map();
        this.getVoices();
    }

    
    
    async getVoices(): Promise<SpeechSynthesisVoice[]> {

        try {

            if ( this.voices.size )
                return this.getVoicesArray();

            if ( !this.speakers?.length )
                await this.getSpeakers();

            for( const speaker of this.speakers ) {

                if ( !('styles' in speaker) ) 
                    continue;

                for( const style of speaker.styles ) {
                    const name = `VOICEVOX ${speaker.name} ${style.name}`;
                    this.voices.set(
                        name,
                        {
                            name,
                            default: false,
                            lang: 'ja-JP',
                            localService: true,
                            voiceURI: name
                        }
                    );
                }

            }
            
        } catch (error) {
            console.error(error);
        }
        
        return this.getVoicesArray();
    }

    async speak( input: TTSSpeak_Input ) {

        if ( !this.speakers?.length )
            await this.getSpeakers();

        const [ _, speakerName, styleName ] = input.voiceURI.split(' ');

        const speaker = this.speakers.find(
            speaker => speaker.name === speakerName
        );

        const speakerID = speaker.styles.find(
            style => style.name === styleName
        )?.id;

        if ( !speakerID ) return;

        const audioQuery: Record<string, any> = await this.getAudioQuery({
            text: input.text,
            speakerID
        });

        audioQuery.speedScale = input.speed ? 
            Number(input.speed.toFixed(2)) / 1.5 : 0;
        audioQuery.pitchScale = input.pitch ? 
            Number(input.pitch.toFixed(2)) / 20 : 0;
        audioQuery.volumeScale = input.volume; 

        console.log({audioQuery});

        const audio = await this.synthesis({
            audioQuery,
            speakerID,
        });

        return audio
    }

    private async getAudioQuery(
        input: {
            text: string,
            speakerID: number
        }
    ): Promise<any> {

        const params = new URLSearchParams();

        params.append('text', input.text);
        params.append('speaker', input.speakerID.toString());

        const requestData = await this.httpClient.post('/audio_query?'+params.toString());
        
        return requestData.data;
    }

    private async synthesis(
        input: {
            audioQuery: Record<string, any>;
            speakerID: number;
        }
    ): Promise<ArrayBuffer> {
        const params = new URLSearchParams();

        params.append('speaker', input.speakerID.toString());

        const requestData = await this.httpClient.post(
            '/synthesis?'+params.toString(),
            input.audioQuery,
            {
                responseType: 'arraybuffer'
            }
        );
        
        return requestData.data;
    }

    private async getSpeakers(): Promise<Speaker[]>{

        try {
            const requestData = (await this.httpClient.get('/speakers')).data as Speaker[];

            this.speakers = requestData;

        } catch (error) {
            console.error(error);
        }
        
        
        return this.speakers || [];
    }

    isVoiceSupported( voiceURI: string ): boolean {
        if ( !this.voices.size )
            this.getVoices();
        
        return this.voices.has( voiceURI );
    }

    private getVoicesArray(): SpeechSynthesisVoice[] {
        return Array.from( this.voices.values() );
    }
}