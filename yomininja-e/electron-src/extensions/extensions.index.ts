import isDev from "electron-is-dev";
import { get_CreateBrowserExtensionUseCase, get_GetBrowserExtensionsUseCase, get_UpdateBrowserExtensionUseCase } from "../@core/infra/container_registry/use_cases_registry";
import { BUILTIN_EXTENSIONS_DIR, USER_EXTENSIONS_DIR } from "../util/directories.util";
import { BrowserExtensionManager } from "./browser_extension_manager/browser_extension_manager";
import { BrowserExtensionsController } from "./browser_extensions.controller";
import { BrowserExtensionsService } from "./browser_extensions.service";

const browserExtensionManager = new BrowserExtensionManager({
    userExtensionsPath: USER_EXTENSIONS_DIR,
    builtinExtensionsPath: BUILTIN_EXTENSIONS_DIR,
    isDev
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