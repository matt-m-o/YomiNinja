 #!/bin/bash
 
rm -rf ./dist/linux/x64/py_ocr_service
mkdir -p ./dist/linux/x64/py_ocr_service/

mkdir -p ./dist/linux/x64/py_ocr_service/python
cp -r ./python/linux/x64/* ./dist/linux/x64/py_ocr_service/python

mkdir -p ./dist/linux/x64/py_ocr_service/models
cp -r ./models/comic_text_detector ./dist/linux/x64/py_ocr_service/models/
cp -r ./src ./dist/linux/x64/py_ocr_service/