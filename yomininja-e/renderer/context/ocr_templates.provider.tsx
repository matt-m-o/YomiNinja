import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { OcrTemplate } from "../../electron-src/@core/domain/ocr_template/ocr_template";
import { GetOcrTemplates_Input } from "../../electron-src/@core/application/use_cases/ocr_template/get_ocr_template/get_ocr_templates.use_case";
import { OcrTemplateId } from "../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";



export type OcrTemplatesContextType = {
    ocrTemplates: OcrTemplate[];
    // activeOcrTemplate: OcrTemplate;
    createOcrTemplate: ( ocrTemplate: OcrTemplate ) => Promise<void>;
    // updateOcrTemplate: ( ocrTemplate: OcrTemplate ) => void;
    getOcrTemplates: ( input?: GetOcrTemplates_Input ) => Promise< OcrTemplate[] >;
    // deleteOcrTemplate: ( id: OcrTemplateId ) => Promise< void >;
};

export const OcrTemplatesContext = createContext( {} as OcrTemplatesContextType );


export const OcrTemplatesProvider = ( { children }: PropsWithChildren ) => {
        
    const [ ocrTemplates, setOcrTemplates ] = useState< OcrTemplate[] >();
    // const [ activeOcrTemplate, setActiveOcrTemplate ] = useState< OcrTemplate >();
    

    async function createOcrTemplate( ocrTemplate: OcrTemplate ) {

        await global.ipcRenderer.invoke( 'ocr_templates:create', ocrTemplate );
    }

    async function getOcrTemplates( input?: GetOcrTemplates_Input ) {

        const templates = await global.ipcRenderer.invoke( 'ocr_templates:get', input );

        console.log({ templates })
        setOcrTemplates( templates );

        return templates;
    }

    
    useEffect( () => {
        getOcrTemplates();
    }, [] );
    
    
    
    return (
        <OcrTemplatesContext.Provider
            value={{
                ocrTemplates,
                createOcrTemplate,
                getOcrTemplates
            }}
        >
            {children}
        </OcrTemplatesContext.Provider>
    );
}