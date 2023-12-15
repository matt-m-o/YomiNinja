import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { OcrTemplate, OcrTemplateId, OcrTemplateJson } from "../../electron-src/@core/domain/ocr_template/ocr_template";
import { GetOcrTemplates_Input } from "../../electron-src/@core/application/use_cases/ocr_template/get_ocr_template/get_ocr_templates.use_case";
import { CreateOcrTemplate_Input } from "../../electron-src/@core/application/use_cases/ocr_template/create_ocr_template/create_ocr_template.use_case";
import { OcrTargetRegion, OcrTargetRegionId, OcrTargetRegionJson } from "../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";




export type OcrTemplatesContextType = {
    ocrTemplates: OcrTemplateJson[];
    activeOcrTemplate: OcrTemplateJson | undefined;
    createOcrTemplate: ( data: CreateOcrTemplate_Input ) => Promise< OcrTemplateJson >;
    // updateOcrTemplate: ( data: OcrTemplateJson ) => Promise< OcrTemplateJson >;
    getOcrTemplates: ( input?: GetOcrTemplates_Input ) => Promise< OcrTemplateJson[] >;
    deleteOcrTemplate: ( id: OcrTemplateId ) => Promise< void >;
    loadOcrTemplate: ( id: OcrTemplateId ) => Promise< void >;
    addTargetRegion: ( input: AddTargetRegion_Input ) => Promise< void >;
    removeTargetRegion: ( id: OcrTargetRegionId ) => void;
    updateTargetRegion:  ( input: OcrTargetRegionJson ) => Promise< void >;
    // saveOcrTemplate: () => Promise< void >;
};

export interface AddTargetRegion_Input extends Omit< OcrTargetRegionJson,'id' > {};

export const OcrTemplatesContext = createContext( {} as OcrTemplatesContextType );


export const OcrTemplatesProvider = ( { children }: PropsWithChildren ) => {
        
    const [ ocrTemplates, setOcrTemplates ] = useState< OcrTemplateJson[] >();
    const [ activeOcrTemplate, setActiveOcrTemplate ] = useState< OcrTemplateJson | undefined >();
    

    async function createOcrTemplate( data: CreateOcrTemplate_Input ): Promise< OcrTemplateJson > {

        return await global.ipcRenderer.invoke( 'ocr_templates:create', data );
    }

    async function getOcrTemplates( input?: GetOcrTemplates_Input ) {

        const templates = await global.ipcRenderer.invoke( 'ocr_templates:get', input );
        // console.log({ templates })
        setOcrTemplates( templates );

        return templates;
    }

    async function deleteOcrTemplate( id: OcrTemplateId ) {

        await global.ipcRenderer.invoke( 'ocr_templates:delete', id );

        setOcrTemplates( ocrTemplates.filter( item => item.id !== id ) );
    }

    async function loadOcrTemplate( id: OcrTemplateId ) {

        // await global.ipcRenderer.invoke( 'ocr_templates:load', id );

        setActiveOcrTemplate( ocrTemplates.find( item => item.id === id ) );

        // console.log( activeOcrTemplate );
    }

    async function updateOcrTemplate( data: OcrTemplateJson ): Promise< OcrTemplateJson > {

        // console.log( data );

        const result = await global.ipcRenderer.invoke( 'ocr_templates:update', data );
        // console.log( result );

        if ( result ) {
            ocrTemplates.find( item => {

                if ( item.id !== result.id )
                    return;

                item = result;

                return true;
            });

            setOcrTemplates( ocrTemplates );
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
            };
        });
    
        const updatedOcrTemplate = await updateOcrTemplate( activeOcrTemplate );
        setActiveOcrTemplate( updatedOcrTemplate );   
    }
    
    useEffect( () => {
        getOcrTemplates();
    }, [] );
    
    useEffect( () => {
        console.log(activeOcrTemplate);
    }, [ activeOcrTemplate ]);
    
    
    return (
        <OcrTemplatesContext.Provider
            value={{
                ocrTemplates,
                activeOcrTemplate,
                createOcrTemplate,
                getOcrTemplates,
                deleteOcrTemplate,
                loadOcrTemplate,
                addTargetRegion,
                removeTargetRegion,
                updateTargetRegion,
            }}
        >
            {children}
        </OcrTemplatesContext.Provider>
    );
}