import { Dictionary, DictionaryId } from "../../../../domain/dictionary/dictionary";
import { DictionaryRepository } from "../../../../domain/dictionary/dictionary.repository";
import { DictionaryDefinition } from "../../../../domain/dictionary/dictionary_definition/dictionary_definition";
import { DictionaryDefinitionRepository } from "../../../../domain/dictionary/dictionary_definition/dictionary_definition.repository";
import { DictionaryHeadword } from "../../../../domain/dictionary/dictionary_headword/dictionary_headword";
import { DictionaryHeadwordRepository } from "../../../../domain/dictionary/dictionary_headword/dictionary_headword.repository";
import { DictionaryTag } from "../../../../domain/dictionary/dictionary_tag/dictionary_tag";
import { DictionaryTagRepository } from "../../../../domain/dictionary/dictionary_tag/dictionary_tag.repository";
import { Language } from "../../../../domain/language/language";
import { YomichanTagBankItem, YomichanTermBankItem } from "./yomichan_dictionary_types";

export interface ImportYomichanDictionary_Input {
    dictionaryName: string;
    sourceLanguage: Language;
    targetLanguage: Language;
    tagBank?: YomichanTagBankItem[];
    termBank?: YomichanTermBankItem[];
}

export interface ImportYomichanDictionaryTags_Input {
    dictionaryId: DictionaryId;
    tagBank: YomichanTagBankItem[];
}

export interface ImportYomichanDictionaryTerms_Input {
    dictionaryId: DictionaryId;
    termBank: YomichanTermBankItem[];
    dictionaryTags: DictionaryTag[];
}


export class ImportYomichanDictionaryUseCase {

    dictionariesRepo: DictionaryRepository;
    tagsRepo: DictionaryTagRepository;
    definitionsRepo: DictionaryDefinitionRepository;
    headwordsRepo: DictionaryHeadwordRepository;    

    constructor( input: {
        dictionariesRepo: DictionaryRepository,
        tagsRepo: DictionaryTagRepository,
        definitionsRepo: DictionaryDefinitionRepository,
        headwordsRepo: DictionaryHeadwordRepository,
    } ) {
        this.dictionariesRepo = input.dictionariesRepo;
        this.tagsRepo = input.tagsRepo;
        this.definitionsRepo = input.definitionsRepo;
        this.headwordsRepo = input.headwordsRepo;
    }

    async execute( input: ImportYomichanDictionary_Input ): Promise<Dictionary> {

        const {
            dictionaryName,
            sourceLanguage,
            targetLanguage,
            tagBank,
            termBank
        } = input;        

        let dictionary = await this.dictionariesRepo.findOne({
            name: dictionaryName
        });

        if ( !dictionary ) {

            dictionary = Dictionary.create({
                name: dictionaryName,
                enabled: true,
                order: 0,
                source_language: sourceLanguage.two_letter_code,
                target_language: targetLanguage.two_letter_code,
            });

            await this.dictionariesRepo.insert(dictionary);
        }

        let dictionaryTags: DictionaryTag[] = [];

        if ( tagBank ) {
            dictionaryTags = await this.importTags({
                dictionaryId: dictionary.id,
                tagBank,
            });
        }

        if ( termBank ) {

            if ( dictionaryTags.length === 0 )
                dictionaryTags = await this.tagsRepo.getAll( dictionary.id );

            await this.importTerms({
                dictionaryId: dictionary.id,
                termBank,
                dictionaryTags,
            });
        }

        return dictionary;
    }

    private async importTags( input: ImportYomichanDictionaryTags_Input ): Promise< DictionaryTag[] > {

        const {
            dictionaryId,
            tagBank,
        } = input;

        const newTags = tagBank.map( yomichanTag => {

            return DictionaryTag.create({
                ...yomichanTag,
                dictionary_id: dictionaryId,
            });
        });

        await this.tagsRepo.insert(newTags);

        return newTags;
    }

    private async importTerms( input: ImportYomichanDictionaryTerms_Input ) {

        const {
            dictionaryId,
            termBank,
            dictionaryTags,
        } = input;        

        const tagMap = new Map< string, DictionaryTag >();
        dictionaryTags.forEach( tag => tagMap.set( tag.name, tag ) );

        const newDefinitions: DictionaryDefinition[] = [];
        
        for ( const yomichanTerm of termBank ) {

            const dictionary_headword_id = DictionaryHeadword.generateId({
                reading: yomichanTerm.reading,
                term: yomichanTerm.term
            });            

            const headwordExists = await this.headwordsRepo.exist({
                id: dictionary_headword_id
            });

            if ( !headwordExists ) {
                
                await this.headwordsRepo.insert([
                    DictionaryHeadword.create({
                        term: yomichanTerm.term,
                        reading: yomichanTerm.reading
                    })
                ]);
            }
            
            let definitionTags: DictionaryTag[] = [];

            const definitionTagNames = yomichanTerm?.definition_tags?.split(' ') || [];
            definitionTagNames.forEach( item => {             

                    const dictionaryTag = tagMap.get( item );
                    if ( !dictionaryTag ) return;

                    definitionTags.push( dictionaryTag );
                });            

            newDefinitions.push( DictionaryDefinition.create({
                ...yomichanTerm,
                dictionary_id: dictionaryId,
                dictionary_headword_id,
                tags: definitionTags,
                popularity_score: yomichanTerm.popularity,
            }));
        }
            
        await this.definitionsRepo.insert( newDefinitions );
    }
}

