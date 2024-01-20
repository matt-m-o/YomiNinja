import { Repository } from "typeorm";
import { LanguageFindOneInput, LanguageRepository } from "../../../../domain/language/language.repository";
import { Language } from "../../../../domain/language/language";
import { BrowserExtensionFindOneInput, BrowserExtensionRepository } from "../../../../domain/browser_extension/browser_extension.repository";
import { BrowserExtension, BrowserExtensionId } from "../../../../domain/browser_extension/browser_extension";



export default class BrowserExtensionTypeOrmRepository implements BrowserExtensionRepository {

    constructor ( private ormRepo: Repository< BrowserExtension > ) {}

    async insert( extension: BrowserExtension ): Promise<void> {
        await this.ormRepo.save( extension );
    }

    async findOne( params: BrowserExtensionFindOneInput ): Promise< BrowserExtension | null > {
        return this.ormRepo.findOneBy( params );
    }

    async getAll(): Promise< BrowserExtension[] > {
        return this.ormRepo.find();
    }

    async update( extension: BrowserExtension ): Promise< void > {
        await this.ormRepo.save( extension );
    }

    async delete( id: BrowserExtensionId ) {
        await this.ormRepo.delete({
            id
        });
    }
}