import { DetectMotion_Input, DetectMotion_Output, VideoAnalyzerAdapter, VideoAnalyzerStatus } from "../../../application/adapters/video_analyzer.adapter";
import { pyOcrService } from "../py_ocr_service/_temp_index";


export class PyVideoAnalyzerAdapter implements VideoAnalyzerAdapter {

    status: VideoAnalyzerStatus = VideoAnalyzerStatus.Enabled;

    async detectMotion(input: DetectMotion_Input): Promise< DetectMotion_Output> {

        const result = await pyOcrService.motionDetection({
            frame: input.videoFrame,
            stream_id: input.streamId,
            stream_length: input.frameSampleSize || 8
        });

        return {
            motionPixelsCount: result,
        };
    }


}