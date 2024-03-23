import { Repository } from "typeorm";
import { LanguageFindOneInput, LanguageRepository } from "../../../../domain/language/language.repository";
import { Language } from "../../../../domain/language/language";



export default class LanguageTypeOrmRepository implements LanguageRepository {

    constructor ( private ormRepo: Repository< Language > ) {}

    async insert( language: Language ): Promise<void> {
        await this.ormRepo.save( language );
    }

    async findOne( params: LanguageFindOneInput ): Promise< Language | null > {
        return this.ormRepo.findOneBy( params );
    }

    async update( language: Language ): Promise< void > {
        await this.ormRepo.save( language );
    }

    async getAll(): Promise< Language[] > {
        return this.ormRepo.find();
    }

    async delete( id: string ): Promise< void > {
        await this.ormRepo.delete({ id });
    }
}