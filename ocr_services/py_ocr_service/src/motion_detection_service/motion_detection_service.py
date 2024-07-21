from typing import List, Dict
from PIL import Image
import cv2
import numpy as np
from ocr_service_pb2 import MotionDetectionResponse

class MotionDetectionService:

    streams: Dict[ str, List[any] ] = {} # List[ Matlike ]
    scaling_factor = 0.9

    def detect(
        self,
        stream_id: str,
        frame: Image.Image,
        threshold_min: int = 127,
        threshold_max: int = 255,
        stream_length: int = 5,
        clear_previous_frames= False
    ) -> MotionDetectionResponse :
        
        result = MotionDetectionResponse(
            frame_diff_sum= 0,
            frame_threshold_non_zero_count= 0
        )

        if clear_previous_frames:
            self.deleteStream( stream_id )

        next_frame = self.preprocessFrame( frame )

        stream = self.getStream( stream_id )

        if len(stream) and next_frame.shape != self.getStreamShape( stream_id ):
            self.deleteStream( stream_id )
            return result

        if not stream or not len(stream):
            self.updateStream( stream_id, next_frame )
            return result

        background_frame = self.medianImage( stream )

        # if background_frame.shape != next_frame.shape:
        #     self.deleteStream( stream_id )
        #     return result

        frame_difference = self.frameDiff( background_frame, next_frame )

        _, frame_th = cv2.threshold( frame_difference, threshold_min, threshold_max, cv2.THRESH_BINARY ) # + cv2.THRESH_OTSU

        # cv2.imshow("Movement", frame_difference)
        # cv2.imshow("Foreground", frame_th)
        # cv2.imshow("Background", background_frame)

        #cv2.imshow("Previous", prev_frame)
        #cv2.imshow("Next", next_frame)

        self.updateStream( stream_id, next_frame )

        while len(stream) > stream_length:
            stream.pop(0)

        result.frame_diff_sum = frame_difference.sum()
        result.frame_threshold_non_zero_count = cv2.countNonZero(frame_th)

        return result # cv2.countNonZero(frame_th) # frame_th.sum() #frame_difference.sum()

    def preprocessFrame( self, frame: Image.Image ): # Matlike

        frame = cv2.resize(
            np.array(frame),
            None,
            fx= self.scaling_factor,
            fy= self.scaling_factor,
            interpolation= cv2.INTER_AREA
        )
    
        return cv2.cvtColor( frame, cv2.COLOR_RGB2GRAY )

    def frameDiff( self, prev_frame, next_frame ):
        return cv2.absdiff( prev_frame, next_frame )
    
    def medianImage( self, images ):
        stacked_images = np.stack( images, axis=0 )
        return np.median( stacked_images, axis=0 ).astype(np.uint8)
    
    def getStream(self, stream_id: str) -> List[ any ] :
        if not self.streamExists(stream_id):
            return []
        return self.streams[stream_id]
    
    def updateStream(self, stream_id: str, new_frame):
        if not self.streamExists( stream_id ):
            self.streams[stream_id] = [ new_frame ]
            return
        self.streams[stream_id].append( new_frame )

    def deleteStream(self, stream_id):
        if not self.streamExists( stream_id ):
            return
        del self.streams[stream_id]
        # self.streams[stream_id] = []

    def streamExists(self, stream_id: str) -> bool:
        return stream_id in self.streams
    
    def getStreamShape(self, stream_id: str) -> tuple[int, int]: # height, width
        stream = self.getStream( stream_id )
        return stream[0].shape