const fs = require('fs');

// Proto files
fs.cpSync(
    '../ocr_services/protos',
    './main/grpc/protos',
    { recursive: true }
);