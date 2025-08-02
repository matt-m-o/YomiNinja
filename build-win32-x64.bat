@echo off
REM Exit immediately if a command exits with a non-zero status
setlocal enabledelayedexpansion
set ERRORLEVEL=

REM Change to the directory and run the build script
pushd ocr_services\py_ocr_service
call build-win32-x64.bat
if errorlevel 1 exit /b %errorlevel%
popd

REM Create the target directory if it doesn't exist
if not exist bin\win32\x64 (
    mkdir bin\win32\x64
)

REM Remove the old directory
if exist bin\win32\x64\py_ocr_service (
    rmdir /s /q bin\win32\x64\py_ocr_service
)

REM Copy the built files
xcopy .\ocr_services\py_ocr_service\dist\win32\x64\py_ocr_service\ .\bin\win32\x64\py_ocr_service /e /I /Y

REM Build the Electron app
pushd yomininja-e
call npm run dist
popd

pause