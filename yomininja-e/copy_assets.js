const fs = require('fs');

// Proto files
fs.cpSync(
    './grpc/protos',
    './main/grpc/protos',
    { recursive: true }
);