import { get_CreateBrowserExtensionUseCase, get_GetBrowserExtensionsUseCase, get_UpdateBrowserExtensionUseCase } from "../@core/infra/container_registry/use_cases_registry";
import { EXTENSIONS_DIR } from "../util/directories.util";
import { BrowserExtensionManager } from "./browser_extension_manager/browser_extension_manager";
import { BrowserExtensionsController } from "./browser_extensions.controller";
import { BrowserExtensionsService } from "./browser_extensions.service";

const browserExtensionManager = new BrowserExtensionManager({
    extensionsPath: EXTENSIONS_DIR
});

const browserExtensionsService = new BrowserExtensionsService({
    browserExtensionManager,
    createBrowserExtensionUseCase: get_CreateBrowserExtensionUseCase(),
    updateBrowserExtensionUseCase: get_UpdateBrowserExtensionUseCase(),
    getBrowserExtensionsUseCase: get_GetBrowserExtensionsUseCase(),
});

export const browserExtensionsController = new BrowserExtensionsController({
    browserExtensionsService
});