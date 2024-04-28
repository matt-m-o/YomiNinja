export type DetectMotion_Input = {
    streamId: string;
    videoFrame: Buffer;
    frameSampleSize?: number;
    clearPreviousFrames?: boolean;
};

export type DetectMotion_Output = {
    motionPixelsCount: number; // Number of pixels (motion area)
};


export interface VideoAnalyzerAdapter {
    status: VideoAnalyzerStatus;
    detectMotion: ( input: DetectMotion_Input ) => Promise< DetectMotion_Output >;
}

export enum VideoAnalyzerStatus {
    Enabled = "Enabled",
    Disabled = "Disabled",
    Processing = "Processing",
}