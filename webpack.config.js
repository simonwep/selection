const {version} = require('./package');
const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.ts',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'selection.min.js',
        library: 'SelectionArea',
        libraryExport: 'default',
        libraryTarget: 'umd'
    },

    resolve: {
        extensions: ['.js', '.ts'],
        alias: {
            '@utils': path.resolve('./src/utils')
        }
    },

    module: {
        rules: [
            {
                test: /\.[jt]s$/,
                use: [
                    {
                        loader:'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }
                ]
            }
        ]
    },

    devServer: {
        dev: {
            publicPath: '/dist'
        },
        host: '0.0.0.0',
        port: 3003
    },

    plugins: [
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(version)
        })
    ]
};
