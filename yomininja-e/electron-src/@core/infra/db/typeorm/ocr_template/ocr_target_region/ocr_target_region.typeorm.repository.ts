import { Repository } from "typeorm";
import { OcrTargetRegionFindOneInput, OcrTargetRegionRepository } from "../../../../../domain/ocr_template/ocr_target_region/ocr_target_region.repository";
import { OcrTargetRegion } from "../../../../../domain/ocr_template/ocr_target_region/ocr_target_region";



export default class OcrTargetRegionTypeOrmRepository implements OcrTargetRegionRepository {

    constructor ( private ormRepo: Repository< OcrTargetRegion > ) {}

    async insert( region: OcrTargetRegion ): Promise<void> {
        await this.ormRepo.save( region );
    }

    async update( region: OcrTargetRegion ): Promise<void> {
        await this.ormRepo.save( region );
    }

    async findOne( params: OcrTargetRegionFindOneInput ): Promise< OcrTargetRegion | null > {
        return this.ormRepo.findOneBy( params );
    }
    
    async getAll(): Promise< OcrTargetRegion[] > {
        return this.ormRepo.find();
    }

    async delete(id: string): Promise<void> {
        await this.ormRepo.delete( { id } );
    }
}