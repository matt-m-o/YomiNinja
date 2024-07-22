
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

export type OcrTextLineSymbol = {
    symbol: string;
    box: OcrItemBox;
};

export type OcrTextLine = {
    content: string;
    box?: OcrItemBox;
    symbols?: OcrTextLineSymbol[];
};

export type OcrItem = {
    text: OcrTextLine[];
    recognition_score: number; // Text confidence
    classification_score: number; // Text direction confidence
    classification_label: number; // Text direction
    box: OcrItemBox;
};

export type OcrResultContextResolution = {
    width: number;
    height: number;
}

export type OcrResult_CreationInput = {
    id: string;
    context_resolution?: OcrResultContextResolution;
    results?: OcrItem[];
};


export class OcrResult {

    public readonly id: string;
    public context_resolution: OcrResultContextResolution;
    public results: OcrItem[];    
    
    private constructor( input: OcrResult_CreationInput ) {

        this.id = input.id;
        
        this.context_resolution = {
            width: input?.context_resolution?.width || 0,
            height: input?.context_resolution?.height || 0,
        };

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