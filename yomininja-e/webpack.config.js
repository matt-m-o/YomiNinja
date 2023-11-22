const path = require('path');

module.exports = {
    entry: {
        preload: './main/electron-src/preload.js',
    },
    target: 'electron-preload',
    output: {
        filename: 'preload.js',
        path: path.join(__dirname, './main/electron-src'),
    },
    resolve: {
            extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {             
                exclude: /node_modules/,
            },
        ],
    },
};
