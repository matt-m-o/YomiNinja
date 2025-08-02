.\cuda.venv\Scripts\activate
pyinstaller --noconfirm --onedir --console --collect-data "manga_ocr" --collect-data "unidic_lite" --python-option "u" --distpath ./dist_cuda ./src/py_ocr_service.py
xcopy .\\models\\ .\\dist_cuda\\models\\ /e /Y