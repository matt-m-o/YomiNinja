import os
import torch
from manga_ocr import MangaOcr
import cv2
import numpy as np
from typing import List, Dict
from ocr_service_pb2 import Result, Box, Vertex, TextLine, TextRecognitionModel, HardwareAccelerationOption, RecognizeDefaultResponse
from PIL import Image
from .comic_text_detector import ComicTextDetector
from huggingface_hub import snapshot_download, scan_cache_dir
import os
from pathlib import Path
import platform

torch.set_num_threads( os.cpu_count() )

class PartialRecognition:
    image: np.ndarray
    partial_response: RecognizeDefaultResponse

    def __init__( self, image: np.ndarray, partial_response: RecognizeDefaultResponse ):
        self.image = image
        self.partial_response = partial_response

class MangaOcrService:

    manga_ocr: MangaOcr = None
    comic_text_detector: ComicTextDetector = None
    recognition_model_id: str = 'kha-white/manga-ocr-base'
    embedded_model_path = '../models/manga_ocr/'
    custom_model_path = None

    partial_recognitions: Dict[ str, PartialRecognition ] = {}

    def __init__(self) -> None:
        self.is_model_downloaded()

    def init( self ):

        custom_model_exists = self.custom_model_exists()

        if not custom_model_exists:
            custom_model_exists = self.download_model()

        if custom_model_exists and self.custom_model_path:
            self.manga_ocr = MangaOcr( self.custom_model_path )
        
        else:
            self.manga_ocr = MangaOcr( self.recognition_model_id )

        self.comic_text_detector = ComicTextDetector()

    def download_model( self ) -> bool:
        if self.custom_model_exists():
            return True
        try:
            snapshot_download(
                repo_id= self.recognition_model_id,
                local_dir= self.get_custom_model_path()
            )
            return True
        except Exception as error:
            print(error)
            return False

    def is_model_downloaded( self ):

        # Verify if model is available
        custom_model_exists = self.custom_model_exists()
        embedded_model_exists = self.embedded_model_exists()
        cached_model_exists = self.cached_model_exists()

        # print(f'embedded_model_exists: {embedded_model_exists}')
        # print(f'cached_model_exists: {cached_model_exists}')

        return custom_model_exists or embedded_model_exists or cached_model_exists
    
    def embedded_model_exists(self):
        return os.path.exists( self.embedded_model_path+'pytorch_model.bin' )

    def cached_model_exists( self ):
        cache_info = scan_cache_dir()
        cached_models = [repo.repo_id for repo in cache_info.repos]

        return self.recognition_model_id in cached_models
    
    def custom_model_exists(self):
        bin_path = str( Path(self.get_custom_model_path()) / 'pytorch_model.bin' )
        return os.path.exists( bin_path )
    
    def get_custom_model_path(self) -> str:
        try:
            MODELS_PATH = os.environ['MODELS_PATH']
            self.custom_model_path = str( Path(MODELS_PATH) / 'manga_ocr' )
            return self.custom_model_path

        except KeyError:
            print("Env variable MODELS_PATH is not set.")
            
        return self.embedded_model_path

    # OCR pipeline ( detect -> crop -> recognize )
    def recognize(
        self,
        image: Image.Image,
        request_id: str,
        boxes: List[ Box ] = [],
        detection_only: bool = False # skip recognition and hold data
    ) -> RecognizeDefaultResponse:
        
        if not self.manga_ocr:
            self.init()
    
        if detection_only:
            pass # self.remove_old_recognitions()


        arr_image = np.array( image )

        text_blocks: List[ Result ] = []

        if len(boxes) == 0:
            text_blocks = self.detect( arr_image )

            if not detection_only:
                for block_idx, block in enumerate(text_blocks):
                    # print(f'\nProcessing text block {block_idx+1} of {len(text_blocks)}')
                    
                    for line_idx, line in enumerate( block.text_lines ):
                        line_image = self.crop_image( arr_image, line.box )
                        line.content = self.manga_ocr( line_image )

                    block.recognition_state = "RECOGNIZED"

        else:
            for block_idx, box in enumerate(boxes):
                # print(f'\nProcessing text block {box_idx+1} of {len(boxes)}')
                line_image = self.crop_image( arr_image, box )

                line = TextLine(
                    box=box,
                    content=self.manga_ocr( line_image )
                )

                text_blocks.append(
                    Result(
                        box=box,
                        text_lines=[line],
                        recognition_state= "RECOGNIZED"
                    )
                )
        
        response = RecognizeDefaultResponse(
                context_resolution= {
                    'width': image.width,
                    'height': image.height
                },
                id= request_id,
                results= text_blocks
            )
        
        if detection_only:
            self.add_partial_recognition(
                PartialRecognition(
                    image= arr_image,
                    partial_response= response
                )
            )

        return response
    
    def recognize_selective(
        self,
        request_id: str,
        image: Image.Image = None,
        result_ids: List[str] = []
    ) -> RecognizeDefaultResponse | None:
        
        if not self.manga_ocr:
            self.init()

        previous_recognition = self.partial_recognitions.get( request_id )

        if not previous_recognition:
            pass # self.previous_recognition.Clear()
        
        arr_image: np.ndarray = None
        response: RecognizeDefaultResponse

        if image:
            arr_image = np.array( image )
            text_blocks = self.detect( arr_image )

            response = RecognizeDefaultResponse(
                context_resolution= {
                    'width': image.width,
                    'height': image.height
                },
                id= request_id,
                results= text_blocks
            )

        if previous_recognition and not image:
            response = previous_recognition.partial_response
            arr_image = previous_recognition.image

        if result_ids and len(result_ids) > 0:

            for block in response.results:
                
                if block.id not in result_ids or block.recognition_state == 'RECOGNIZED':
                    continue

                for line in block.text_lines:

                    if ( bool(line.content) ):
                        continue

                    line_image = self.crop_image( previous_recognition.image, line.box )
                    line.content = self.manga_ocr( line_image )
                
                block.recognition_state = 'RECOGNIZED'
        
        self.add_partial_recognition(
                PartialRecognition(
                    image= arr_image,
                    partial_response= response
                )
            )

        return response

    
    def add_partial_recognition( self, recognition: PartialRecognition ):

        id = recognition.partial_response.id
        self.partial_recognitions[id] = recognition

        if len(self.partial_recognitions) > 20:
            oldest_key = next( iter(self.partial_recognitions) )
            del self.partial_recognitions[ oldest_key ]

    def crop_image( self, image: np.ndarray, box: Box ) -> Image.Image:

        points = np.array(
            [
                [ box.top_left.x, box.top_left.y ],
                [ box.top_right.x, box.top_right.y ],
                [ box.bottom_right.x, box.bottom_right.y ],
                [ box.bottom_left.x, box.bottom_left.y ]
            ],
            dtype=np.float32
        )

        # Get the bounding box for the region of interest
        rect = cv2.boundingRect( points )
        x, y, w, h = rect

        # Perspective transform to extract the region of interest
        perspective_matrix = cv2.getPerspectiveTransform(
            points,
            np.array(
                [
                    [0, 0],
                    [w, 0],
                    [w, h],
                    [0, h]
                ],
                dtype= np.float32
            )
        )

        result = cv2.warpPerspective( image, perspective_matrix, (w, h) )
    
        # cv2.imshow('result', result)
        # cv2.waitKey(0)
        # cv2.destroyAllWindows()

        return self.cv_mat_to_pil_image(result)

    def cv_mat_to_pil_image( self, image ) -> Image.Image:
        return Image.fromarray(
                   cv2.cvtColor( image, cv2.COLOR_BGR2RGB )
                )
    
    def detect(
        self,
        image: np.ndarray,
    ) -> List[ Result ]:

        detection_result = self.comic_text_detector.detect( image )

        text_blocks: List[Result] = []

        for block_idx, block in enumerate(detection_result):
            new_text_block = Result(
                box= self.coordinates_to_box( block.coordinates ),
                text_lines= [],
                is_vertical= block.is_vertical,
                id= str(block_idx),
                recognition_state= "DETECTED"
            )

            for line in block.lines:
                new_text_line = TextLine(
                    box=self.coordinates_to_box( line.coordinates ),
                    content= ''
                )
                new_text_block.text_lines.append( new_text_line )

            text_blocks.append( new_text_block )

            block_idx += 1

        return text_blocks

    def update_settings( self, cpu_threads ):
        torch.set_num_threads( cpu_threads or os.cpu_count() )

    def coordinates_to_box( self, coordinates: List ) -> Box:
        points = [ [int(x), int(y)] for x, y in coordinates ]
        return Box(
            top_left= Vertex( x=points[0][0], y=points[0][1] ),
            top_right= Vertex( x=points[1][0], y=points[1][1] ),
            bottom_right= Vertex( x=points[2][0], y=points[2][1] ),
            bottom_left= Vertex( x=points[3][0], y=points[3][1] )
        )
    
    def get_supported_models(self) -> List[TextRecognitionModel]:
        model = TextRecognitionModel(
            name = self.recognition_model_id,
            language_codes = ['ja-JP'],
            is_installed = self.is_model_downloaded()
        )
        return [ model ]
    
    def install_model(self, name: str) -> bool:
        return self.download_model()
    
    def get_hardware_acceleration_options(self) -> List[HardwareAccelerationOption]:

        os_platform = platform.system().lower()  
        base_command = 'pip install torch torchvision'

        installed_cuda_version = torch.version.cuda
        installed_hip_version = torch.version.hip
        is_mps_available = torch.backends.mps.is_available()
        is_cuda_available = torch.cuda.is_available()

        using_cpu = not is_cuda_available and not is_mps_available and not installed_hip_version #torch.tensor(0).device.type == 'cpu'
    
        linux_opts_dict = [
            {
                "compute_platform": "CPU",
                "install_command": "--index-url https://download.pytorch.org/whl/cpu",
            },
            {
                "compute_platform": "CUDA",
                "compute_platform_version": "11.8",
                "install_command": "--index-url https://download.pytorch.org/whl/cu118"
            },
            {
                "compute_platform": "CUDA",
                "compute_platform_version": "12.6",
                "install_command": "--index-url https://download.pytorch.org/whl/cu126"
            },
            {
                "compute_platform": "CUDA",
                "compute_platform_version": "12.8",
                "install_command": "--index-url https://download.pytorch.org/whl/cu128"
            },
            {
                "compute_platform": "ROCm",
                "compute_platform_version": "6.3",
                "install_command": "--index-url https://download.pytorch.org/whl/rocm6.3"
            }
        ]

        mac_opts_dict = [
            {
                "backend": "Torch",
                "compute_platform": "MPS",
                "install_command": "--index-url https://download.pytorch.org/whl/cpu",
                "installed": os_platform == 'darwin'
            },
        ]
        
        for option in linux_opts_dict:

            is_installed = False
            version = option.get('compute_platform_version')

            if option['compute_platform'] == 'CPU':
                is_installed = using_cpu

            elif option['compute_platform'] == 'CUDA':
                is_installed = version == installed_cuda_version

            elif option['compute_platform'] == 'ROCm':
                is_installed = version == installed_hip_version

            option['backend'] = 'Torch'
            option['installed'] = is_installed
            option['install_command'] = base_command +' '+ option['install_command']

        if os_platform == 'linux':
            return [
                HardwareAccelerationOption(
                    backend= 'Torch',
                    compute_platform= option['compute_platform'],
                    compute_platform_version= option.get('compute_platform_version'),
                    installed= bool( option.get('installed') ),
                    install_command= base_command +' '+ option['install_command'],
                )
            ]
        
        if os_platform == 'windows':
            return [
                HardwareAccelerationOption(
                    backend= option['backend'],
                    compute_platform= option['compute_platform'],
                    compute_platform_version= option.get('compute_platform_version'),
                    installed= bool( option.get('installed') ),
                    install_command= option['install_command'],
                ) for option in linux_opts_dict if option['compute_platform'] != 'ROCm'
            ]
        
        if os_platform == 'darwin':
            return [
                HardwareAccelerationOption(
                    backend= option.get('backend'),
                    compute_platform= option.get('compute_platform'),
                    compute_platform_version= option.get('compute_platform_version'),
                    installed= bool( option.get('installed')),
                    install_command= base_command +' '+ option['install_command'],
                ) for option in mac_opts_dict
            ]
        
        
        return []
                