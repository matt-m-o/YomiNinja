
export type OcrItemBoxVertex = {
    x: number;
    y: number;
};

export type OcrItemBox = {
    bottom_left: OcrItemBoxVertex;
    bottom_right: OcrItemBoxVertex;
    top_left: OcrItemBoxVertex;
    top_right: OcrItemBoxVertex;
};

// TODO: Rename
export type OcrTextLineWord = {
    word: string;
    box: OcrItemBox;
};

// TODO: Rename
export type OcrTextLineSymbol = {
    symbol: string;
    box: OcrItemBox;
};

export type OcrTextLine = {
    content: string;
    box?: OcrItemBox;
    symbols?: OcrTextLineSymbol[];
    words?: OcrTextLineWord[];
};

export type OcrRecognitionState = "DETECTED" | "RECOGNIZED";

export type OcrItem = {
    id : string;
    text: OcrTextLine[];
    recognition_score: number; // Text confidence
    classification_score: number; // Text direction confidence
    classification_label: number; // Text direction
    box: OcrItemBox;
    is_vertical?: boolean;
    recognition_state?: OcrRecognitionState;
};

export type OcrResultContextResolution = {
    width: number;
    height: number;
}

export type OcrResult_CreationInput = {
    id: string;
    context_resolution?: OcrResultContextResolution;
    results?: OcrItem[];
    image?: Buffer | string;
};


export class OcrResult {

    public readonly id: string;
    public context_resolution: OcrResultContextResolution;
    public results: OcrItem[];
    public image?: Buffer | string;
    
    private constructor( input: OcrResult_CreationInput ) {

        this.id = input.id;
        
        this.context_resolution = {
            width: input?.context_resolution?.width || 0,
            height: input?.context_resolution?.height || 0,
        };

        this.image = input.image;

        this.results = input.results ? [ ...input?.results ] : [];

        this.results.forEach( this.fixUndefined );
    }

    static create( input: OcrResult_CreationInput ): OcrResult {
        return new OcrResult( input );
    }
    
    addResultItem( item: OcrItem ): void {
        this.fixUndefined( item );
        this.results.push( item );
    }

    private fixUndefined( item: OcrItem ) {

        for ( const [ key, vertex ] of Object.entries( item.box ) ) {
            vertex.x = vertex.x || 0;
            vertex.y = vertex.y || 0;
        }
    }
}