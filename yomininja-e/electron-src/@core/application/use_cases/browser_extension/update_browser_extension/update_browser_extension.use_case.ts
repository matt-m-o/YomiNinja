import { BrowserExtension, BrowserExtensionJson } from "../../../../domain/browser_extension/browser_extension";
import { BrowserExtensionRepository } from "../../../../domain/browser_extension/browser_extension.repository";



export interface UpdateBrowserExtension_Input extends BrowserExtensionJson {};

export class UpdateBrowserExtensionUseCase {

    public extensionsRepo: BrowserExtensionRepository;

    constructor( input: {
        extensionsRepo: BrowserExtensionRepository,
    }) {
        this.extensionsRepo = input.extensionsRepo;
    }

    async execute( input: UpdateBrowserExtension_Input ): Promise< BrowserExtension | undefined > {

        const foundExtension = await this.extensionsRepo.findOne({
            id: input.id
        });

        if ( !foundExtension ) {
            console.log(`ocr template not found: ${input.id}`);
            return;
        }

        foundExtension.name = input.name;

        if ( input?.description !== undefined )
            foundExtension.description = input.description;

        foundExtension.icon = input.icon;
        foundExtension.version = input.version;
        foundExtension.optionsUrl = input.optionsUrl;

        if ( input?.enabled !== undefined )
            foundExtension.enabled = input.enabled;

        
        await this.extensionsRepo.update( foundExtension );

        return foundExtension;
    }
}