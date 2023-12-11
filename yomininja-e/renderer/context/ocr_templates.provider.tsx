import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { OcrTemplate, OcrTemplateId, OcrTemplateJson } from "../../electron-src/@core/domain/ocr_template/ocr_template";
import { GetOcrTemplates_Input } from "../../electron-src/@core/application/use_cases/ocr_template/get_ocr_template/get_ocr_templates.use_case";
import { CreateOcrTemplate_Input } from "../../electron-src/@core/application/use_cases/ocr_template/create_ocr_template/create_ocr_template.use_case";
import { OcrTargetRegionJson } from "../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";




export type OcrTemplatesContextType = {
    ocrTemplates: OcrTemplateJson[];
    activeOcrTemplate: OcrTemplateJson | undefined;
    createOcrTemplate: ( data: CreateOcrTemplate_Input ) => Promise< OcrTemplateJson >;
    // updateOcrTemplate: ( data: OcrTemplate ) => OcrTemplateJson;
    getOcrTemplates: ( input?: GetOcrTemplates_Input ) => Promise< OcrTemplateJson[] >;
    deleteOcrTemplate: ( id: OcrTemplateId ) => Promise< void >;
    loadOcrTemplate: ( id: OcrTemplateId ) => Promise< void >;
    addTargetRegion: ( input: AddTargetRegion_Input ) => Promise< void >;
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

        console.log({ templates })
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

        console.log( activeOcrTemplate );
    }

    async function updateOcrTemplate( data: OcrTemplateJson ): Promise< OcrTemplateJson > {
        
        return await global.ipcRenderer.invoke( 'ocr_templates:update', data );
    }

    async function addTargetRegion( input: AddTargetRegion_Input ) {

        activeOcrTemplate?.target_regions.push( { ...input, id: '' });

        setActiveOcrTemplate( activeOcrTemplate );

        await updateOcrTemplate( activeOcrTemplate );
    }

    
    useEffect( () => {
        getOcrTemplates();
    }, [] );
    
    useEffect( () => {
        console.log(activeOcrTemplate);
    }, [activeOcrTemplate]);
    
    
    return (
        <OcrTemplatesContext.Provider
            value={{
                ocrTemplates,
                activeOcrTemplate,
                createOcrTemplate,
                getOcrTemplates,
                deleteOcrTemplate,
                loadOcrTemplate,
                addTargetRegion
            }}
        >
            {children}
        </OcrTemplatesContext.Provider>
    );
}