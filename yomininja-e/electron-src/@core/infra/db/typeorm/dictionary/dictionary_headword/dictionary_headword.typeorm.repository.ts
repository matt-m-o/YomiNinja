import { Repository } from "typeorm";
import { DictionaryHeadwordFindManyInput, DictionaryHeadwordFindOneInput, DictionaryHeadwordRepository } from "../../../../../domain/dictionary/dictionary_headword/dictionary_headword.repository";
import { DictionaryHeadword } from "../../../../../domain/dictionary/dictionary_headword/dictionary_headword";



export default class DictionaryHeadwordTypeOrmRepository implements DictionaryHeadwordRepository {

    constructor ( private ormRepo: Repository< DictionaryHeadword > ) {}

    async insert( headwords: DictionaryHeadword[] ): Promise< void > {

        const batchSize = 1000;

        for ( let i = 0; i < headwords.length; i += batchSize ) {

            const batch = headwords.slice( i, i + batchSize );
            await this.ormRepo.save( batch );
        }
    }

    async exist( params: DictionaryHeadwordFindOneInput ): Promise< boolean > {        

        return await this.ormRepo.exist({
            where: params
        });
    }
    
    async findOne( params: DictionaryHeadwordFindOneInput ): Promise< DictionaryHeadword | null > {

        const headword = await this.ormRepo.findOne({
            where: {
                ...params,
            },
            relations: [ 'tags', 'definitions' ]
        });

        this.runNullCheck( headword );

        return headword;
    }

    async findMany( params: DictionaryHeadwordFindManyInput ): Promise< DictionaryHeadword[] | null > {

        const headword = await this.ormRepo.find({
            where: {
                term: params?.term,
                reading: params?.reading,
            },
            relations: [ 'tags', 'definitions' ]
        });

        this.runNullCheck( headword );

        return headword;
    }

    async delete( id: string ): Promise< void> {
        await this.ormRepo.delete( { id } );
    }

    private runNullCheck( input?: DictionaryHeadword | DictionaryHeadword[] | null ) {

        if ( !input ) return;

        if ( Array.isArray(input) )
            input.forEach( item => item.nullCheck() );
        else 
            input.nullCheck();
    }
}