
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

    public readonly props: OcrResultProperties;
    
    private constructor( input: { id: number, props?: OcrResultProperties } ) {

        this.id = input.id;
        
        this.props = {
            ...input.props,
            results: input.props?.results ? [ ...input?.props?.results ] : []
        }        
    }

    static create( input: { id: number, props?: OcrResultProperties } ): OcrResult {
        return new OcrResult( input );
    }
    
    get contextResolution(){ return this.props.context_resolution; }

    get results(){ return this.props.results; }

    set contextResolution( obj: OcrResultContextResolution ) {
        this.props.context_resolution = {
            width: obj.width,
            height: obj.height,            
        };
    }

    addResultItem( item: OcrItem ): void {
        this.props.results.push( item );
    }

    set setResults( items: OcrItem[] ) {
        items.map( item => {
            this.props.results.push(item);
        });
    }
}