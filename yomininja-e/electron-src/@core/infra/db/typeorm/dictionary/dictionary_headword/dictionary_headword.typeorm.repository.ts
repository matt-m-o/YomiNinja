import { FindOptionsOrder, FindOptionsWhere, Raw, Repository } from "typeorm";
import { DictionaryHeadwordFindManyInput, DictionaryHeadwordFindOneInput, DictionaryHeadwordRepository } from "../../../../../domain/dictionary/dictionary_headword/dictionary_headword.repository";
import { DictionaryHeadword, DictionaryHeadwordId } from "../../../../../domain/dictionary/dictionary_headword/dictionary_headword";



export default class DictionaryHeadwordTypeOrmRepository implements DictionaryHeadwordRepository {

    constructor ( private ormRepo: Repository< DictionaryHeadword > ) {}

    async insert( headwords: DictionaryHeadword[] ): Promise< void > {

        const batchSize = 1000;

        for ( let i = 0; i < headwords.length; i += batchSize ) {

            const batch = headwords.slice( i, i + batchSize );
            await this.ormRepo.save( batch );
        }
    }

    async update( headwords: DictionaryHeadword[] ): Promise< void > {

        const batchSize = 500;

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

    async findManyLike( input: DictionaryHeadwordFindManyInput ): Promise< DictionaryHeadword[] > {

        const { term, reading } = input;        

        const where: FindOptionsWhere< DictionaryHeadword >[] = [];
        const order: FindOptionsOrder< DictionaryHeadword > = {};

        if ( !term && !reading ) return [];

        const getRawSqlOperator = ( value: string ) => {
            const length = value.length;
            return Raw( alias =>
                `LENGTH(${alias}) >= 1 AND 
                LENGTH(${alias}) <= ${length} AND
                :searchValue LIKE ${alias} || '%'`,
                { searchValue: value }
            );
        }

        if (term) {
            where.push({
                term: getRawSqlOperator( term )
            });
            order.term = 'DESC';
        }

        if (reading) {
            where.push({
                reading: getRawSqlOperator( reading )
            });
            order.reading = 'DESC';
        }

        const headwords = await this.ormRepo.find({ 
            where,
            order,
            take: 40,
            relations: [ 'tags', 'definitions' ]
        });

        return headwords;
    }

    async delete( id: DictionaryHeadwordId ): Promise< void> {
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