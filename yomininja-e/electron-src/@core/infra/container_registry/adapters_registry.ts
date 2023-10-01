import "reflect-metadata";
import { Registry, container_registry } from './container_registry';
import { PpOcrAdapter } from '../ppocr.adapter/ppocr.adapter';
import { SharpImageProcessingAdapter } from "../sharp_image_process.adapter/sharp_image_process.adapter";


container_registry.bind( Registry.PpOcrAdapter ).toDynamicValue( (context) => {
    return new PpOcrAdapter();
}).inSingletonScope();

container_registry.bind( Registry.SharpImageProcessingAdapter ).toDynamicValue( (context) => {
    return new SharpImageProcessingAdapter();
}).inSingletonScope();


export function get_PpOcrAdapter(): PpOcrAdapter {
    return container_registry.get< PpOcrAdapter >( Registry.PpOcrAdapter )
}

export function get_SharpImageProcessingAdapter(): SharpImageProcessingAdapter {
    return container_registry.get< SharpImageProcessingAdapter >( Registry.SharpImageProcessingAdapter )
}