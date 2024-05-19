import { OcrResult, OcrResult_CreationInput } from "../../../domain/ocr_result/ocr_result";
import { OcrAdapter, OcrRecognitionInput } from "../../adapters/ocr.adapter";
import { FakeOcrEngineSettings, FakeOcrTestAdapter } from "../../../infra/test/fake_ocr.adapter/fake_ocr.adapter";
import { GetSupportedLanguagesUseCase } from "./get_supported_languages.use_case";
import { DataSource } from "typeorm";
import { LanguageTypeOrmSchema } from "../../../infra/db/typeorm/language/language.schema";
import { Language } from "../../../domain/language/language";
import LanguageTypeOrmRepository from "../../../infra/db/typeorm/language/language.typeorm.repository";
import { OcrEngineSettingsU } from "../../../infra/types/entity_instance.types";



describe("Get Supported Languages Use Case tests", () => {
                
    const ocrTestAdapterResultProps: OcrResult_CreationInput = {
        id: '1',
        context_resolution: {
            width: 1920,
            height: 1080,                        
        },
        results: [
            {
                text:[{ content: "recognized_text" }],
                recognition_score: 0.99,
                classification_score: 0.99,
                classification_label: 1,
                box: {
                    top_left: { x: 0, y: 0 },
                    top_right: { x: 10, y: 0 },
                    bottom_left: { x: 0, y: 10 },
                    bottom_right: { x: 10, y: 10 },
                }
            }
        ]
    };

    const ocrTestAdapterSupportedLanguages = [ "en", "ja" ];
    let languagesInRepo: Language[];

    let ocrTestAdapter: FakeOcrTestAdapter;
    let languagesRepo: LanguageTypeOrmRepository;
    let getSupportedLanguages: GetSupportedLanguagesUseCase< FakeOcrEngineSettings >;

    beforeEach( async () => {

        let dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [                
                LanguageTypeOrmSchema
            ],
        });

        await dataSource.initialize();
        
        const languageEn = Language.create({ name: 'english', two_letter_code: 'en' });    

        languagesRepo = new LanguageTypeOrmRepository( dataSource.getRepository( Language ) );

        await languagesRepo.insert( languageEn );

        languagesInRepo = await languagesRepo.getAll();

        ocrTestAdapter = new FakeOcrTestAdapter( ocrTestAdapterResultProps, ocrTestAdapterSupportedLanguages );
        ocrTestAdapter.initialize();
        getSupportedLanguages = new GetSupportedLanguagesUseCase< FakeOcrEngineSettings >( [ ocrTestAdapter ], languagesRepo );        
    });

    it("should check if the use case has an adapter", () => {
        
        expect( getSupportedLanguages.ocrAdapters ).toHaveLength( 1 );
        expect( getSupportedLanguages.ocrAdapters[0] ).toStrictEqual( ocrTestAdapter );
    });

    it("should the available language, excluding languages that aren't in repository", async () => {

        const result = await getSupportedLanguages.execute();

        expect( result.length == 1 ).toBeTruthy();
        expect( result[0].adapterName ).toStrictEqual( FakeOcrTestAdapter._name );
    
        expect( result[0].languages ).toHaveLength( 1 );        
    });
    

    it("should return all available languages, returning only english", async () => {

        const result = await getSupportedLanguages.execute();

        expect( result.length == 1 ).toBeTruthy();
        expect( result[0].adapterName ).toStrictEqual( FakeOcrTestAdapter._name );
    
        expect( result[0].languages ).toHaveLength( 1 );

        const english = result[0].languages[0];

        expect( english.name ).toStrictEqual('english');
        expect( english.two_letter_code ).toStrictEqual('en');
    });


    it("should return all available languages, returning both english and japanese", async () => {

        await languagesRepo.insert( Language.create( { name:'japanese', two_letter_code: 'ja'  }) );

        const result = await getSupportedLanguages.execute();

        expect( result.length == 1 ).toBeTruthy();            
        expect( result[0].languages ).toHaveLength( 2 );

        const english = result[0].languages.find( language => language.two_letter_code === 'en' );
        const japanese = result[0].languages.find( language => language.two_letter_code === 'ja' );
        
        expect( english ).toBeDefined();
        expect( english?.name ).toStrictEqual('english');
        expect( english?.two_letter_code ).toStrictEqual('en');

        expect( japanese ).toBeDefined();
        expect( japanese?.name ).toStrictEqual('japanese');
        expect( japanese?.two_letter_code ).toStrictEqual('ja');
    });
});