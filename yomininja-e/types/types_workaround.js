const fs = require('fs');

// x11 module types
fs.copyFile(
    './types/x11/index.d.ts',
    './node_modules/x11/index.d.ts',
    () => {}
);