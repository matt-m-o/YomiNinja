import { OcrItem, OcrItemBox, OcrItemBoxVertex, OcrResult, OcrResultContextResolution, OcrTextLineSymbol } from "../ocr_result/ocr_result";

// Position percentages
export type OcrResultBoxPositionPcts = {
    top: number;
    left: number;
};

// Dimensions percentages
export type OcrResultBoxDimensionsPcts = {
    width: number;
    height: number;
};

// Ocr result box percentages to position, scale and rotate the boxes
export type OcrResultBoxScalable = {
    position: OcrResultBoxPositionPcts;
    dimensions?: OcrResultBoxDimensionsPcts;
    angle_degrees?: number;
    isVertical: boolean;
    transform_origin?: 'top' | 'bottom' | 'center';
};

export type OcrTextLineSymbolScalable = {
    symbol: string;
    box: OcrResultBoxScalable;
    letter_spacing: number;
};

export type OcrTextLineScalable = {
    content: string;
    box?: OcrResultBoxScalable;
    symbols?: OcrTextLineSymbolScalable[];
};

export interface OcrItemScalable {
    text: OcrTextLineScalable[];
    box: OcrResultBoxScalable;
    recognition_score: number,
    classification_score: number,
    classification_label: number,
};

export interface OcrRegion {
    id?: string,
    results: OcrItemScalable[],
    position: { // Percentages
        top: number; 
        left: number;
    };
    size: { // Percentages
        width: number;
        height: number;
    };
};


export type OcrResultScalable_CreationInput = {
    id: string;
    context_resolution?: OcrResultContextResolution;
    results?: OcrItemScalable[];
    ocr_regions?: OcrRegion[];
};

// Scalable version OcrResult. Uses percentages instead of pixel coordinates
export class OcrResultScalable {

    public id: string;
    public context_resolution: OcrResultContextResolution;
    // public results: OcrItemScalable[];
    public ocr_regions: OcrRegion[];
    
    private constructor( input: OcrResultScalable_CreationInput ) {

        this.id = input.id;
        
        this.context_resolution = {
            width: input?.context_resolution?.width || 0,
            height: input?.context_resolution?.height || 0,
        };

        // this.results = input.results ? [ ...input?.results ] : [];
        this.ocr_regions = input?.ocr_regions ? input.ocr_regions : [];
    }

    static create( input: OcrResultScalable_CreationInput ): OcrResultScalable {
        return new OcrResultScalable( input );
    }
    
    // Adds results from another OcrResultScalable as a subregion
    addRegionResult(
        input: {
            regionResult: OcrResultScalable;
            regionPosition: { // Percentages
                top: number; 
                left: number;
            };
            regionSize: {
                width: number;
                height: number;
            },
            globalScaling?: boolean; // true => Use global context resolution instead of region resolution
            regionId?: string;
        }
    ) {
        const { regionResult, regionPosition, regionSize, globalScaling } = input;

        const rescaledRegionResults = regionResult.ocr_regions[0].results.map( result => {

            if ( !globalScaling )
                return result;

            let {
                position: boxPosition,
                dimensions: boxDimensions
            } = result.box;


            result.box.position = {
                top: ( regionPosition.top * 100 ) + ( boxPosition.top * regionSize.height ),
                left: ( regionPosition.left * 100 ) + ( boxPosition.left * regionSize.width ),
            };

            if ( !boxDimensions )
                boxDimensions = { width: 0, height: 0 };

            result.box.dimensions = {
                width: ( boxDimensions.width * regionSize.width ),
                height: ( boxDimensions.height * regionSize.height ),
            };

            return result;
        });

        this.ocr_regions.push({
            results: rescaledRegionResults,
            position: regionPosition,
            size: regionSize,
            id: input.regionId
        });

        // this.results = [ ...this.results, ...rescaledRegionResults ];
    }

    static createFromOcrResult( ocrResult: OcrResult ): OcrResultScalable {

        // console.time("createFromOcrResult");

        const results: OcrItemScalable[] = [];
        const ocr_regions: OcrRegion[] = []

        ocrResult.results.forEach( item => {

            const { context_resolution } = ocrResult;

            const itemBox = OcrResultScalable.getBoxScalable(
                item.box,
                ocrResult.context_resolution
            );
            
            const text = item.text.map( line => {

                const lineScalable: OcrTextLineScalable = {
                    content: line.content,
                    symbols: []
                };
                
                // TODO: Calculate position and dimensions

                // Symbols
                line?.symbols?.forEach( ( symbol, sIdx ) => {

                    if ( !line?.symbols ) return;

                    let nextSymbol: OcrTextLineSymbol | undefined;
            
                    if ( line?.symbols.length-1 >= sIdx+1 )
                        nextSymbol = line.symbols[ sIdx+1 ];
                    
                    const box = OcrResultScalable.getBoxScalable(
                        symbol.box,
                        context_resolution
                    );

                    let letterSpacing = 0;

                    if ( nextSymbol ) {
                        letterSpacing = OcrResultScalable.calculateSymbolLetterSpacing(
                            symbol, nextSymbol, box.isVertical, context_resolution
                        );
                        
                        if ( itemBox.dimensions ) {

                            if ( !box.isVertical )
                                letterSpacing = letterSpacing / context_resolution.width;
                            else
                                letterSpacing = letterSpacing / context_resolution.height;
                        }
                    }
                    
                    lineScalable.symbols?.push({
                        symbol: symbol.symbol,
                        box,
                        letter_spacing: letterSpacing
                    });

                })

                return lineScalable;
            });

            results.push({
                box: itemBox,
                text,
                recognition_score: item.recognition_score,
                classification_score: item.classification_score,
                classification_label: item.classification_label
            });

        });

        // console.timeEnd("createFromOcrResult"); // ~0.154ms to ~0.332ms

        ocr_regions.push({
            results,
            position: {
                left: 0,
                top: 0,
            },
            size: {
                height: 1,
                width: 1
            }
        });

        return OcrResultScalable.create({
            id: ocrResult.id,
            results,
            context_resolution: ocrResult.context_resolution,
            ocr_regions
        });
    }

    
    private static calculateBoxPosition( box: OcrItemBox, contextResolution: OcrResultContextResolution ): OcrResultBoxPositionPcts {

        const { width, height } = contextResolution;

        const topLeftXPixels = box.top_left.x;
        const position_left = ( 1 - ( ( width - topLeftXPixels ) / width ) ) * 100;

        const topLeftYPixels = box.top_left.y;
        const position_top = ( 1 - ( ( height - topLeftYPixels ) / height ) ) * 100;
        
        return {
            left: position_left,
            top: position_top
        }
    }

    
    private static calculateBoxAngle( verticalDistance: number, horizontalDistance: number ): number {    

        verticalDistance = verticalDistance * -1;

        const negativeRotation = verticalDistance > 0;

        verticalDistance = Math.abs( verticalDistance );
        
        // Ensure height and distance are positive numbers
        if ( verticalDistance <= 0 || horizontalDistance <= 0 )
            return 0; // Invalid input

        // Calculate the angle in radians
        const radians = Math.atan( verticalDistance / horizontalDistance );

        // Convert radians to degrees
        const degrees = radians * (180 / Math.PI);

        if (negativeRotation)
            return -degrees;

        return degrees;
    }

