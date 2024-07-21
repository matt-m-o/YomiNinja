import os
import numpy as np
from typing import List, Dict, Union, Tuple
from ocr_service_pb2 import Result, Box, Vertex, GetSupportedLanguagesResponse
from PIL import Image
import Vision
import objc
import io


class AppleVisionService:

    # OCR pipeline ( detect -> crop -> recognize )
    def recognize(
        self,
        image: Image.Image,
        language_code: str
    ) -> List[ Result ]:
       
        buffer = io.BytesIO()
        image.save( buffer, format="PNG" )
        image_bytes = buffer.getvalue()

        results: List[ Result ] = []

        with objc.autorelease_pool():

            request = Vision.VNRecognizeTextRequest.alloc().init()

            request.setRecognitionLevel_(0)
            request.setRecognitionLanguages_( language_code )

            handler = Vision.VNImageRequestHandler.alloc().initWithData_options_(
                image_bytes,
                None
            )

            success = handler.performRequests_error_( [request], None )
        
            if success:
                for visionResult in request.results():

                    result = Result(
                        text= visionResult.text(),
                        recognition_score= visionResult.confidence(),
                        box= self.CGRectToBox( visionResult, image.size )
                    )

                    results.append( result )

        return results
    
    def CGRectToBox( self, cg_rect, image_size: Tuple[ int, int ] ):

        bottom_left = self.CGPointToVertex(
            cg_rect.bottomLeft(),
            image_size
        )

        bottom_right = self.CGPointToVertex(
            cg_rect.bottomRight(),
            image_size
        )

        top_left = self.CGPointToVertex(
            cg_rect.topLeft(),
            image_size
        )

        top_right = self.CGPointToVertex(
            cg_rect.topRight(),
            image_size
        )

        return Box(
            bottom_left= bottom_left,
            bottom_right= bottom_right,
            top_left= top_left,
            top_right= top_right
        )


    def CGPointToVertex( self, cg_point, image_size: Tuple[ int, int ] ) -> Vertex:

        width, height = image_size

        x = cg_point.x * width
        y = ( 1 - cg_point.y ) * height

        return Vertex(
            x= round(x),
            y= round(y)
        )

    def getSupportedLanguages( self ) -> List[ str ]:

        with objc.autorelease_pool():
        
            request = Vision.VNRecognizeTextRequest.alloc().init()
            
            return request.supportedRecognitionLanguagesAndReturnError_(None)[0]