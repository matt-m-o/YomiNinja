import { Repository } from "typeorm";
import { Dictionary, DictionaryId } from "../../../../domain/dictionary/dictionary";
import { DictionaryFindManyInput, DictionaryFindOneInput, DictionaryRepository } from "../../../../domain/dictionary/dictionary.repository";



export default class DictionaryTypeOrmRepository implements DictionaryRepository {

    constructor ( private ormRepo: Repository< Dictionary > ) {}

    async insert( dictionary: Dictionary ): Promise< void > {
        await this.ormRepo.save( dictionary );
    }    
    
    async findOne( params: DictionaryFindOneInput ): Promise< Dictionary | null > {        

        return await this.ormRepo.findOne({
            where: {
                ...params,
            }
        });
    }

    async findMany( params: DictionaryFindManyInput ): Promise< Dictionary[] > {        

        return await this.ormRepo.find({
            where: params            
        });
    }

    async getAll(): Promise< Dictionary[] > {

        return await this.ormRepo.find();
    }

    async delete( id: DictionaryId ): Promise< void> {
        await this.ormRepo.delete( { id } );
    }    
}