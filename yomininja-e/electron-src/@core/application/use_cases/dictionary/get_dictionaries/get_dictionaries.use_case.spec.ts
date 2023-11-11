import { DataSource } from "typeorm";
import { DictionaryTypeOrmSchema } from "../../../../infra/db/typeorm/dictionary/dictionary.schema";
import { DictionaryTagTypeOrmSchema } from "../../../../infra/db/typeorm/dictionary/dictionary_tag/dictionary_tag.schema";
import DictionaryTypeOrmRepository from "../../../../infra/db/typeorm/dictionary/dictionary.typeorm.repository";
import { DictionaryDefinition } from "../../../../domain/dictionary/dictionary_definition/dictionary_definition";
import { DictionaryDefinitionTypeOrmSchema } from "../../../../infra/db/typeorm/dictionary/dictionary_definition/dictionary_definition.schema";
import { DictionaryHeadwordTypeOrmSchema } from "../../../../infra/db/typeorm/dictionary/dictionary_headword/dictionary_headword.schema";
import { DictionaryRepository } from "../../../../domain/dictionary/dictionary.repository";
import { DictionaryTagRepository } from "../../../../domain/dictionary/dictionary_tag/dictionary_tag.repository";
import { DictionaryDefinitionRepository } from "../../../../domain/dictionary/dictionary_definition/dictionary_definition.repository";
import { DictionaryHeadwordRepository } from "../../../../domain/dictionary/dictionary_headword/dictionary_headword.repository";
import { Dictionary } from "../../../../domain/dictionary/dictionary";
import DictionaryTagTypeOrmRepository from "../../../../infra/db/typeorm/dictionary/dictionary_tag/dictionary_tag.typeorm.repository";
import { DictionaryTag } from "../../../../domain/dictionary/dictionary_tag/dictionary_tag";
import DictionaryDefinitionTypeOrmRepository from "../../../../infra/db/typeorm/dictionary/dictionary_definition/dictionary_definition.typeorm.repository";
import DictionaryHeadwordTypeOrmRepository from "../../../../infra/db/typeorm/dictionary/dictionary_headword/dictionary_headword.typeorm.repository";
import { DictionaryHeadword } from "../../../../domain/dictionary/dictionary_headword/dictionary_headword";
import { Language } from "../../../../domain/language/language";
import { getRawDictionaryTags } from "../../../../domain/dictionary/common/test/dictionary_tag_test_data";
import { getRawDictionaryDefinitions } from "../../../../domain/dictionary/common/test/dictionary_definition_test_data";
import { GetDictionariesUseCase } from "./get_dictionaries.use_case";



describe('GetDictionariesUseCase tests', () => {

    let useCase: GetDictionariesUseCase;

    let dictionariesRepo: DictionaryRepository;

    let dictionary: Dictionary;

    beforeEach( async () => {

        const dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
                DictionaryTypeOrmSchema,            
            ]
        });

        await dataSource.initialize();

        dictionariesRepo = new DictionaryTypeOrmRepository(
            dataSource.getRepository( Dictionary )
        );

        useCase = new GetDictionariesUseCase({
            dictionariesRepo
        });

        dictionary = Dictionary.create({
            name: "JMdict (English)",
            version: "jmdict4",
            enabled: true,
            order: 0,
            source_language: 'ja',
            target_language: 'en',
        })

        await dictionariesRepo.insert( dictionary );
        
    });


    it('should get all installed dictionaries', async () => {

        const output = await useCase.execute();

        expect( output ).toHaveLength( 1 );
        expect( output[0] ).toStrictEqual( dictionary );
    });

});