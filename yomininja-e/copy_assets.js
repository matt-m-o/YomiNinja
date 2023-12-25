const fs = require('fs');

// Proto files
fs.copyFile(
    './grpc/protos/ocr_service.proto',
    './main/grpc/protos/ocr_service.proto',
    () => {}
);