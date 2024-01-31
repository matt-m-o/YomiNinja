import { EXTENSIONS_DIR } from "../util/directories.util";
import { BrowserExtensionManager } from "./browser_extension_manager/browser_extension_manager";
import { BrowserExtensionsController } from "./browser_extensions.controller";
import { BrowserExtensionsService } from "./browser_extensions.service";

const browserExtensionManager = new BrowserExtensionManager({
    extensionsPath: EXTENSIONS_DIR
});

const browserExtensionsService = new BrowserExtensionsService({
    browserExtensionManager
});

export const browserExtensionsController = new BrowserExtensionsController({
    browserExtensionsService
});