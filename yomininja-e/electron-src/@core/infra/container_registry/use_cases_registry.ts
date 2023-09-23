import "reflect-metadata";
import { Registry, container_registry } from './container_registry';
import { GetSupportedLanguagesUseCase } from "../../application/use_cases/get_supported_languages/get_supported_languages.use_case";
import { RecognizeImageUseCase } from "../../application/use_cases/recognize_image/recognize_image.use_case";


container_registry.bind( Registry.RecognizeImageUseCase ).toDynamicValue( (context) => {
    return new RecognizeImageUseCase(
        [
            context.container.get( Registry.PpOcrAdapter ),
        ],
        context.container.get( Registry.SettingsPresetInMemoryRepository ),
    );
}).inSingletonScope();

container_registry.bind( Registry.GetSupportedLanguagesUseCase ).toDynamicValue( (context) => {
    return new GetSupportedLanguagesUseCase( [
        context.container.get( Registry.PpOcrAdapter ),
    ]);
}).inSingletonScope();




export function get_RecognizeImageUseCase(): RecognizeImageUseCase {
    return container_registry.get< RecognizeImageUseCase >( Registry.RecognizeImageUseCase )
}

export function get_GetSupportedLanguagesUseCase(): GetSupportedLanguagesUseCase {    
    return container_registry.get< GetSupportedLanguagesUseCase >( Registry.GetSupportedLanguagesUseCase );
}