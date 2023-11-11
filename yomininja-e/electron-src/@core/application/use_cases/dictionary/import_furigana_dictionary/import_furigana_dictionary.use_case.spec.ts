import { DataSource } from "typeorm";
import { DictionaryHeadwordTypeOrmSchema } from "../../../../infra/db/typeorm/dictionary/dictionary_headword/dictionary_headword.schema";
import { DictionaryRepository } from "../../../../domain/dictionary/dictionary.repository";
import { DictionaryHeadwordRepository } from "../../../../domain/dictionary/dictionary_headword/dictionary_headword.repository";

import DictionaryHeadwordTypeOrmRepository from "../../../../infra/db/typeorm/dictionary/dictionary_headword/dictionary_headword.typeorm.repository";
import { DictionaryHeadword } from "../../../../domain/dictionary/dictionary_headword/dictionary_headword";
import { ImportFuriganaDictionaryUseCase, ImportFuriganaDictionary_Input } from "./import_furigana_dictionary.use_case";
import { FuriganaDictionaryItem } from "./furigana_dictionary_types";
import { getRawFuriganaDictionaryItems } from "./furigana_dictionary_test_data";
import { DictionaryTagTypeOrmSchema } from "../../../../infra/db/typeorm/dictionary/dictionary_tag/dictionary_tag.schema";
import { DictionaryDefinitionTypeOrmSchema } from "../../../../infra/db/typeorm/dictionary/dictionary_definition/dictionary_definition.schema";



describe('ImportFuriganaDictionaryUseCase tests', () => {

    let useCase: ImportFuriganaDictionaryUseCase;
    
    let headwordsRepo: DictionaryHeadwordRepository;

    let furiganaDictionaryItems: FuriganaDictionaryItem[] = [];


    beforeEach( async () => {

        const dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [                
                DictionaryHeadwordTypeOrmSchema,
                DictionaryTagTypeOrmSchema,
                DictionaryDefinitionTypeOrmSchema,
            ]
        });

        await dataSource.initialize();

        headwordsRepo = new DictionaryHeadwordTypeOrmRepository(
            dataSource.getRepository( DictionaryHeadword )
        );

        useCase = new ImportFuriganaDictionaryUseCase({            
            headwordsRepo
        });

        furiganaDictionaryItems = getRawFuriganaDictionaryItems();
    });


    it('should import a furigana dictionary item for a not existent headword', async () => {

        const rawFuriganaItem = furiganaDictionaryItems[0];

        const input: ImportFuriganaDictionary_Input = {
            items: [ rawFuriganaItem ]
        };

        await useCase.execute( input );

        const headword = await headwordsRepo.findOne({
            term: rawFuriganaItem.text,
            reading: rawFuriganaItem.reading
        });

        expect( headword ).toBeDefined();
        expect( headword?.furigana ).toBeDefined();
        expect( headword?.furigana ).toStrictEqual( rawFuriganaItem.furigana );
    });

    it('should import a furigana dictionary item for a existent headword', async () => {

        const rawFuriganaItem = furiganaDictionaryItems[0];

        const headword = DictionaryHeadword.create({
            term: rawFuriganaItem.text,
            reading: rawFuriganaItem.reading
        });
        await headwordsRepo.insert([ headword ]);
        

        const input: ImportFuriganaDictionary_Input = {
            items: [ rawFuriganaItem ]
        };

        await useCase.execute( input );

        const foundHeadword = await headwordsRepo.findOne({
            term: rawFuriganaItem.text,
            reading: rawFuriganaItem.reading
        });

        expect( foundHeadword ).toBeDefined();
        expect( foundHeadword?.furigana ).toBeDefined();
        expect( foundHeadword?.furigana ).toStrictEqual( rawFuriganaItem.furigana );
    });


});