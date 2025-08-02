export interface TextToSpeechService {
    getVoices(): Promise<SpeechSynthesisVoice[]>;
    speak( input: TTSSpeak_Input ): Promise<ArrayBuffer | undefined>;
    isVoiceSupported( voiceURI: string ): boolean;
}

export type TTSSpeak_Input = {
    text: string,
    voice?: SpeechSynthesisVoice,
    voiceURI?: string,
    cancelCurrentText?: boolean;
    volume?: number;
    speed?: number;
    pitch?: number;
}
