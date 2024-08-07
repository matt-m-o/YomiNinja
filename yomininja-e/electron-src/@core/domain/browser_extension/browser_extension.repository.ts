import { BrowserExtension, BrowserExtensionId } from "./browser_extension";



export type BrowserExtensionFindOneInput = {
    id: string;
}

export interface BrowserExtensionRepository {

    insert( extension: BrowserExtension ): Promise< void >;    

    findOne( input: BrowserExtensionFindOneInput ): Promise< BrowserExtension | null >;

    getAll(): Promise< BrowserExtension[] >;

    update( extension: BrowserExtension ): Promise< void >;

    delete( id: BrowserExtensionId ): Promise< void >; 
}