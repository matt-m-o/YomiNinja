rmdir .\\dist\\win32\\x64\\py_ocr_service\\ /S /Q

xcopy .\\python\\win32\\x64\\ .\\dist\\win32\\x64\\py_ocr_service\\python\\ /e /I /Y

xcopy .\\models\\comic_text_detector\\ .\\dist\\win32\\x64\\py_ocr_service\\models\\comic_text_detector\\ /e /Y
xcopy .\\src\\ .\\dist\\win32\\x64\\py_ocr_service\\src\\ /e /I /Y 
xcopy .\\run.bat .\\dist\\win32\\x64\\py_ocr_service\\src\\run.bat /Y