import { DataSource } from "typeorm";
import { ImportYomichanDictionaryUseCase, ImportYomichanDictionary_Input } from "./import_yomichan_dictionary.use_case";
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
import { YomichanTagBankItem, YomichanTermBankItem } from "./yomichan_dictionary_types";
import { getRawDictionaryTags } from "../../../../domain/dictionary/common/test/dictionary_tag_test_data";
import { getRawDictionaryDefinitions } from "../../../../domain/dictionary/common/test/dictionary_definition_test_data";



describe('ImportYomichanDictionaryUseCase tests', () => {

    let useCase: ImportYomichanDictionaryUseCase;

    let dictionariesRepo: DictionaryRepository;
    let tagsRepo: DictionaryTagRepository;
    let definitionsRepo: DictionaryDefinitionRepository;
    let headwordsRepo: DictionaryHeadwordRepository;

    const languageJa = Language.create({
        name: 'japanese',
        two_letter_code: 'ja',
    });

    const languageEn = Language.create({
        name: 'english',
        two_letter_code: 'en',
    });

    let tagBank: YomichanTagBankItem[];
    let termBank: YomichanTermBankItem[];

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

        tagsRepo = new DictionaryTagTypeOrmRepository(
            dataSource.getRepository( DictionaryTag )
        );

        definitionsRepo = new DictionaryDefinitionTypeOrmRepository(
            dataSource.getRepository( DictionaryDefinition )
        );

        headwordsRepo = new DictionaryHeadwordTypeOrmRepository(
            dataSource.getRepository( DictionaryHeadword )
        );

        useCase = new ImportYomichanDictionaryUseCase({
            dictionariesRepo,
            tagsRepo,
            definitionsRepo,
            headwordsRepo
        });

        tagBank = getRawDictionaryTags();
        termBank = getRawDictionaryDefinitions();
    });


    it('should import a dictionary, without tags and terms', async () => {

        const input: ImportYomichanDictionary_Input = {
            dictionaryName: 'JMdict (English)',
            sourceLanguage: languageJa,
            targetLanguage: languageEn,
        };

        const output = await useCase.execute( input );

        const dictionary = await dictionariesRepo.findOne({
            name: input.dictionaryName
        });

        expect( output ).toStrictEqual( dictionary );
        expect( dictionary ).toBeDefined();
        expect( dictionary?.source_language )
            .toStrictEqual( input.sourceLanguage.two_letter_code );
        expect( dictionary?.target_language )
            .toStrictEqual( input.targetLanguage.two_letter_code );
    });

    it('should import dictionary tags', async () => {

        const input: ImportYomichanDictionary_Input = {
            dictionaryName: 'JMdict (English)',
            sourceLanguage: languageJa,
            targetLanguage: languageEn,
            tagBank,
        };

        await useCase.execute( input );

        const tags = await tagsRepo.getAll();
        expect( tags ).toBeDefined();
        expect( tags )
            .toHaveLength( tagBank.length );

        const pnTag = await tagsRepo.findOne({ name: 'pn' });
        expect( pnTag ).toBeDefined();
        expect( pnTag?.name ).toStrictEqual( 'pn' );
        expect( pnTag?.content ).toStrictEqual( 'pronoun' );
    });


    it('should import dictionary terms (definition and headwords)', async () => {

        const input: ImportYomichanDictionary_Input = {
            dictionaryName: 'JMdict (English)',
            sourceLanguage: languageJa,
            targetLanguage: languageEn,
            termBank,
        };

        const dictionary = await useCase.execute( input );

        const headwords = await headwordsRepo.findMany({});
        expect( headwords ).toBeDefined();
        expect( headwords )
            .toHaveLength( 2 );


        const headwordId = headwords?.[0].id || '';

        const definitions = await definitionsRepo.findMany({
            dictionary_headword_id: headwordId,
        });
        expect( definitions ).toBeDefined();
        expect( definitions )
            .toHaveLength( 2 );
    });

});