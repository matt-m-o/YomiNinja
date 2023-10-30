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
import { DeleteAllDictionariesUseCase } from "./delete_all_dictionaries.use_case";




describe('DeleteAllDictionariesUseCase tests', () => {

    let useCase: DeleteAllDictionariesUseCase;

    let dataSource: DataSource;
    let dictionariesRepo: DictionaryRepository;
    let definitionsRepo: DictionaryDefinitionRepository;
    let headwordsRepo: DictionaryHeadwordRepository;    
    let tagsRepo: DictionaryTagRepository;

    let dictionary: Dictionary;

    beforeEach( async () => {

        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [
                DictionaryTypeOrmSchema,
                DictionaryTagTypeOrmSchema,
                DictionaryDefinitionTypeOrmSchema,
                DictionaryHeadwordTypeOrmSchema,
            ]
        });

        await dataSource.initialize();

        dictionariesRepo = new DictionaryTypeOrmRepository(
            dataSource.getRepository( Dictionary )
        );        

        tagsRepo = new DictionaryTagTypeOrmRepository(
            dataSource.getRepository( DictionaryTag )
        );        

        definitionsRepo = new DictionaryDefinitionTypeOrmRepository(
            dataSource.getRepository( DictionaryDefinition )
        );

        headwordsRepo = new DictionaryHeadwordTypeOrmRepository(
            dataSource.getRepository( DictionaryHeadword )
        );

        useCase = new DeleteAllDictionariesUseCase({
            dictionariesRepo,
            tagsRepo,
            definitionsRepo,
            headwordsRepo
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

        const rawDefinitions = getRawDictionaryDefinitions();

        for ( const rawDefinition of rawDefinitions ) {

            expect( rawDefinition ).toBeDefined();
            if ( !rawDefinition ) return;

            const dictionary_headword_id = DictionaryHeadword.generateId({
                term: rawDefinition.term,
                reading: rawDefinition.reading
            });

            await dataSource.getRepository( DictionaryDefinition )
                .save(
                    DictionaryDefinition.create({
                        ...rawDefinition,
                        dictionary_headword_id,
                        dictionary_id: dictionary.id,
                        tags: [],
                        popularity_score: rawDefinition.popularity
                    })
                );

            const headwordExists = await headwordsRepo.exist({ id: dictionary_headword_id });
            if ( headwordExists )
                continue;

            const headword = DictionaryHeadword.create({
                ...rawDefinition,
                tags: [],
                definitions: [],
            });

            console.log( headword )

            await dataSource.getRepository( DictionaryHeadword )
                .save( headword );
        }


        const rawPnTag = getRawDictionaryTags().find( item => item.name === 'pn' );
        expect( rawPnTag ).toBeDefined();
        if(!rawPnTag) return;

        await dataSource.getRepository( DictionaryTag )
            .save( 
                DictionaryTag.create({
                    ...rawPnTag,
                    dictionary_id: dictionary.id,
                })
            );

        const dictionaries = await dataSource.getRepository( Dictionary ).find();
        const definitions = await dataSource.getRepository( DictionaryDefinition ).find();
        const headwords = await dataSource.getRepository( DictionaryHeadword ).find();
        const tags = await dataSource.getRepository( DictionaryTag ).find();

        expect( dictionaries.length > 0 ).toBeTruthy();
        expect( definitions.length > 0 ).toBeTruthy();
        expect( headwords.length > 0 ).toBeTruthy();
        expect( tags.length > 0 ).toBeTruthy();
    });    

    it('should delete all installed dictionaries, including headwords, definitions and tags', async () => {        

        await useCase.execute();

        const dictionariesAfter = await dictionariesRepo.getAll();
        expect( dictionariesAfter ).toHaveLength( 0 );

        
        const dictionaries = await dataSource.getRepository( Dictionary ).find();
        const definitions = await dataSource.getRepository( DictionaryDefinition ).find();
        const headwords = await dataSource.getRepository( DictionaryHeadword ).find();
        const tags = await dataSource.getRepository( DictionaryTag ).find();

        expect( dictionaries.length == 0 ).toBeTruthy();
        expect( definitions.length == 0 ).toBeTruthy();
        expect( headwords.length == 0 ).toBeTruthy();
        expect( tags.length == 0 ).toBeTruthy();
    });

});