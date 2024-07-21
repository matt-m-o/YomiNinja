import { OcrTemplate } from "../@core/domain/ocr_template/ocr_template";
import { AppEventEmitter } from "../app/app.event_emitter";

export type OcrTemplatesEventMap  = {
    'active_template': OcrTemplate | null;
};

export class OcrTemplatesEvents extends AppEventEmitter< OcrTemplatesEventMap > {}