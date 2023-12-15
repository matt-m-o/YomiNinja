import { Repository } from "typeorm";
import { ProfileFindOneInput, ProfileRepository } from "../../../../domain/profile/profile.repository";
import { Profile } from "../../../../domain/profile/profile";
import NodeCache from "node-cache";


export default class ProfileTypeOrmRepository implements ProfileRepository {

    cache: NodeCache;

    constructor ( private ormRepo: Repository< Profile > ) {
        const stdTTL = 60 * 60 * 6; // 6 hours
        const checkperiod =  60 * 60 // 1 hour
        this.cache = new NodeCache({ stdTTL, checkperiod, maxKeys: 1000 });
    }

    async insert( profile: Profile ): Promise<void> {

        this.clearCache();

        await this.ormRepo.save( profile );
    }
    async update( profile: Profile ): Promise<void> {

        this.clearCache();

        await this.ormRepo.save( profile );
    }
    async findOne( params: ProfileFindOneInput ): Promise< Profile | null > {

        const { id, name } = params;

        const cacheKey = `findOne/${id}+${name}`;

        const cachedResult = this.getFromCache( cacheKey );
        if ( cachedResult )
            return cachedResult;

        const result = await this.ormRepo.findOne({
            where: params,
            relations: [
                'active_settings_preset',
                'active_ocr_language',
                'active_ocr_template'
            ]
        });

        this.runNullCheck( result );

        this.cache.set( cacheKey, result );

        return result;
    }
    async getAll(): Promise< Profile[] > {

        const results = await this.ormRepo.find({
            relations: [
                'active_settings_preset',
                'active_ocr_language',
                'active_ocr_template'
            ],
        });
        this.runNullCheck( results );

        return results
    }

    async delete(id: string): Promise<void> {

        this.clearCache();
        
        await this.ormRepo.delete( { id } );
    }

    clearCache() {
        if ( this.cache.keys().length > 0 )
            this.cache.flushAll();
    }

    addToCache( key: string, content: Profile ) {
        this.cache.set( key, content );
    }

    getFromCache( key: string ): Profile | undefined {

        if ( !this.cache.has(key) ) return;
        
        return this.cache.get( key );
    }

    private runNullCheck( input?: Profile | Profile[] | null ) {

        if ( !input ) return;

        if ( Array.isArray(input) ) {
            input.forEach( item =>
                item?.active_ocr_template?.nullCheck()
            );
        }
        else 
            input?.active_ocr_template?.nullCheck();
    }
}