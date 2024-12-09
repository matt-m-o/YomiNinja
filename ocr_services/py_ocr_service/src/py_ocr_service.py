import sys
sys.path.insert(0, '.')
import threading
from concurrent import futures
import logging
import grpc
import os
from ocr_service_pb2 import Result
import ocr_service_pb2 as service_pb
import ocr_service_pb2_grpc as service_grpc
import time
from multiprocessing import freeze_support

IS_MAC_OS = sys.platform == 'darwin'

try:
    from manga_ocr_service.manga_ocr_service import MangaOcrService
except ImportError:
    print('MangaOcrService ImportError')
    pass

if IS_MAC_OS:
    from apple_vision_service.apple_vision_service import AppleVisionService
    from apple_vision_service.apple_vision_kit_service import AppleVisionKitService

from motion_detection_service.motion_detection_service import MotionDetectionService

import base64
from io import BytesIO
from PIL import Image
import numpy as np
from typing import List
from concurrent.futures import ProcessPoolExecutor


class Service( service_grpc.OCRServiceServicer ):

    server = None
    processing = False
    keep_alive_timeout_seconds = 60

    manga_ocr_service = None
    apple_vision_service = None
    apple_vision_kit_service = None
    motion_detection_service = MotionDetectionService()

    if 'torch' in sys.modules:
        manga_ocr_service = MangaOcrService()

    def __init__(self, server, executor: ProcessPoolExecutor = None, keep_alive_timeout_seconds = 60 ):
        self.server = server
        self.last_rpc_time = time.time()
        self.keep_alive_timeout_seconds = keep_alive_timeout_seconds
        self.executor = executor

        if IS_MAC_OS:
            self.apple_vision_service = AppleVisionService()
            self.apple_vision_kit_service = AppleVisionKitService( executor )
            self.apple_vision_kit_service.init_bundle()

    def timeout_check(self):
        while True:
            time.sleep(5)
            if not self.processing and time.time() - self.last_rpc_time > self.keep_alive_timeout_seconds:
                break # Terminate the server
        self.server.stop(0)

    def KeepAlive( self, request: service_pb.KeepAliveRequest, context ):
        self.last_rpc_time = time.time()

        self.keep_alive_timeout_seconds = request.timeout_seconds
        if not request.keep_alive:
            self.server.stop(0)

        return service_pb.KeepAliveResponse()

    def RecognizeBase64( self, request: service_pb.RecognizeBase64Request, context ):
        self.last_rpc_time = time.time()

        image = self.base64ToPILImage(request.base64_image )

        return self.HandleRecognizeRequest( image, request )
    
    def RecognizeBytes( self, request: service_pb.RecognizeBytesRequest, context ):
        self.last_rpc_time = time.time()

        image = self.bytesToPILImage( request.image_bytes )

        return self.HandleRecognizeRequest( image, request )
        
    
    def HandleRecognizeRequest( self, image: Image.Image, request: service_pb.RecognizeBase64Request ) -> service_pb.RecognizeDefaultResponse :

        self.processing = True

        results: List[Result] = []

        try:
            match request.ocr_engine:
                case 'MangaOCR':
                    results = self.manga_ocr_service.recognize(
                        np.array( image ),
                        request.boxes
                    )

                case 'AppleVision':
                    results = self.apple_vision_service.recognize(
                        image,
                        request.language_code
                    )
                
                case 'AppleVisionKit':
                    results = self.apple_vision_kit_service.recognize(
                        image,
                        request.language_code
                    )
                    
                case _:
                    results = MangaOcrService(self.manga_ocr_service).recognize(
                        np.array( image ),
                        request.boxes
                    )
                    print(f'{request.ocr_engine} is not supported')

        except Exception as error:
            print(error)

        self.processing = False

        return service_pb.RecognizeDefaultResponse(
            context_resolution={
                'width': image.width,
                'height': image.height
            },
            id=request.id,
            results=results
        )
    
    def GetSupportedLanguages(self, request: service_pb.GetSupportedLanguagesRequest, context):
        self.last_rpc_time = time.time()

        language_codes: List[ str ] = []

        match request.ocr_engine:
            case 'MangaOCR':
                language_codes.append( 'ja-JP' )

            case 'AppleVision':
                language_codes = self.apple_vision_service.getSupportedLanguages()
            
            case 'AppleVisionKit':
                language_codes = self.apple_vision_kit_service.get_supported_languages()
                
            case _:
                print(f'{request.ocr_engine} is not supported')


        return service_pb.GetSupportedLanguagesResponse(
            language_codes= language_codes
        )

    def GetSupportedModels(self, request: service_pb.GetSupportedModelsRequest, context):
        self.last_rpc_time = time.time()

        models = []

        match request.ocr_engine:
            case 'MangaOCR':
                models = self.manga_ocr_service.get_supported_models()

            case 'AppleVision':
                pass # models = self.apple_vision_service.get_supported_models()
            
            case 'AppleVisionKit':
                pass # models = self.apple_vision_kit_service.get_supported_models()
                
            case _:
                print(f'{request.ocr_engine} is not supported')


        return service_pb.GetSupportedModelsResponse(
            models = models
        )
    
    def InstallModel(self, request: service_pb.InstallModelRequest, context):
        self.last_rpc_time = time.time()

        success = False

        match request.ocr_engine:
            case 'MangaOCR':
                success = self.manga_ocr_service.install_model( request.model_name )

            case 'AppleVision':
                pass # models = self.apple_vision_service.install_model()
            
            case 'AppleVisionKit':
                pass # models = self.apple_vision_kit_service.install_model()
                
            case _:
                print(f'{request.ocr_engine} is not supported')


        return service_pb.InstallModelResponse(
            success = success
        )
        

    def MotionDetection(self, request: service_pb.MotionDetectionRequest, context):
        
        result = self.motion_detection_service.detect(
            request.stream_id,
            frame= self.bytesToPILImage( request.frame ),
            threshold_min= request.threshold_min,
            threshold_max= request.threshold_max,
            stream_length= request.stream_length,
        )

        return result
    
    def base64ToPILImage( self, base64_data: str ) -> Image.Image:
        image_data = base64.b64decode( base64_data )
        return Image.open( BytesIO(image_data) )

    def bytesToPILImage( self, bytes_data: bytes ) -> Image.Image:
        buffer = BytesIO(bytes_data)
        return Image.open(buffer)


def serve( port: str = '23456', executor: ProcessPoolExecutor = None ):

    server = grpc.server( futures.ThreadPoolExecutor( max_workers=10 ) )

    servicer = Service( server, executor )
    service_grpc.add_OCRServiceServicer_to_server( servicer, server )

    server.add_insecure_port("[::]:" + port)
    server.start()

    server_data = { "server_address": f"0.0.0.0:{port}" }

    server_info = f'[INFO-JSON]:{server_data}'
    print( server_info.replace("'", '"') )

    # Start the timeout check in a new thread
    timeout_thread = threading.Thread(target=servicer.timeout_check)
    timeout_thread.start()

    server.wait_for_termination()


if __name__ == "__main__":
    freeze_support()
    logging.basicConfig()

    server_port = '33456'

    if len(sys.argv) > 1:
        server_port = sys.argv[1]

    if IS_MAC_OS:
        with ProcessPoolExecutor( max_workers= 1 ) as executor:
            serve( server_port, executor )
            executor.shutdown()
    else:
        serve( server_port )