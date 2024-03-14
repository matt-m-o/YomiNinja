from concurrent import futures
import logging
import grpc
from ocr_service_pb2 import Result
import ocr_service_pb2 as service_pb
import ocr_service_pb2_grpc as service_grpc
from manga_ocr_service.manga_ocr_service import MangaOcrService
import base64
from io import BytesIO
from PIL import Image
import numpy as np
from typing import List


class Service( service_grpc.OCRServiceServicer ):

    manga_ocr_service = MangaOcrService()

    def RecognizeBase64( self, request: service_pb.RecognizeBase64Request, context ):

        image_data = base64.b64decode( request.base64_image )
        image = Image.open( BytesIO(image_data) )

        results: List[Result] = []

        match request.ocr_engine:
            case 'MangaOCR':
                results = self.manga_ocr_service.recognize( np.array( image ), request.boxes )
            case _:
                results = self.manga_ocr_service.recognize( np.array( image ), request.boxes )
                print(f'{request.ocr_engine} is not supported')


        return service_pb.RecognizeDefaultResponse(
            context_resolution={
                'width': image.width,
                'height': image.height
            },
            id=request.id,
            results=results
        )


def serve():
    port = "23456"
    server = grpc.server( futures.ThreadPoolExecutor( max_workers=10 ) )
    service_grpc.add_OCRServiceServicer_to_server( Service(), server )

    server.add_insecure_port("[::]:" + port)
    server.start()

    server_data = { "server_address": f"0.0.0.0:{port}" }

    server_info = f'[INFO-JSON]:{server_data}'
    print( server_info.replace("'", '"') )

    server.wait_for_termination()


if __name__ == "__main__":
    logging.basicConfig()
    serve()