import os
import numpy as np
from typing import List, Dict, Union, Tuple
from ocr_service_pb2 import Result, Box, Vertex, TextLine, GetSupportedLanguagesResponse
from PIL import Image
import Vision
import objc
import io
from CoreFoundation import CFRunLoopStop, CFRunLoopRunInMode, kCFRunLoopDefaultMode, CFRunLoopGetCurrent
from AppKit import NSData, NSImage, NSBundle
from concurrent.futures import ProcessPoolExecutor
import multiprocessing
from io import BytesIO
import base64


class AppleVisionKitService:

    initialized = False
    executor: ProcessPoolExecutor
    results: [Result] = []

    def __init__(self, executor: ProcessPoolExecutor | None = None) :
        self.executor = executor

    def init_bundle( self ):

        if self.initialized:
            return
        
        if multiprocessing.current_process().name == 'MainProcess' and self.executor:
            self.executor.submit( init_bundle )
            return

        print('Initializing VisionKit bundle...')

        app_info = NSBundle.mainBundle().infoDictionary()
        app_info['LSBackgroundOnly'] = '1'
        objc.loadBundle(
            'VisionKit',
            globals(),
            '/System/Library/Frameworks/VisionKit.framework'
        )
        objc.registerMetaDataForSelector(
            b'VKCImageAnalyzer',
            b'processRequest:progressHandler:completionHandler:',
            {
                'arguments': {
                    3: {
                        'callable': {
                            'retval': {'type': b'v'},
                            'arguments': {
                                0: {'type': b'^v'},
                                1: {'type': b'd'},
                            }
                        }
                    },
                    4: {
                        'callable': {
                            'retval': {'type': b'v'},
                            'arguments': {
                                0: {'type': b'^v'},
                                1: {'type': b'@'},
                                2: {'type': b'@'},
                            }
                        }
                    }
                }
            }
        )
        print("The VisionKit bundle was initialized!")
        self.initialized = True

    def recognize(
        self,
        image: Image.Image,
        language_code: str
    ) -> List[ Result ]:
       
        exec = self.executor.submit(
            analyze,
            image,
            language_code
        )

        return exec.result()
    
    def analyze(
        self,
        image: Image.Image,
        language_code: str
    ):
        self.image_size = image.size
        image_buffer = io.BytesIO()
        image.save( image_buffer, format="PNG" )
        image_bytes = image_buffer.getvalue()

        ns_data = NSData.dataWithBytes_length_(
            image_bytes,
            len(image_bytes)
        )
        ns_image = NSImage.alloc().initWithData_( ns_data )

        with objc.autorelease_pool():
            analyzer = VKCImageAnalyzer.alloc().init()
            req = VKCImageAnalyzerRequest.alloc().initWithImage_requestType_( ns_image, 1 )
            req.setLocales_([ language_code ])
           
            analyzer.processRequest_progressHandler_completionHandler_(
                req,
                lambda progress: None,
                self.request_handler
            )

            CFRunLoopRunInMode( kCFRunLoopDefaultMode, 10.0, False )
            
            return self.results
    
    def request_handler(self, analysis, error ):

        results: List[ Result ] = []

        lines = analysis.allLines()
        # image_size = analysis.imageAnalysisResult().imageSize()

        if not lines:
            return results
        
        for line in lines:
            text = line.string()
            quad = line.quad()
            # print(text)
            box = self.cg_rect_to_box(
                quad,
                self.image_size,
                line.layoutDirection()
            )
            
            line = TextLine(
                box=box,
                content=text
            )

            result = Result(
                text_lines= [line],
                recognition_score= 1,
                box= box
            )

            results.append( result )

        self.results = results

        CFRunLoopStop( CFRunLoopGetCurrent() )
    
    def cg_rect_to_box(
        self,
        cg_rect,
        image_size: Tuple[ int, int ],
        layout_direction: int = 1
    ):
        
        bottom_left = self.cg_point_to_vertex(
            cg_rect.bottomLeft(),
            image_size
        )

        bottom_right = self.cg_point_to_vertex(
            cg_rect.bottomRight(),
            image_size
        )

        top_left = self.cg_point_to_vertex(
            cg_rect.topLeft(),
            image_size
        )

        top_right = self.cg_point_to_vertex(
            cg_rect.topRight(),
            image_size
        )

        if ( layout_direction == 1 ):
            return Box(
                bottom_left= bottom_left,
                bottom_right= bottom_right,
                top_left= top_left,
                top_right= top_right
            )
        
        else:
            return Box(
                bottom_left= bottom_right,
                bottom_right= top_right,
                top_left= bottom_left,
                top_right= top_left
            )


    def cg_point_to_vertex(
        self,
        cg_point,
        image_size: Tuple[ int, int ]
    ) -> Vertex:

        width, height = image_size

        x = cg_point.x * width
        y = cg_point.y * height

        return Vertex(
            x= round(x),
            y= round(y)
        )

    def get_supported_languages( self ) -> List[ str ]:

        with objc.autorelease_pool():
        
            request = Vision.VNRecognizeTextRequest.alloc().init()
            
            return request.supportedRecognitionLanguagesAndReturnError_(None)[0]


vkService = AppleVisionKitService()

def init_bundle():
    vkService.init_bundle()

def analyze( image: Image.Image, language_code: str ):
    vkService.init_bundle()
    return vkService.analyze( image, language_code )