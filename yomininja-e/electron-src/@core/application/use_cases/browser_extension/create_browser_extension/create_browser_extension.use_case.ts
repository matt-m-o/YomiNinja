import { BrowserExtension, BrowserExtensionJson } from "../../../../domain/browser_extension/browser_extension";
import { BrowserExtensionRepository } from "../../../../domain/browser_extension/browser_extension.repository";



export interface CreateBrowserExtension_Input extends BrowserExtensionJson {};

export class CreateBrowserExtensionUseCase {

    public extensionsRepo: BrowserExtensionRepository;

    constructor( input: {
        extensionsRepo: BrowserExtensionRepository,
    }) {
        this.extensionsRepo = input.extensionsRepo;
    }

    async execute( input: CreateBrowserExtension_Input ): Promise< BrowserExtension > {

        const foundExtension = await this.extensionsRepo.findOne({
            id: input.id
        });

        if ( foundExtension )
            return foundExtension;

        const extension = BrowserExtension.create({
            ...input,
        });

        await this.extensionsRepo.insert( extension );

        return extension;
    }
}