import os
import torch
from manga_ocr import MangaOcr
import cv2
import numpy as np
from typing import List, Dict
from ocr_service_pb2 import Result, Box 
from PIL import Image

torch.set_num_threads( os.cpu_count() )

class MangaOcrService:

    manga_ocr: MangaOcr = None

    def init( self ):
        self.manga_ocr = MangaOcr('../models/manga_ocr/')

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
            boxes = self.detect( image )

        for box in boxes:

            text_image = self.crop_image( image, box )
            text = self.manga_ocr( text_image )

            results.append(
                Result(
                    box=box,
                    text=text
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
    
    def detect( self, image: np.ndarray ) -> List[ Box ]:
        # TODO
        return []
    
    def update_settings( self, cpu_threads ):
        torch.set_num_threads( cpu_threads or os.cpu_count() )