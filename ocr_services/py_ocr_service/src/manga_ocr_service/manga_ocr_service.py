import os
import torch
from manga_ocr import MangaOcr
import cv2
import numpy as np
from typing import List, Dict
from ocr_service_pb2 import Result, Box, Vertex, TextLine
from PIL import Image
from .comic_text_detector import ComicTextDetector
from huggingface_hub import snapshot_download, scan_cache_dir

torch.set_num_threads( os.cpu_count() )

class MangaOcrService:

    manga_ocr: MangaOcr = None
    comic_text_detector: ComicTextDetector = None
    recognition_model_id: str = 'kha-white/manga-ocr-base'
    embedded_model_path = '../models/manga_ocr/'


    def __init__(self) -> None:
        self.is_model_downloaded()

    def init( self ):

        if self.embedded_model_exists():
            self.manga_ocr = MangaOcr('../models/manga_ocr/')

        else:
            self.download_model()
            self.manga_ocr = MangaOcr()
        
        self.comic_text_detector = ComicTextDetector()

    def download_model( self ):
        if self.is_model_downloaded():
            return True
        try:
            snapshot_download( repo_id= self.recognition_model_id )
        except:
            return False

    def is_model_downloaded( self ):

        # Verify if embedded model is available
        embedded_model_exists = self.embedded_model_exists()
        cached_model_exists = self.cached_model_exists()

        print(f'embedded_model_exists: {embedded_model_exists}')
        print(f'cached_model_exists: {cached_model_exists}')

        return embedded_model_exists or cached_model_exists
    
    def embedded_model_exists(self):
        return os.path.exists(self.embedded_model_path+'pytorch_model.bin')

    def cached_model_exists( self ):
        cache_info = scan_cache_dir()
        cached_models = [repo.repo_id for repo in cache_info.repos]

        return self.recognition_model_id in cached_models 

    # OCR pipeline ( detect -> crop -> recognize )
    def recognize(
        self,
        image: np.ndarray,
        boxes: List[ Box ] = []
    ) -> List[ Result ]:
        
        if not self.manga_ocr:
            self.init()

        results: List[ Result ] = []

        if len(boxes) == 0:
            text_blocks = self.detect( image )

            for block_idx, block in enumerate(text_blocks):
                # print(f'\nProcessing text block {block_idx+1} of {len(text_blocks)}')
                
                for line_idx, line in enumerate(block.text_lines):
                    line_image = self.crop_image( image, line.box )
                    line.content = self.manga_ocr( line_image )

            return text_blocks

        # print(f'\n')

        for block_idx, box in enumerate(boxes):
            # print(f'\nProcessing text block {box_idx+1} of {len(boxes)}')
            line_image = self.crop_image( image, box )

            line = TextLine(
                box=box,
                content=self.manga_ocr( line_image )
            )

            results.append(
                Result(
                    box=box,
                    text_lines=[line]
                )
            )

        return results
    

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
    
    def detect( self, image: np.ndarray ) -> List[ Result ]:

        detection_result = self.comic_text_detector.detect( image )

        text_blocks: List[Result] = []

        for block in detection_result:
            new_text_block = Result(
                box=self.coordinates_to_box( block.coordinates ),
                text_lines=[],
                is_vertical=block.is_vertical
            )

            for line in block.lines:
                new_text_line = TextLine(
                    box=self.coordinates_to_box( line.coordinates ),
                    content= ''
                )
                new_text_block.text_lines.append( new_text_line )

            text_blocks.append( new_text_block )

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