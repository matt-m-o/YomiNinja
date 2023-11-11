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
import { SearchDictionaryTermUseCase, SearchDictionaryTerm_Input } from "./search_dictionary_term.use_case";



describe('SearchDictionaryTermUseCase tests', () => {

    let useCase: SearchDictionaryTermUseCase;

    let dictionariesRepo: DictionaryRepository;
    let headwordsRepo: DictionaryHeadwordRepository;    

    beforeEach( async () => {

        const dataSource = new DataSource({
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

        headwordsRepo = new DictionaryHeadwordTypeOrmRepository(
            dataSource.getRepository( DictionaryHeadword )
        );

        useCase = new SearchDictionaryTermUseCase({
            dictionariesRepo,            
            headwordsRepo
        });

        const rawDefinitions = getRawDictionaryDefinitions();

        for ( const rawDefinition of rawDefinitions ) {

            expect( rawDefinition ).toBeDefined();
            if ( !rawDefinition ) return;

            const dictionary_headword_id = DictionaryHeadword.generateId({
                term: rawDefinition.term,
                reading: rawDefinition.reading
            });

            const headwordExists = await headwordsRepo.exist({ id: dictionary_headword_id });
            if ( headwordExists )
                continue;

            const headword = DictionaryHeadword.create({
                ...rawDefinition,
                tags: [],
                definitions: [],
            });

            await dataSource.getRepository( DictionaryHeadword ).save( headword );
        }
        
    });


    it('should search a dictionary headword term', async () => {

        const input: SearchDictionaryTerm_Input = {
            term: '彼処'
        };

        const output = await useCase.execute( input );

        expect( output ).toHaveLength( 2 );
    });

    it('should search a dictionary headword reading', async () => {

        const input: SearchDictionaryTerm_Input = {
            reading: 'あそこ'
        };

        const output = await useCase.execute( input );

        expect( output ).toHaveLength( 1 );
    });

    it.todo('should return definitions by dictionary id');
});