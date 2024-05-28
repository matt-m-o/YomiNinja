import { BrowserExtension, BrowserExtensionJson } from "../../../../domain/browser_extension/browser_extension";
import { BrowserExtensionRepository } from "../../../../domain/browser_extension/browser_extension.repository";



export class GetBrowserExtensionsUseCase {

    public extensionsRepo: BrowserExtensionRepository;

    constructor( input: {
        extensionsRepo: BrowserExtensionRepository,
    }) {
        this.extensionsRepo = input.extensionsRepo;
    }

    async execute(): Promise< BrowserExtension[] > {

        const extensions = await this.extensionsRepo.getAll();

        return extensions;
    }
}