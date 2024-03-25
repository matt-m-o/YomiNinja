import threading
from concurrent import futures
import logging
import grpc
from ocr_service_pb2 import Result
import ocr_service_pb2 as service_pb
import ocr_service_pb2_grpc as service_grpc
import sys
import time

isMacOs = False

try:
    from manga_ocr_service.manga_ocr_service import MangaOcrService
except ImportError:
    pass

if sys.platform == 'darwin':
    isMacOs = True
    from apple_vision_service.apple_vision_service import AppleVisionService

import base64
from io import BytesIO
from PIL import Image
import numpy as np
from typing import List


class Service( service_grpc.OCRServiceServicer ):

    manga_ocr_service = None
    apple_vision_service = None
    server = None
    keep_alive_timeout_seconds = 30
    processing = False

    if 'torch' in sys.modules:
        manga_ocr_service = MangaOcrService()

    if isMacOs:
        apple_vision_service = AppleVisionService()


    def __init__(self, server, keep_alive_timeout_seconds = 30):
        self.server = server
        self.last_rpc_time = time.time()

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

        image_data = base64.b64decode( request.base64_image )
        image = Image.open( BytesIO(image_data) )

        results: List[Result] = []

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
                
            case _:
                results = MangaOcrService(self.manga_ocr_service).recognize(
                    np.array( image ),
                    request.boxes
                )
                print(f'{request.ocr_engine} is not supported')


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
                language_codes.append( 'ja' )

            case 'AppleVision':
                language_codes = self.apple_vision_service.getSupportedLanguages()
                
            case _:
                print(f'{request.ocr_engine} is not supported')


        return service_pb.GetSupportedLanguagesResponse(
            language_codes= language_codes
        )


def serve():

    port = "23456"
    server = grpc.server( futures.ThreadPoolExecutor( max_workers=10 ) )
    servicer = Service( server )
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
    logging.basicConfig()
    serve()