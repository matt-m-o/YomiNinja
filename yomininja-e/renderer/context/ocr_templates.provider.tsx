import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { OcrTemplate, OcrTemplateId, OcrTemplateJson } from "../../electron-src/@core/domain/ocr_template/ocr_template";
import { GetOcrTemplates_Input } from "../../electron-src/@core/application/use_cases/ocr_template/get_ocr_template/get_ocr_templates.use_case";
import { CreateOcrTemplate_Input } from "../../electron-src/@core/application/use_cases/ocr_template/create_ocr_template/create_ocr_template.use_case";
import { OcrTargetRegion, OcrTargetRegionId, OcrTargetRegionJson } from "../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";




export type OcrTemplatesContextType = {
    ocrTemplates: OcrTemplateJson[];
    activeOcrTemplate: OcrTemplateJson | undefined;
    createOcrTemplate: ( data: CreateOcrTemplate_Input ) => Promise< OcrTemplateJson >;
    updateOcrTemplate: ( data: OcrTemplateJson ) => Promise< OcrTemplateJson >;
    getOcrTemplates: ( input?: GetOcrTemplates_Input ) => Promise< OcrTemplateJson[] >;
    deleteOcrTemplate: ( id: OcrTemplateId ) => Promise< void >;
    loadOcrTemplate: ( id: OcrTemplateId ) => Promise< void >;
    unloadOcrTemplate: () => void;
    addTargetRegion: ( input: AddTargetRegion_Input ) => Promise< void >;
    removeTargetRegion: ( id: OcrTargetRegionId ) => void;
    updateTargetRegion: ( input: OcrTargetRegionJson ) => Promise< void >;
    // saveOcrTemplate: () => Promise< void >;
};

export interface AddTargetRegion_Input extends Omit< OcrTargetRegionJson,'id' > {};

export const OcrTemplatesContext = createContext( {} as OcrTemplatesContextType );


export const OcrTemplatesProvider = ( { children }: PropsWithChildren ) => {
        
    const [ ocrTemplates, setOcrTemplates ] = useState< OcrTemplateJson[] >();
    const [ activeOcrTemplate, setActiveOcrTemplate ] = useState< OcrTemplateJson | null >();
    

    async function createOcrTemplate( data: CreateOcrTemplate_Input ): Promise< OcrTemplateJson > {

        const template = await global.ipcRenderer.invoke( 'ocr_templates:create', data );

        await getOcrTemplates();

        return template;
    }

    async function getOcrTemplates( input?: GetOcrTemplates_Input ) {

        const templates = await global.ipcRenderer.invoke( 'ocr_templates:get', input );
        // console.log({ templates })
        setOcrTemplates( templates );

        const activeTemplate = await global.ipcRenderer.invoke( 'ocr_templates:get_active' );
        // console.log({ activeTemplate });
        setActiveOcrTemplate( activeTemplate );

        return templates;
    }

    async function deleteOcrTemplate( id: OcrTemplateId ) {

        await global.ipcRenderer.invoke( 'ocr_templates:delete', id );

        if ( id === activeOcrTemplate?.id )
            loadOcrTemplate( null );

        setOcrTemplates( ocrTemplates.filter( item => item.id !== id ) );
    }

    async function loadOcrTemplate( id: OcrTemplateId | null ) {

        const template = await global.ipcRenderer.invoke( 'ocr_templates:change_active', id );

        if ( id )
            setActiveOcrTemplate( template );

        else
            setActiveOcrTemplate( null );

        // console.log( activeOcrTemplate );
    }

    function unloadOcrTemplate() {
        loadOcrTemplate( null );
    }

    async function updateOcrTemplate( data: OcrTemplateJson ): Promise< OcrTemplateJson > {

        // console.log( data );

        const result = await global.ipcRenderer.invoke( 'ocr_templates:update', data );
        // console.log( result );

        if ( result ) {
            setOcrTemplates(
                ocrTemplates.map( item => {
                    if ( item.id !== result.id )
                        return item;

                    return result;
                }) 
            );
        }
        
        return result;
    }

    async function addTargetRegion( input: AddTargetRegion_Input ) {

        if ( !activeOcrTemplate ) return;

        activeOcrTemplate.target_regions = [
            ...activeOcrTemplate?.target_regions,
            { ...input, id: '' }
        ];
        
        const updatedOcrTemplate = await updateOcrTemplate( activeOcrTemplate );
        setActiveOcrTemplate( updatedOcrTemplate );
    }

    async function removeTargetRegion( id: OcrTargetRegionId ) {

        if ( !activeOcrTemplate ) return;

        activeOcrTemplate.target_regions = activeOcrTemplate.target_regions
            .filter( region => region.id !== id );

        const updatedOcrTemplate = await updateOcrTemplate( activeOcrTemplate );
        setActiveOcrTemplate( updatedOcrTemplate );
    }

    async function updateTargetRegion( data: OcrTargetRegionJson ) {

        // console.log( data );
        
        activeOcrTemplate.target_regions = activeOcrTemplate.target_regions.map( item => {

            if ( item?.id !== data.id )
                return item;
        
            return {
                ...data,
                size: {
                    width: data.size.width || item.size.width,
                    height: data.size.height || item.size.height,
                },
                auto_ocr_options: {
                    ...item.auto_ocr_options,
                    ...data.auto_ocr_options,
                },
                text_to_speech_options: {
                    ...item.text_to_speech_options,
                    ...data.text_to_speech_options,
                }
            };
        });
    
        const updatedOcrTemplate = await updateOcrTemplate( activeOcrTemplate );
        setActiveOcrTemplate( updatedOcrTemplate );

        setOcrTemplates(
            ocrTemplates.map( item => {

                if ( item.id !== updatedOcrTemplate.id )
                    return item;

                return updatedOcrTemplate;
            })
        );
    }

    function handleActiveOcrTemplateChange( event, template: OcrTemplateJson | null ) {
        console.log( template );
        setActiveOcrTemplate( template );
    }
    
    useEffect( () => {

        getOcrTemplates();

        global.ipcRenderer.on( 'ocr_templates:active_template', handleActiveOcrTemplateChange );

        return () => {
            global.ipcRenderer.removeAllListeners( 'ocr_templates:active_template' );
        };

    }, [] );
    
    useEffect( () => {
        // console.log( activeOcrTemplate );
    }, [ activeOcrTemplate ]);
    
    
    return (
        <OcrTemplatesContext.Provider
            value={{
                ocrTemplates,
                activeOcrTemplate,
                createOcrTemplate,
                updateOcrTemplate,
                getOcrTemplates,
                deleteOcrTemplate,
                loadOcrTemplate,
                unloadOcrTemplate,
                addTargetRegion,
                removeTargetRegion,
                updateTargetRegion,
            }}
        >
            {children}
        </OcrTemplatesContext.Provider>
    );
}