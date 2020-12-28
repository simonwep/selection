const TerserPlugin = require('terser-webpack-plugin');
const {version} = require('./package');
const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.ts',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'selection.min.js',
        library: 'Selection',
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
                    'ts-loader',
                    'babel-loader'
                ]
            }
        ]
    },

    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: 'selection.min.js.map'
        }),

        new webpack.BannerPlugin({
            banner: `Selectionjs ${version} MIT | https://github.com/Simonwep/selection`
        }),

        new webpack.DefinePlugin({
            VERSION: JSON.stringify(version)
        })
    ],

    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    mangle: {
                        properties: {
                            regex: /^_/
                        }
                    }
                }
            })
        ]
    }
};
