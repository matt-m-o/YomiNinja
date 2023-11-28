import { BrowserExtensionsController } from "./browser_extensions.controller";
import { BrowserExtensionsService } from "./browser_extensions.service";


const browserExtensionsService = new BrowserExtensionsService();

export const browserExtensionsController = new BrowserExtensionsController({
    browserExtensionsService
});