#/bin/sh
pyinstaller --noconfirm --onedir --console --collect-data "manga_ocr" --collect-data "unidic_lite" --python-option "u" --target-arch "x86_64" ./src/py_ocr_service.py