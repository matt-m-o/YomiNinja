import { OcrTargetRegion, OcrTargetRegionId, OcrTemplateId } from "./ocr_target_region";


export type OcrTargetRegionFindOneInput = {
    id: OcrTargetRegionId;
}

export interface OcrTargetRegionRepository {

    insert( ocrTargetRegion: OcrTargetRegion ): Promise< void >;

    update( ocrTargetRegion: OcrTargetRegion ): Promise< void >;

    findOne( input: OcrTargetRegionFindOneInput ): Promise< OcrTargetRegion | null >;

    getAll(): Promise< OcrTargetRegion[] >;

    delete( id: string ): Promise< void >;
}