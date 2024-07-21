

export interface CaptureSource {
    id: string;
    displayId?: number;
    name: string;
    type: 'screen' | 'window';
    window?: ExternalWindow;
}

export type ExternalWindow = {
    id: number;
    name: string;
    size: {
        width: number,
        height: number
    },
    position: {
        x: number,
        y: number
    }
}