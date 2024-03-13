pyinstaller --noconfirm --onedir --console --upx-dir ./upx/ --collect-data "manga_ocr" --collect-data "unidic_lite" ./src/py_ocr_service.py
xcopy .\\data\\ .\\dist\\data\\ /e /Y
xcopy .\\models\\ .\\dist\\models\\ /e /Y

