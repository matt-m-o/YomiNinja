#!/bin/bash
set -e  # Exit on error

# Run the build script from within its own directory
(
    cd ./ocr_services/py_ocr_service/
    ./build-linux-x64.sh
)

mkdir -p ./bin/linux/x64
rm -rf ./bin/linux/x64/py_ocr_service
mv ./ocr_services/py_ocr_service/dist/linux/x64/* ./bin/linux/x64/

cd yomininja-e/
npm run dist