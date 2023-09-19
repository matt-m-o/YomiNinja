import "reflect-metadata";
import { Registry, container_registry } from './container_registry';
import { PpOcrAdapter } from '../ppocr.adapter/ppocr.adapter';


container_registry.bind( Registry.PpOcrAdapter ).toDynamicValue( (context) => {
    return new PpOcrAdapter();
}).inSingletonScope();



export function get_PpOcrAdapter(): PpOcrAdapter {
    return container_registry.get< PpOcrAdapter >( Registry.PpOcrAdapter )
}