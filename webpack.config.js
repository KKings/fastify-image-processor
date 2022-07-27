const path = require('path');

const config = {

    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'worker.bundle.js',
    },
    target: 'node',
    mode: 'production',
    optimization: {
        usedExports: true,
    },
    externals: [
        "child_process",
        "dns",
        "net",
        "tls",
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    plugins: [],
};

module.exports = config;