const path = require('path');

module.exports = {
    mode: 'development',
    entry: './docs/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'docs'),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                'style-loader',
                'css-loader',
                ],
            },
        ],
    },
    resolve: {
        extensions: [
          '.ts', '.js',
        ],
    },
    devtool: 'inline-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, 'docs'),
        },
    },
    externals: {
        'mapbox-gl': 'mapboxgl'
    }
};