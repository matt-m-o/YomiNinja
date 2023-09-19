
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

export type OcrItem = {
    text: string;
    score: number;
    box: OcrItemBox;
};

export type OcrResultContextResolution = {
    width: number;
    height: number;
}

export type OcrResultProperties = {
    context_resolution: OcrResultContextResolution;
    results: OcrItem[];
};


export class OcrResult {

    public readonly id: number;
    public context_resolution: OcrResultContextResolution;
    public results: OcrItem[];    
    
    private constructor( input: {
        id: number,
        context_resolution: OcrResultContextResolution;
        results: OcrItem[];
    }) {

        this.id = input.id;
        
        this.context_resolution = {
            width: input.context_resolution.width || 0,
            height: input.context_resolution.height || 0,
        };

        this.results = input.results ? [ ...input?.results ] : [];
    }

    static create( input: {
        id: number,
        context_resolution: OcrResultContextResolution;
        results: OcrItem[];
    }): OcrResult {
        return new OcrResult( input );
    }
            

    addResultItem( item: OcrItem ): void {
        this.results.push( item );
    }    
}