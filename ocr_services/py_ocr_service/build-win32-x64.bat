rmdir .\\dist\\py_ocr_service\\ /S /Q
xcopy .\\.python\\win32\\x64\\ .\\dist\\py_ocr_service\\python\\ /e /I /Y
xcopy .\\models\\ .\\dist\\py_ocr_service\\models\\ /e /Y
xcopy .\\src\\ .\\dist\\py_ocr_service\\src\\ /e /I /Y 