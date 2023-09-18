import "reflect-metadata";
import { Registry, container_registry } from './container_registry';
import { GetSupportedLanguagesUseCase } from "../../application/use_cases/get_supported_languages/get_supported_languages.use_case";
import { RecognizeImageUseCase } from "../../application/use_cases/recognize_image/recognize_image.use_case";


container_registry.bind( Registry.RecognizeImageUseCase ).toDynamicValue( (context) => {
    return new RecognizeImageUseCase( [
        context.container.get( Registry.PpOcrAdapter ),
    ]);
}).inSingletonScope();

container_registry.bind( Registry.GetSupportedLanguagesUseCase ).toDynamicValue( (context) => {
    return new GetSupportedLanguagesUseCase( [
        context.container.get( Registry.PpOcrAdapter ),
    ]);
}).inSingletonScope();