    static calculateAngleBetweenVertices( vA: OcrItemBoxVertex, vB: OcrItemBoxVertex ) {
        
        const deltaX = vB.x - vA.x;
        const deltaY = vB.y - vA.y;

        const angleInRadians = Math.atan2( deltaY, deltaX );
        const angleInDegrees = angleInRadians * (180 / Math.PI);

        // Ensure the angle is positive (between 0 and 360 degrees)
        const positiveAngle = ( angleInDegrees + 360 ) % 360;

        return positiveAngle;
    }
    
    private static calculateBoxWidth(
        verticalDistance: number,
        horizontalDistance: number,
        contextResolution: OcrResultContextResolution
    ): number {    

        const topToLeftHypot = Math.hypot( Math.abs(verticalDistance), horizontalDistance ); // Diagonal distance

        const widthPercent = ( topToLeftHypot / contextResolution.width ) * 100;

        return widthPercent || horizontalDistance;
    }

    
    private static calculateBoxHeight(
        box: OcrItemBox,
        contextResolution: OcrResultContextResolution
    ) {

        const { top_left, bottom_left } = box;

        const topToBottomVerticalDistance = Math.abs( top_left.y - bottom_left.y );

        const topToBottomHorizontalDistance = Math.abs( top_left.x - bottom_left.x );

        const topToBottomHypot = Math.hypot( topToBottomVerticalDistance, topToBottomHorizontalDistance ); // Diagonal distance        

        return ( topToBottomHypot / contextResolution.height ) * 100;
    }

    private static getBoxScalable(
        box: OcrItemBox,
        contextResolution: OcrResultContextResolution
    ): OcrResultBoxScalable {

        const verticalDistance = box.top_right.y - box.top_left.y;
        const horizontalDistance = box.top_right.x - box.top_left.x;

        const position = OcrResultScalable.calculateBoxPosition(
            box, contextResolution
        );


        const angle_degrees = OcrResultScalable.calculateAngleBetweenVertices(
            box.bottom_left, // box.top_left,
            box.bottom_right // box.top_right
        );

        const width = OcrResultScalable.calculateBoxWidth(
            verticalDistance,
            horizontalDistance,
            contextResolution
        );

        const height = OcrResultScalable.calculateBoxHeight(
            box,
            contextResolution,
        );

        const boxWidthPx = contextResolution.width * ( width / 100 );
        const boxHeightPx = contextResolution.height * ( height / 100 );

        const isVertical = boxHeightPx > ( boxWidthPx * 1.40 ) || angle_degrees < -70;

        return {
            position,
            angle_degrees,
            dimensions: {
                width,
                height
            },
            isVertical
        }
    }

    static calculateEuclideanDistance( vertexA: OcrItemBoxVertex, vertexB: OcrItemBoxVertex ): number {

        const deltaX = vertexB.x - vertexA.x;
        const deltaY = vertexB.y - vertexA.y;
    
        const distance = Math.sqrt( deltaX ** 2 + deltaY ** 2) ;
        
        return distance;
    }
    
    static calculateSymbolLetterSpacing(
        symbol: OcrTextLineSymbol,
        nextSymbol: OcrTextLineSymbol,
        isVertical: boolean,
        contextResolution: OcrResultContextResolution
    ): number {

        if ( !nextSymbol ) return 0;

        let vertexA: OcrItemBoxVertex;
        let vertexB: OcrItemBoxVertex;

        let symbolLength = 0;

        if ( !isVertical ) {

            const verticalDistance = nextSymbol.box.top_right.y - nextSymbol.box.top_left.y;
            const horizontalDistance = nextSymbol.box.top_right.x - nextSymbol.box.top_left.x;

            vertexA = symbol.box.top_right;
            vertexB = nextSymbol.box.top_right;

            symbolLength = OcrResultScalable.calculateBoxWidth(
                verticalDistance,
                horizontalDistance,
                contextResolution
            );
        }
        else {
            vertexA = symbol.box.bottom_left;
            vertexB = nextSymbol.box.bottom_left;
        }

        let distance = OcrResultScalable.calculateEuclideanDistance( vertexA, vertexB );

        return distance - symbolLength;
    }
}