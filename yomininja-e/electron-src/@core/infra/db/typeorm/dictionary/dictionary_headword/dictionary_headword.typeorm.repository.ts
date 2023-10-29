import { Between, FindOptionsOrder, FindOptionsWhere, MoreThanOrEqual, Raw, Repository } from "typeorm";
import { DictionaryHeadwordFindManyInput, DictionaryHeadwordFindOneInput, DictionaryHeadwordRepository } from "../../../../../domain/dictionary/dictionary_headword/dictionary_headword.repository";
import { DictionaryHeadword, DictionaryHeadwordId } from "../../../../../domain/dictionary/dictionary_headword/dictionary_headword";
import NodeCache from 'node-cache';


export default class DictionaryHeadwordTypeOrmRepository implements DictionaryHeadwordRepository {

    cache: NodeCache;

    constructor ( private ormRepo: Repository< DictionaryHeadword > ) {
        const stdTTL = 60 * 60 * 6; // 6 hours
        const checkperiod =  60 * 60 // 1 hour
        this.cache = new NodeCache({ stdTTL, checkperiod, maxKeys: 1000 });
    }

    async insert( headwords: DictionaryHeadword[] ): Promise< void > {

        const batchSize = 1000;

        for ( let i = 0; i < headwords.length; i += batchSize ) {

            const batch = headwords.slice( i, i + batchSize );
            await this.ormRepo.save( batch );
        }

        this.clearCache();
    }

    async update( headwords: DictionaryHeadword[] ): Promise< void > {

        const batchSize = 500;

        for ( let i = 0; i < headwords.length; i += batchSize ) {

            const batch = headwords.slice( i, i + batchSize );
            await this.ormRepo.save( batch );
        }

        this.clearCache();
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

        let { term, reading } = input;
        term = term?.slice( 0, 100 );
        reading = reading?.slice( 0, 100 );
        
        const cacheKey = `findManyLike/${term}+${reading}`;

        const cachedResult = this.getFromCache( cacheKey );

        if ( cachedResult )
            return cachedResult;

        const where: FindOptionsWhere< DictionaryHeadword >[] = [];
        const order: FindOptionsOrder< DictionaryHeadword > = {};

        if ( !term && !reading ) return [];

        const getRawSqlOperator = ( value: string ) => {            
            return Raw( alias =>
                `:searchValue LIKE ${alias} || '%'`,
                { searchValue: value }
            );
        }

        if (term) {
            where.push({
                term: getRawSqlOperator( term ),
                term_length: Between( 1, term.length )
            });
            // order.term_length = 'DESC';
        }

        if (reading) {
            where.push({
                reading: getRawSqlOperator( reading ),
                reading_length: Between( 1, reading.length )
            });
            // order.reading_length = 'DESC';
        }

        const headwords = await this.ormRepo.find({ 
            where,
            order,
            take: 40,
            relations: [ 'tags', 'definitions' ]
        });

        this.cache.set( cacheKey, headwords );

        return headwords;
    }

    async delete( id: DictionaryHeadwordId ): Promise< void> {
        await this.ormRepo.delete( { id } );
        this.clearCache();
    }

    private runNullCheck( input?: DictionaryHeadword | DictionaryHeadword[] | null ) {

        if ( !input ) return;

        if ( Array.isArray(input) )
            input.forEach( item => item.nullCheck() );
        else 
            input.nullCheck();
    }

    clearCache() {
        if ( this.cache.keys().length > 0 )
            this.cache.flushAll();
    }

    addToCache( key: string, content: DictionaryHeadword[] ) {
        this.cache.set( key, content );
    }

    getFromCache( key: string ): DictionaryHeadword[] | undefined {

        if ( !this.cache.has(key) ) return;
        
        return this.cache.get( key );
    }
}