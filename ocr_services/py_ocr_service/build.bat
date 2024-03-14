pyinstaller --noconfirm --onedir --console --collect-data "manga_ocr" --collect-data "unidic_lite" --python-option "u" ./src/py_ocr_service.py
xcopy .\\models\\ .\\dist\\models\\ /e /Y

